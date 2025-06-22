export const bookingRequestTemplate = (
  name: string,
  propertyTitle: string,
  tenantName: string,
  dates: { from: string; to: string },
  viewUrl: string,
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50">New Booking Request</h2>
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
      <p>&copy ${new Date().getFullYear()} ShareNest. All rights reserved.</p>
    </div>
  </div>
` 