import { Injectable, Logger } from '@nestjs/common';
import { OtpType } from 'src/types/enum';
import { EntityManager, Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { getOtpCode } from 'src/helper/getOtpCode';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}
  async generateOtp(
    email: string,
    otpType: OtpType,
    manager?: EntityManager,
  ): Promise<string> {
    const otpRepo: Repository<Otp> = manager
      ? manager.getRepository(Otp)
      : this.otpRepository;
    await otpRepo.delete({ email, otpType });
    const newCode = getOtpCode();
    const expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + 10);

    const newOtp = otpRepo.create({
      email,
      code: newCode,
      otpType,
      expireAt,
    });
    await otpRepo.save(newOtp);
    return newCode;
  }

  async validateOtp(
    email: string,
    code: string,
    otpType: OtpType,
  ): Promise<boolean> {
    const otpRecord = await this.otpRepository.findOne({
      where: { email, code, otpType },
    });
    if (!otpRecord) {
      this.logger.debug(
        `No OTP record found for email=${email} code=${code} type=${otpType}`,
      );
      return false;
    }
    const currentTime = new Date();
    this.logger.debug(
      `Found OTP id=${otpRecord.id} expireAt=${otpRecord.expireAt.toISOString()} now=${currentTime.toISOString()}`,
    );
    if (otpRecord.expireAt < currentTime) {
      this.logger.debug('OTP expired, deleting record');
      await this.otpRepository.delete({ email, code, otpType });
      return false;
    }
    this.logger.debug('OTP valid, deleting and returning true');
    await this.otpRepository.delete({ email, code, otpType });
    return true;
  }
}
