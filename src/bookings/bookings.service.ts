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

  async create(createBookingDto: CreateBookingDto, tenantId: string): Promise<Booking> {
    const property = await this.propertiesService.findOne(createBookingDto.propertyId);
  
    if (!property) {
      throw new NotFoundException('Property not found');
    }
  
    if (!property.isActive) {
      throw new BadRequestException('Property is not available for booking');
    }
  
    const startDate = new Date(createBookingDto.startDate);
    const endDate = new Date(createBookingDto.endDate);
    const today = new Date();
  
    // Normalize times to avoid time-of-day mismatches
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);
  
    // Booking date in the past
    if (startDate < today) {
      throw new BadRequestException('Start date cannot be in the past');
    }
  
    // End date must follow start date
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }
  
    // Booking must be within property's availability window
    const availableFrom = new Date(property.availableFrom);
    const availableTo = new Date(property.availableTo);
    availableFrom.setUTCHours(0, 0, 0, 0);
    availableTo.setUTCHours(0, 0, 0, 0);
    // we check for availability of the property for the selected dates
    if (startDate < availableFrom || endDate > availableTo) {
      throw new BadRequestException(
        `Booking must be within the property's available range: ${availableFrom.toDateString()} to ${availableTo.toDateString()}`
      );
    }
  
    // Check for overlapping bookings
    const overlappingBookings = await this.bookingModel.findAll({
      where: {
        propertyId: createBookingDto.propertyId,
        status: {
          [Op.in]: [BookingStatus.PENDING, BookingStatus.APPROVED],
        },
        [Op.and]: [
          { startDate: { [Op.lte]: endDate } },
          { endDate: { [Op.gte]: startDate } },
        ],
      },
    });
  
    if (overlappingBookings.length > 0) {
      throw new BadRequestException('Property is not available for the selected dates');
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
    // TODOS
    // await this.mailService.sendBookingRequestNotification(
    //   landlord.email,
    //   landlord.firstName,
    //   tenant.firstName,
    //   property.title,
    //   dateRange,
    //   null // bookingViewUrl parameter
    // )
    
    // await this.mailService.sendBookingStatusUpdate(
    //   tenant.email,
    //   tenant.firstName,
    //   property.title,
    //   'approved',
    //   dateRange,
    //   null // bookingViewUrl parameter
    // )
    
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

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingModel.findByPk(id, {
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
    
    if (!booking) {
      throw new NotFoundException('Booking not found')
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
    await booking.update({ status })
    return booking
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id)
    await booking.destroy()
  }
}