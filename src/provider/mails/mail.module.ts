import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'node:path';
import * as fs from 'node:fs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { Options as SMTPTransportOptions } from 'nodemailer/lib/smtp-transport';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: (() => {
          const host = configService.get<string>('MAIL_HOST');
          const port = Number.parseInt(
            configService.get<string>('MAIL_PORT') || '587',
            10,
          );
          const secure = configService.get<string>('MAIL_SECURE') === 'true';
          const user = configService.get<string>('MAIL_USER');
          const pass = configService.get<string>('MAIL_PASSWORD');
          const transport: SMTPTransportOptions = { host, port, secure };
          if (user && pass) transport.auth = { user, pass };
          return transport;
        })(),
        defaults: {
          from:
            configService.get<string>('MAIL_FROM') ||
            '"No Reply" <noreply@example.com>',
        },
        template: {
          dir: ((): string => {
            const distPath = join(__dirname, 'templates');
            try {
              // prefer dist templates if present
              if (fs.existsSync(distPath)) return distPath;
            } catch (e) {
              console.log(e);
            }
            return join(process.cwd(), 'src/provider/mails/templates');
          })(),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
