import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { getOtpCode } from 'src/helper/getOtpCode';
import { MailService } from 'src/provider/mails/mail.service';
import { LoginUserDTO, RegisterUserDTO } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
    await this.userService.createUser(registerDto);
    const otpCode = getOtpCode();
    await this.mailService.sendMail(
      registerDto.email,
      'Verify your email',
      `Your OTP code is: ${otpCode}`,
    );
    return {
      message: 'User registered successfully. Please verify your email.',
    };
  }

  async activateUser(email: string, otpCode: string) {
    // Logic to activate user using OTP code
    return {
      message: `User with email ${email} activated successfully.`,
    };
  }

  async loginUser(user: LoginUserDTO & { id: number }) {
    const validUser = await this.validateUser(user.email, user.password);
    if (!validUser) {
      throw new ConflictException('Invalid email or password');
    }
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      ...validUser,
    };
  }
}
