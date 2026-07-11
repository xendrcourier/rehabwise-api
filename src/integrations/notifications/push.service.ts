import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly app: App | null;

  constructor(private config: ConfigService) {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.config
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      this.app = getApps().length
        ? getApps()[0]
        : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    } else {
      this.app = null;
    }
  }

  async send(token: string, title: string, body: string): Promise<void> {
    if (!this.app) {
      this.logger.warn('Firebase credentials not set — skipping push send');
      return;
    }

    try {
      await getMessaging(this.app).send({ token, notification: { title, body } });
    } catch (err: any) {
      this.logger.error(`Push send failed: ${err.message}`);
    }
  }
}
