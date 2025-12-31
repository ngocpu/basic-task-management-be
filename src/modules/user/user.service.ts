import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepositories: UserRepository) {}
  async createUser(createUserDto: CreateUserDto, manager?: EntityManager) {
    // If a transaction manager is provided, use it to perform transactional operations.
    if (manager) {
      const exist = await manager.findOne(User, {
        where: { email: createUserDto.email },
      });
      if (exist) {
        throw new ConflictException('User with this email already exists');
      }
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      const newUser = manager.create(User, {
        ...createUserDto,
        password: hashedPassword,
      });
      return await manager.save(newUser);
    }

    const existUser = await this.userRepositories.findUserByEmail(
      createUserDto.email,
    );
    if (existUser) {
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

  async markVerified(email: string) {
    const user = await this.userRepositories.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isVerified = true;
    return await this.userRepositories.save(user);
  }
}
