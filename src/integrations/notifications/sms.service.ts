import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey?: string;
  private readonly senderId: string;
  private readonly sendUrl: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('TERMII_KEY');
    this.senderId = this.config.get<string>('TERMII_FROM') ?? 'RehabWise';
    this.sendUrl =
      this.config.get<string>('TERMII_URL') ?? 'https://api.ng.termii.com/api/sms/send';
  }

  async send(to: string, message: string): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn('TERMII_KEY not set — skipping SMS send');
      return;
    }

    try {
      const res = await fetch(this.sendUrl, {
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
