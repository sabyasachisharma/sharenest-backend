import { Injectable } from '@nestjs/common';
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

  constructor() {
    this.init();
  }

  private init() {
    this.fromAddress = `"ShareNest" <neobyteinnovations@gmail.com>`

    this.transporter = createTransport({
      host: 'smtp.sendgrid.net',
      port: 587, // TLS port
      secure: false, // false = TLS, true = SSL
      auth: {
        user: 'apikey', // ← this must be the literal string 'apikey'
        pass: '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',
      },
    });
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
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
