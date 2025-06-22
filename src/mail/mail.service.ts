import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { verificationTemplate } from './templates/verification.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { bookingRequestTemplate } from './templates/booking-request.template';
import { bookingStatusTemplate } from './templates/booking-status.template';
import { bookingConfirmationTemplate } from './templates/booking-confirmation.template';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private fromAddress: string;

  constructor(private configService: ConfigService) {
    this.init();
  }

  private init() {
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    const sendGridFromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    const sendGridFromName = this.configService.get<string>('SENDGRID_FROM_NAME');

    if (!sendGridApiKey) {
      console.warn('SENDGRID_API_KEY not found in environment variables. Email service will not work.');
      return;
    }

    this.fromAddress = `"${sendGridFromName}" <${sendGridFromEmail}>`

    this.transporter = createTransport({
      host: 'smtp.sendgrid.net',
      port: 587, // TLS port
      secure: false, // false = TLS, true = SSL
      auth: {
        user: 'apikey', // ← this must be the literal string 'apikey'
        pass: sendGridApiKey,
      },
    });
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not initialized. Please check SENDGRID_API_KEY configuration.');
    }

    const info = await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject,
      html,
    });
  }

  async sendVerificationEmail(to: string, name: string, verificationUrl: string) {
    await this.send(to, 'Verify your ShareNest account', verificationTemplate(name, verificationUrl));
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    await this.send(to, 'Reset your ShareNest password', passwordResetTemplate(name, resetUrl));
  }

  async sendBookingRequestNotification(
    to: string,
    name: string,
    propertyTitle: string,
    tenantName: string,
    dates: { from: string; to: string },
    viewUrl: string,
  ) {
    await this.send(
      to,
      `New Booking Request for ${propertyTitle}`,
      bookingRequestTemplate(name, propertyTitle, tenantName, dates, viewUrl),
    );
  }

  async sendBookingConfirmationToTenant(
    to: string,
    name: string,
    propertyTitle: string,
    dates: { from: string; to: string },
    viewUrl: string,
  ) {
    await this.send(
      to,
      `Booking Request Confirmation: ${propertyTitle}`,
      bookingConfirmationTemplate(name, propertyTitle, dates, viewUrl),
    );
  }

  async sendBookingStatusUpdate(
    to: string,
    name: string,
    propertyTitle: string,
    status: 'approved' | 'rejected',
    dates: { from: string; to: string },
    viewUrl: string,
    landlordContactInfo?: { name: string; phone: string },
    rejectionReason?: string,
  ) {
    const statusText = status === 'approved' ? 'Approved' : 'Declined';
    await this.send(
      to,
      `Booking ${statusText}: ${propertyTitle}`,
      bookingStatusTemplate(name, propertyTitle, status, dates, viewUrl, landlordContactInfo, rejectionReason),
    );
  }
}
