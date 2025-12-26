import { Task } from 'src/modules/tasks/entities/task.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  // Define user entity properties here
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @OneToMany(() => Task, (task) => task.assignee)
  assignee: Task[];

  @ManyToMany(() => Task, (task) => task.participants)
  participant: Task[];
}
