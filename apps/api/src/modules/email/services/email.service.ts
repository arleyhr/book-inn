import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASSWORD');
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = this.configService.get<number>('EMAIL_PORT');

    if (!user || !pass) {
      this.logger.warn('Email credentials not set. Email functionality will be limited.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: {
        user,
        pass,
      },
    });

    this.fromEmail = user || 'no-reply@book-inn.onrender.com';
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
