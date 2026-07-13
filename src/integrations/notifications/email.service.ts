import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

const BRAND = {
  dark: '#0A2E25',
  primary: '#1D9E75',
  muted: '#6B7280',
  bodyText: '#374151',
  bg: '#F4F6F5',
  border: '#EEF2F0',
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: Resend | null;
  private readonly from: string;
  private readonly logoUrl: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.client = apiKey ? new Resend(apiKey) : null;
    this.from =
      this.config.get<string>('REMINDER_EMAIL_FROM') ??
      'RehabWise <reminders@rehabwise.online>';

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ??
      'https://www.rehabwise.online';
    this.logoUrl = `${frontendUrl}/pwa-192x192.png`;
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    if (!this.client) {
      this.logger.warn('RESEND_API_KEY not set — skipping email send');
      return;
    }

    try {
      await this.client.emails.send({
        from: this.from,
        to,
        subject,
        text: body,
        html: this.renderTemplate(subject, body),
      });
    } catch (err: any) {
      this.logger.error(`Email send to ${to} failed: ${err.message}`);
    }
  }

  // Wraps a plain-text message (as used by callers today) in a branded HTML
  // shell — a single bare URL on its own line becomes a CTA button, everything
  // else renders as paragraphs. Keeps callers unchanged (they still just pass
  // subject + plain text) while giving every outbound email a consistent,
  // professional look.
  private renderTemplate(subject: string, body: string): string {
    const escape = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const urlPattern = /(https?:\/\/[^\s]+)/g;

    const content = body
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const escaped = escape(block);
        const urls = block.match(urlPattern);

        if (urls?.length === 1 && block.trim() === urls[0]) {
          return `
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
              <tr>
                <td style="border-radius:8px;background:${BRAND.primary};">
                  <a href="${escape(urls[0])}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                    Continue
                  </a>
                </td>
              </tr>
            </table>`;
        }

        const withLinks = escaped.replace(
          urlPattern,
          (url) => `<a href="${url}" style="color:${BRAND.primary};">${url}</a>`,
        );

        return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.bodyText};">${withLinks.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');

    return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid ${BRAND.border};">
                <img src="${this.logoUrl}" alt="RehabWise" width="40" height="40" style="display:inline-block;border-radius:10px;" />
                <div style="margin-top:10px;font-size:20px;font-weight:700;color:${BRAND.dark};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                  Rehab<span style="color:${BRAND.primary};">Wise</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:18px;font-weight:600;color:${BRAND.dark};">${escape(subject)}</h1>
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#FAFBFA;text-align:center;">
                <p style="margin:0;font-size:12px;color:${BRAND.muted};">
                  &copy; ${new Date().getFullYear()} RehabWise &middot; Smart rehab. Your pace. Your home.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }
}
