import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: this.configService.get('EMAIL_PORT') === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationUrl: string,
  ): Promise<void> {
    const emailFrom = this.configService.get('EMAIL_FROM');
    
    await this.transporter.sendMail({
      from: `"ShareNest" <${emailFrom}>`,
      to,
      subject: 'Verify your ShareNest account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome to ShareNest, ${name}!</h2>
          <p>Thank you for joining ShareNest. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          
          <p>This link will expire in 24 hours.</p>
          
          <p>If you didn't sign up for ShareNest, you can safely ignore this email.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} ShareNest. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    const emailFrom = this.configService.get('EMAIL_FROM');
    
    await this.transporter.sendMail({
      from: `"ShareNest" <${emailFrom}>`,
      to,
      subject: 'Reset your ShareNest password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Reset Your Password</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your ShareNest password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          
          <p>This link will expire in 1 hour.</p>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} ShareNest. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  }

  async sendBookingRequestNotification(
    to: string,
    name: string,
    propertyTitle: string,
    tenantName: string,
    dates: { from: string; to: string },
    viewUrl: string,
  ): Promise<void> {
    const emailFrom = this.configService.get('EMAIL_FROM');
    
    await this.transporter.sendMail({
      from: `"ShareNest" <${emailFrom}>`,
      to,
      subject: `New Booking Request for ${propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Booking Request</h2>
          <p>Hello ${name},</p>
          <p>You have received a new booking request for your property <strong>${propertyTitle}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Tenant:</strong> ${tenantName}</p>
            <p><strong>Dates:</strong> ${dates.from} to ${dates.to}</p>
          </div>
          
          <p>Please review and respond to this request as soon as possible.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View Booking Request
            </a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} ShareNest. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  }

  async sendBookingStatusUpdate(
    to: string,
    name: string,
    propertyTitle: string,
    status: 'approved' | 'rejected',
    dates: { from: string; to: string },
    viewUrl: string,
    landlordContactInfo?: { name: string; phone: string },
  ): Promise<void> {
    const emailFrom = this.configService.get('EMAIL_FROM');
    const statusText = status === 'approved' ? 'Approved' : 'Declined';
    
    let contactInfoHtml = '';
    if (status === 'approved' && landlordContactInfo) {
      contactInfoHtml = `
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="font-weight: bold; margin-bottom: 10px;">Landlord Contact Information:</p>
          <p><strong>Name:</strong> ${landlordContactInfo.name}</p>
          <p><strong>Phone:</strong> ${landlordContactInfo.phone}</p>
        </div>
      `;
    }
    
    await this.transporter.sendMail({
      from: `"ShareNest" <${emailFrom}>`,
      to,
      subject: `Booking ${statusText}: ${propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Booking ${statusText}</h2>
          <p>Hello ${name},</p>
          <p>Your booking request for <strong>${propertyTitle}</strong> has been <strong>${status}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Dates:</strong> ${dates.from} to ${dates.to}</p>
          </div>
          
          ${contactInfoHtml}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View Booking Details
            </a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} ShareNest. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  }
}