import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDTO } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(RegisterUserDTO) {}
