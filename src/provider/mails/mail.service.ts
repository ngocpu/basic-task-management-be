import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendRegisterOtp(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your account',
      template: 'confirmation',
      context: { name: email, code },
    });
  }

  async sendForgotPasswordOtp(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: 'forgot-password',
      context: { name: email, code },
    });
  }
}
