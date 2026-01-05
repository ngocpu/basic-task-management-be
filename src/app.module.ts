import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalInterceptor } from './core/interceptor/global.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { OtpModule } from './modules/otp/otp.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './provider/databases/database.module';
import { MailModule } from './provider/mails/mail.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    TasksModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
          ? `.env.${process.env.NODE_ENV}`
          : '.env',
    }),
    OtpModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalInterceptor,
    },
  ],
})
export class AppModule {}
