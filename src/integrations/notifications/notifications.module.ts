import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  providers: [EmailService, SmsService, PushService, NotificationsService],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
