import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepositories: UserRepository) {}
  async createUser(createUserDto: CreateUserDto) {
    const exsitUser = await this.userRepositories.findUserByEmail(
      createUserDto.email,
    );
    if (exsitUser) {
      throw new ConflictException('User with this email already exists');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const newUser = await this.userRepositories.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepositories.save(newUser);
  }

  async findAllUsers() {
    return await this.userRepositories.findAllUsers();
  }

  async findUserById(id: number) {
    return await this.userRepositories.findUserById(id);
  }
  async findUserByEmail(email: string) {
    return await this.userRepositories.findUserByEmail(email);
  }

  async deleteUser(id: number) {
    await this.userRepositories.deleteUserById(id);
  }
}
