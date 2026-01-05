import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { MailService } from 'src/provider/mails/mail.service';
import { OtpType } from 'src/types/enum';
import { DataSource } from 'typeorm';
import { OtpService } from '../otp/otp.service';
import { UserService } from '../user/user.service';
import { LoginUserDTO, RegisterUserDTO } from './dto/create-auth.dto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}
  async validateUser(
    email: string,
    password: string,
  ): Promise<{ email: string; id: number } | null> {
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (isMatchPassword) {
        return { email: user.email, id: user.id };
      }
    }
    return null;
  }
  async registerUser(registerDto: RegisterUserDTO) {
    const emailUser = await this.userService.findUserByEmail(registerDto.email);
    if (emailUser) {
      throw new ConflictException('User with this email already exists');
    }

    let generatedCode: string | undefined;

    try {
      await this.dataSource.transaction(async (manager) => {
        const user = await this.userService.createUser(registerDto, manager);

        generatedCode = await this.otpService.generateOtp(
          user.email,
          OtpType.VERIFICATION,
          manager,
        );
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Database error during registration',
        error,
      );
    }

    if (!generatedCode) {
      throw new InternalServerErrorException(
        'Failed to generate OTP during registration',
      );
    }

    try {
      await this.mailService.sendRegisterOtp(registerDto.email, generatedCode);
    } catch (mailError) {
      console.error('Mail system error:', mailError);
      return {
        message:
          'Account created, but we couldn’t send the email. Please request a resend.',
        status: 'PENDING_EMAIL',
      };
    }

    return {
      message:
        'Registration successful! Please check your email for the OTP code.',
    };
  }

  async activateUser(email: string, otpCode: string, response: Response) {
    const ok = await this.otpService.validateOtp(
      email,
      otpCode,
      OtpType.VERIFICATION,
    );
    if (!ok) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    const user = await this.userService.markVerified(email);

    // create JWT tokens
    this.tokenService.setTokenCookie(email, user.id, response);

    return {
      message: `User ${email} activated successfully.`,
      user_data: { email: user.email, id: user.id },
    };
  }
  // login service
  async loginUser(loginUserDto: LoginUserDTO, response: Response) {
    const validUser = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!validUser) {
      throw new UnauthorizedException('Invalid email or password');
    }
    this.tokenService.setTokenCookie(validUser.email, validUser.id, response);
    return {
      message: 'User logged in successfully',
      user_data: validUser,
    };
  }

  logoutUser(response: Response) {
    response.clearCookie('access_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/' });
    return {
      message: 'User logged out successfully',
    };
  }
}
