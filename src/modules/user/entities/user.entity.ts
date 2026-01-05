import { Task } from 'src/modules/tasks/entities/task.entity';
import { UserRole } from 'src/types/enum';
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
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Task, (task) => task.creator)
  createdTasks: Task[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks: Task[];

  @ManyToMany(() => Task, (task) => task.participants)
  participant: Task[];
}
