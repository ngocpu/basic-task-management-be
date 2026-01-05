import { IsEmail, IsString } from 'class-validator';

export class RegisterUserDTO {
  @IsString()
  name: string;
  @IsString()
  password: string;
  @IsString()
  @IsEmail()
  email: string;
}
export class LoginUserDTO {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}
