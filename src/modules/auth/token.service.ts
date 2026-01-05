import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
class TokenService {
  constructor(private readonly jwtService: JwtService) {}
  setTokenCookie(email: string, userId: number, response: Response) {
    const tokenPayload = { email, id: userId };
    const accessExpireMinutes = Number.parseInt(
      process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '15',
      10,
    );
    const refreshExpireDays = Number.parseInt(
      process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7',
      10,
    );
    const isProd = process.env.NODE_ENV === 'production';
    const accessToken = this.jwtService.sign(tokenPayload, {
      expiresIn: `${accessExpireMinutes}m`,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      expiresIn: `${refreshExpireDays}d`,
    });
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: accessExpireMinutes * 60 * 1000,
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: refreshExpireDays * 24 * 60 * 60 * 1000,
    });
    return { accessToken, refreshToken };
  }
}
export { TokenService };
