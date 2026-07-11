import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';

export interface NotifyRecipient {
  email: string;
  phone: string;
  fcm_token?: string | null;
}

export interface NotifyPayload {
  title: string;
  body: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
  ) {}

  // Best-effort fan-out across every channel the recipient has contact info
  // for. Each underlying service swallows its own errors, so one channel
  // failing (or not being configured) never blocks the others.
  async notify(recipient: NotifyRecipient, payload: NotifyPayload): Promise<void> {
    await Promise.all([
      this.emailService.send(recipient.email, payload.title, payload.body),
      this.smsService.send(recipient.phone, payload.body),
      recipient.fcm_token
        ? this.pushService.send(recipient.fcm_token, payload.title, payload.body)
        : Promise.resolve(),
    ]);
  }
}
