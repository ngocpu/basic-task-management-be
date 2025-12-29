import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendMail(to: string, subject: string, body: string): Promise<void> {
    // Logic to send email
    console.log(
      `Sending email to ${to} with subject "${subject}" and body "${body}"`,
    );
  }
}
