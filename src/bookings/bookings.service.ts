import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking)
    private readonly bookingModel: typeof Booking,
    private readonly propertiesService: PropertiesService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService
  ) {}

  async create(createBookingDto: CreateBookingDto, tenantId: string): Promise<Booking> {
    const property = await this.propertiesService.findOne(createBookingDto.propertyId);
    
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    
    if (!property.isActive) {
      throw new BadRequestException('Property is not available for booking');
    }
    
    // Check if dates are valid
    const startDate = new Date(createBookingDto.startDate);
    const endDate = new Date(createBookingDto.endDate);
    const today = new Date();
    
    if (startDate < today) {
      throw new BadRequestException('Start date cannot be in the past');
    }
    
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }
    
    // Check for overlapping bookings
    const overlappingBookings = await this.bookingModel.findAll({
      where: {
        propertyId: createBookingDto.propertyId,
        status: {
          [Op.in]: [BookingStatus.PENDING, BookingStatus.APPROVED],
        },
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            endDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } },
            ],
          },
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
    });
    
    // Send notification emails
    const tenant = await this.usersService.findOne(tenantId);
    const landlord = await this.usersService.findOne(property.ownerId);
    
    const dateRange = {
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0],
    };

    await this.mailService.sendBookingRequestNotification(
      landlord.email,
      landlord.firstName,
      tenant.firstName,
      property.title,
      dateRange,
      null // bookingViewUrl parameter
    );
    
    await this.mailService.sendBookingStatusUpdate(
      tenant.email,
      tenant.firstName,
      property.title,
      'approved',
      dateRange,
      null // bookingViewUrl parameter
    );
    
    return booking;
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
    });
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
    });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    return booking;
  }

  async findUserBookings(userId: string, role: string): Promise<Booking[]> {
    const whereClause = role === 'tenant'
      ? { tenantId: userId }
      : { '$property.ownerId$': userId };
    
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
    });
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.findOne(id);
    
    if (booking.status === status) {
      return booking;
    }
    
    await booking.update({ status });
    
    // Send notification emails based on status
    const tenant = await this.usersService.findOne(booking.tenantId);
    const property = await this.propertiesService.findOne(booking.propertyId);
    
    const dateRange = {
      from: booking.startDate.toISOString().split('T')[0],
      to: booking.endDate.toISOString().split('T')[0],
    };

    await this.mailService.sendBookingStatusUpdate(
      tenant.email,
      tenant.firstName,
      property.title,
      status.toLowerCase() as 'approved' | 'rejected',
      dateRange,
      null // bookingViewUrl parameter
    );
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await booking.destroy();
  }
}