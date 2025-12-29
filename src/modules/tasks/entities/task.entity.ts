import { User } from 'src/modules/user/entities/user.entity';
import { TaskStatus } from 'src/types/enum';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.OPEN })
  status: TaskStatus;

  @ManyToOne(() => User, (user) => user.createdTasks, { eager: false })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne(() => User, (user) => user.assignedTasks, { eager: false })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;
  @ManyToMany(() => User, (user) => user.participant, { eager: false })
  @JoinTable({
    name: 'task_participants',
    joinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  participants: User[];
}
