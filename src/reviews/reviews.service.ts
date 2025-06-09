import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';
import { Review, ReviewType } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { BookingStatus } from '../bookings/entities/booking.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review)
    private readonly reviewModel: typeof Review,
    @InjectModel(Booking)
    private readonly bookingModel: typeof Booking
  ) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: string): Promise<Review> {
    return this.reviewModel.create({
      ...createReviewDto,
      reviewerId,
    });
  }

  async findOne(id: string): Promise<Review> {
    return this.reviewModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: User,
          as: 'reviewed',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Property,
          attributes: ['id', 'title'],
        },
      ],
    });
  }

  async findPropertyReviews(propertyId: string): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: {
        propertyId,
        type: ReviewType.PROPERTY,
      },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findUserReviews(userId: string): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: {
        reviewedId: userId,
        type: ReviewType.USER,
      },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    
    await review.destroy();
  }

  async canCreateReview(
    reviewerId: string,
    type: ReviewType,
    propertyId?: string,
    reviewedId?: string,
  ): Promise<boolean> {
    if (type === ReviewType.PROPERTY && propertyId) {
      // Check if reviewer has completed a stay at the property
      const completedBooking = await this.bookingModel.findOne({
        where: {
          tenantId: reviewerId,
          propertyId,
          status: BookingStatus.APPROVED,
          endDate: { [Op.lt]: new Date() },
        },
      });
      
      return !!completedBooking;
    } else if (type === ReviewType.USER && reviewedId) {
      // Find interaction between the users
      const bookings = await this.bookingModel.findAll({
        include: [
          {
            model: Property,
            include: [
              {
                model: User,
                attributes: ['id'],
              },
            ],
          },
        ],
        where: {
          status: BookingStatus.APPROVED,
          endDate: { [Op.lt]: new Date() },
          [Op.or]: [
            {
              // Tenant reviewing landlord
              tenantId: reviewerId,
              '$property.owner.id$': reviewedId,
            },
            {
              // Landlord reviewing tenant
              tenantId: reviewedId,
              '$property.owner.id$': reviewerId,
            },
          ],
        },
      });
      
      return bookings.length > 0;
    }
    
    return false;
  }

  async hasAlreadyReviewed(
    reviewerId: string,
    type: ReviewType,
    propertyId?: string,
    reviewedId?: string,
  ): Promise<boolean> {
    const whereClause: any = {
      reviewerId,
      type,
    };
    
    if (type === ReviewType.PROPERTY && propertyId) {
      whereClause.propertyId = propertyId;
    } else if (type === ReviewType.USER && reviewedId) {
      whereClause.reviewedId = reviewedId;
    }
    
    const existingReview = await this.reviewModel.findOne({
      where: whereClause,
    });
    
    return !!existingReview;
  }

  async getPendingReviewsForUser(userId: string): Promise<any[]> {
    // Get completed bookings that the user hasn't reviewed yet
    const user = await User.findByPk(userId, {
      attributes: ['id', 'role'],
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const pendingReviews = [];
    
    if (user.role === UserRole.TENANT) {
      // Get completed stays that tenant hasn't reviewed yet
      const completedBookings = await this.bookingModel.findAll({
        where: {
          tenantId: userId,
          status: BookingStatus.APPROVED,
          endDate: { [Op.lt]: new Date() },
        },
        include: [
          {
            model: Property,
            include: [
              {
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'profileImage'],
              },
            ],
          },
        ],
      });
      
      for (const booking of completedBookings) {
        // Check if tenant has reviewed the property
        const propertyReview = await this.reviewModel.findOne({
          where: {
            reviewerId: userId,
            propertyId: booking.propertyId,
            type: ReviewType.PROPERTY,
          },
        });
        
        if (!propertyReview) {
          pendingReviews.push({
            type: ReviewType.PROPERTY,
            booking,
            target: booking.property,
          });
        }
        
        // Check if tenant has reviewed the landlord
        const landlordReview = await this.reviewModel.findOne({
          where: {
            reviewerId: userId,
            reviewedId: booking.property.ownerId,
            type: ReviewType.USER,
          },
        });
        
        if (!landlordReview) {
          pendingReviews.push({
            type: ReviewType.USER,
            booking,
            target: booking.property.owner,
          });
        }
      }
    } else if (user.role === UserRole.LANDLORD) {
      // Get tenants that have stayed at the landlord's properties
      const properties = await Property.findAll({
        where: { ownerId: userId },
        attributes: ['id'],
      });
      
      const propertyIds = properties.map(p => p.id);
      
      const completedBookings = await this.bookingModel.findAll({
        where: {
          propertyId: { [Op.in]: propertyIds },
          status: BookingStatus.APPROVED,
          endDate: { [Op.lt]: new Date() },
        },
        include: [
          {
            model: User,
            as: 'tenant',
            attributes: ['id', 'firstName', 'lastName', 'profileImage'],
          },
          {
            model: Property,
            attributes: ['id', 'title'],
          },
        ],
      });
      
      for (const booking of completedBookings) {
        // Check if landlord has reviewed the tenant
        const tenantReview = await this.reviewModel.findOne({
          where: {
            reviewerId: userId,
            reviewedId: booking.tenantId,
            type: ReviewType.USER,
          },
        });
        
        if (!tenantReview) {
          pendingReviews.push({
            type: ReviewType.USER,
            booking,
            target: booking.tenant,
          });
        }
      }
    }
    
    return pendingReviews;
  }
}