import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { Booking } from './entities/booking.entity'
import { Property } from '../properties/entities/property.entity'
import { User } from '../users/entities/user.entity'
import { CreateBookingDto } from './dto/create-booking.dto'
import { PropertiesService } from '../properties/properties.service'
import { UsersService } from '../users/users.service'
import { MailService } from '../mail/mail.service'
import { BookingStatus } from 'src/common/enums/booking-status.enum'

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking)
    private bookingModel: typeof Booking,
    private propertiesService: PropertiesService,
    private usersService: UsersService,
    private mailService: MailService
  ) {}

  private getBookingViewUrl(bookingId: string): string {
    return `${process.env.FRONTEND_URL}/bookings/${bookingId}`
  }

  async create(createBookingDto: CreateBookingDto, tenantId: string): Promise<Booking> {
    Logger.log(`Creating booking for tenant ${tenantId} and  BookingDto ${JSON.stringify(createBookingDto)}`)
    const property = await this.propertiesService.findOne(createBookingDto.propertyId);
  
    if (!property) {
      Logger.error(`Property not found for booking ${JSON.stringify(createBookingDto)}`)
      throw new NotFoundException('Property not found')

    }
  
    if (!property.isActive) {
      Logger.error(`Property is not active for booking ${JSON.stringify(createBookingDto)}`)
      throw new BadRequestException('Property is not available for booking')
    }
  
    const startDate = new Date(createBookingDto.startDate)
    const endDate = new Date(createBookingDto.endDate)
    const today = new Date()
  
    // Normalize times to avoid time-of-day mismatches
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);
  
    // Booking date in the past
    if (startDate < today) {
      Logger.error(`Start date cannot be in the past for booking ${JSON.stringify(createBookingDto)}`)
      throw new BadRequestException('Start date cannot be in the past')
    }
  
    // End date must follow start date
    if (endDate <= startDate) {
      Logger.error(`End date must be after start date for booking ${JSON.stringify(createBookingDto)}`)
      throw new BadRequestException('End date must be after start date');
    }
  
    // Booking must be within property's availability window
    const availableFrom = new Date(property.availableFrom);
    const availableTo = new Date(property.availableTo);
    availableFrom.setUTCHours(0, 0, 0, 0);
    availableTo.setUTCHours(0, 0, 0, 0);
    // we check for availability of the property for the selected dates
    if (startDate < availableFrom || endDate > availableTo) {
      Logger.error(`Booking must be within the property's available range: ${availableFrom.toDateString()} to ${availableTo.toDateString()} for booking ${JSON.stringify(createBookingDto)}`)
      throw new BadRequestException(
        `Booking must be within the property's available range: ${availableFrom.toDateString()} to ${availableTo.toDateString()}`
      );
    }
  
    // Check for overlapping bookings
    const overlappingBookings = await this.bookingModel.findAll({
      where: {
        propertyId: createBookingDto.propertyId,
        status: {
          [Op.in]: [BookingStatus.APPROVED],
        },
        [Op.and]: [
          { startDate: { [Op.lte]: endDate } },
          { endDate: { [Op.gte]: startDate } },
        ],
      },
    });
    
    if (overlappingBookings.length > 0) {
      Logger.error(`Property is not available for the selected dates for booking ${JSON.stringify(createBookingDto)}`)
      throw new BadRequestException('Property is not available for the selected dates')
    }
  
    // Create booking
    const booking = await this.bookingModel.create({
      ...createBookingDto,
      tenantId,
      status: BookingStatus.PENDING,
    })  
    
    Logger.log(`Booking created successfully ${JSON.stringify(booking)}`)
    // Send notification emails
    const tenant = await this.usersService.findOne(tenantId)
    const landlord = await this.usersService.findOne(property.ownerId)
    
    const dateRange = {
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0],
    }

    const bookingViewUrl = this.getBookingViewUrl(booking.id)

    // Send notification to landlord
    await this.mailService.sendBookingRequestNotification(
      landlord.email,
      landlord.firstName,
      property.title,
      tenant.firstName,
      dateRange,
      bookingViewUrl
    )
    
    // Send confirmation to tenant
    await this.mailService.sendBookingConfirmationToTenant(
      tenant.email,
      tenant.firstName,
      property.title,
      dateRange,
      bookingViewUrl
    )
    
    return booking
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.findAll({
      include: [
        {
          model: Property,
          attributes: ['id', 'title', 'address'],
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    })
  }

  async findOne(id: string, userId?: string): Promise<Booking> {
    const booking = await this.bookingModel.findByPk(id, {
      include: [
        {
          model: Property,
          attributes: ['id', 'title', 'address', 'ownerId'],
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    })
    
    if (!booking) {
      throw new NotFoundException('Booking not found')
    }
    
    if (userId && booking.tenantId !== userId && booking.property.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to access this booking')
    }
    
    return booking
  }

  async findUserBookings(userId: string, role: string): Promise<Booking[]> {
    const whereClause = role === 'tenant'
      ? { tenantId: userId }
      : { '$property.ownerId$': userId }
    
    return this.bookingModel.findAll({
      where: whereClause,
      include: [
        {
          model: Property,
          attributes: ['id', 'title', 'address'],
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })
  }

  async updateStatus(booking: Booking, status: BookingStatus, userId: string) {
    Logger.log(`Updating booking status to ${status} for booking ${booking.id} by user ${userId}`)
    switch (status) {
      case BookingStatus.CANCELLED:
        if (booking.tenantId !== userId && booking.property.ownerId !== userId) {
          throw new ForbiddenException('You do not have permission to cancel this booking')
        }
        break
      case BookingStatus.APPROVED:
        if (booking.property.ownerId !== userId) {
          throw new ForbiddenException('You do not have permission to approve this booking')
        }
        break
      case BookingStatus.REJECTED:
        if (booking.property.ownerId !== userId) {
          throw new ForbiddenException('You do not have permission to reject this booking')
        }
        break
    }

    const updatedBooking = await this.findOne(booking.id, userId)
    await updatedBooking.update({ status })

    const dateRange = {
      from: updatedBooking.startDate.toISOString().split('T')[0],
      to: updatedBooking.endDate.toISOString().split('T')[0],
    }

    const bookingViewUrl = this.getBookingViewUrl(updatedBooking.id)

    if (status === BookingStatus.APPROVED || status === BookingStatus.REJECTED) {
      const landlordContactInfo = status === BookingStatus.APPROVED ? {
        name: `${updatedBooking.property.owner.firstName} ${updatedBooking.property.owner.lastName}`,
        phone: updatedBooking.property.owner.phone || 'Not provided',
      } : undefined

      await this.mailService.sendBookingStatusUpdate(
        updatedBooking.tenant.email,
        updatedBooking.tenant.firstName,
        updatedBooking.property.title,
        status === BookingStatus.APPROVED ? 'approved' : 'rejected',
        dateRange,
        bookingViewUrl,
        landlordContactInfo,
        status === BookingStatus.REJECTED ? 'The property owner has declined your booking request.' : undefined
      )
    }

    return updatedBooking
  }
}