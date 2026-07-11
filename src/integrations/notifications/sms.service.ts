import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TERMII_SEND_URL = 'https://api.ng.termii.com/api/sms/send';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey?: string;
  private readonly senderId: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('TERMII_API_KEY');
    this.senderId = this.config.get<string>('TERMII_SENDER_ID') ?? 'RehabWise';
  }

  async send(to: string, message: string): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn('TERMII_API_KEY not set — skipping SMS send');
      return;
    }

    try {
      const res = await fetch(TERMII_SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          from: this.senderId,
          sms: message,
          type: 'plain',
          channel: 'generic',
          api_key: this.apiKey,
        }),
      });

      if (!res.ok) {
        this.logger.error(`Termii SMS to ${to} failed: ${res.status} ${await res.text()}`);
      }
    } catch (err: any) {
      this.logger.error(`SMS send to ${to} failed: ${err.message}`);
    }
  }
}
