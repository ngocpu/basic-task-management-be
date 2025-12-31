import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { MailService } from 'src/provider/mails/mail.service';
import { OtpType } from 'src/types/enum';
import { DataSource } from 'typeorm';
import { OtpService } from '../otp/otp.service';
import { UserService } from '../user/user.service';
import { RegisterUserDTO } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (isMatchPassword) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
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
    const payload = { username: user.email, sub: user.id };

    // expirations (fallbacks)
    const accessExpireMinutes = Number.parseInt(
      process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '15',
      10,
    );
    const refreshExpireDays = Number.parseInt(
      process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7',
      10,
    );

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${accessExpireMinutes}m`,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `${refreshExpireDays}d`,
    });

    const isProd = process.env.NODE_ENV === 'production';
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || 15) * 60 * 1000,
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge:
        Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS || 7) *
        24 *
        60 *
        60 *
        1000,
    });

    return {
      message: `User ${email} activated successfully.`,
      user: { email: user.email, id: user.id },
    };
  }

  // async loginUser(user: LoginUserDTO & { id: number }) {
  //   const validUser = await this.validateUser(user.email, user.password);
  //   if (!validUser) {
  //     throw new ConflictException('Invalid email or password');
  //   }
  //   const payload = { username: user.email, sub: user.id };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //     ...validUser,
  //   };
  // }
}
