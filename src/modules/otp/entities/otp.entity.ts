import { OtpType } from 'src/types/enum';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  email: string;

  @Column({ length: 6 })
  code: string;

  @Column({ type: 'enum', enum: OtpType, default: OtpType.VERIFICATION })
  otpType: OtpType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expireAt: Date;
}
