export const bookingStatusTemplate = (
  name: string,
  propertyTitle: string,
  status: 'approved' | 'rejected',
  dates: { from: string; to: string },
  viewUrl: string,
  landlordContactInfo?: { name: string; phone: string },
  rejectionReason?: string,
) => {
  const statusText = status === 'approved' ? 'Approved' : 'Declined'
  const statusColor = status === 'approved' ? '#e8f5e9' : '#ffebee'
  
  let contactInfoHtml = ''
  if (status === 'approved' && landlordContactInfo) {
    contactInfoHtml = `
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="font-weight: bold; margin-bottom: 10px;">Landlord Contact Information:</p>
        <p><strong>Name:</strong> ${landlordContactInfo.name}</p>
        <p><strong>Phone:</strong> ${landlordContactInfo.phone}</p>
      </div>
    `
  }

  let rejectionReasonHtml = ''
  if (status === 'rejected' && rejectionReason) {
    rejectionReasonHtml = `
      <div style="background-color: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="font-weight: bold; margin-bottom: 10px;">Reason for Rejection:</p>
        <p>${rejectionReason}</p>
      </div>
    `
  }
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50">Booking ${statusText}</h2>
      <p>Hello ${name},</p>
      <p>Your booking request for <strong>${propertyTitle}</strong> has been <strong>${status}</strong>.</p>
      
      <div style="background-color: ${statusColor}; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p><strong>Dates:</strong> ${dates.from} to ${dates.to}</p>
      </div>
      
      ${contactInfoHtml}
      ${rejectionReasonHtml}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${viewUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Booking Details
        </a>
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px;">
        <p>&copy ${new Date().getFullYear()} ShareNest. All rights reserved.</p>
      </div>
    </div>
  `
} 