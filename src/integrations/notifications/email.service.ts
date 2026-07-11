import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: Resend | null;
  private readonly from: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.client = apiKey ? new Resend(apiKey) : null;
    this.from =
      this.config.get<string>('REMINDER_EMAIL_FROM') ??
      'RehabWise <reminders@rehabwise.online>';
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    if (!this.client) {
      this.logger.warn('RESEND_API_KEY not set — skipping email send');
      return;
    }

    try {
      await this.client.emails.send({ from: this.from, to, subject, text: body });
    } catch (err: any) {
      this.logger.error(`Email send to ${to} failed: ${err.message}`);
    }
  }
}
