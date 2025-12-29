import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expireAt: Date;
}
