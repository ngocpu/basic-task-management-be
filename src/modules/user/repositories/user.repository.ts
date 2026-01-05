import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  // Define repository methods here
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser = this.create(userData);
    return await this.save(newUser);
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.findOne({ where: { email } });
  }
  async findUserById(id: number): Promise<User | null> {
    return await this.findOne({ where: { id } });
  }
  async findAllUsers(): Promise<User[]> {
    return await this.find();
  }
  async deleteUserById(id: number): Promise<void> {
    await this.delete(id);
  }
}
