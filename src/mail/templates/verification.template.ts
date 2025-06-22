export const verificationTemplate = (name: string, verificationUrl: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50">Welcome to ShareNest, ${name}!</h2>
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
      <p>&copy ${new Date().getFullYear()} ShareNest. All rights reserved.</p>
    </div>
  </div>
` 