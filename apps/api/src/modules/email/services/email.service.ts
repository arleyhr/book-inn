import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailPass = this.configService.get<string>('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailPass) {
      this.logger.warn('Gmail credentials not set. Email functionality will be limited.');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    this.fromEmail = gmailUser || 'no-reply@book-inn.onrender.com';
  }

  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
  }) {
    try {
      const { to, subject, html, text, cc, bcc, replyTo } = options;

      const result = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
        text,
        cc,
        bcc,
        replyTo,
      });

      this.logger.log(`Email sent successfully to ${to}. ID: ${result.messageId || 'unknown'}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }
}
