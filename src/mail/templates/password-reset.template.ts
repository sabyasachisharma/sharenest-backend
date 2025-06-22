export const passwordResetTemplate = (name: string, resetUrl: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50">Reset Your Password</h2>
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
      <p>&copy ${new Date().getFullYear()} ShareNest. All rights reserved.</p>
    </div>
  </div>
` 