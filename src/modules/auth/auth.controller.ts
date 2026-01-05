import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO, RegisterUserDTO } from './dto/create-auth.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() userData: RegisterUserDTO) {
    return await this.authService.registerUser(userData);
  }

  @Post('activate')
  async activateUser(
    @Body() body: { email: string; otpCode: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.activateUser(body.email, body.otpCode, res);
  }
  @Post('login')
  async loginUser(
    @Body() loginUserDTO: LoginUserDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.loginUser(loginUserDTO, res);
  }
  @Post('logout')
  logoutUser(@Res({ passthrough: true }) res: Response) {
    return this.authService.logoutUser(res);
  }
}
