import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review)
    private readonly reviewModel: typeof Review,
  ) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: string): Promise<Review> {
    return this.reviewModel.create({
      ...createReviewDto,
      reviewerId,
    });
  }

  async findAll(): Promise<Review[]> {
    return this.reviewModel.findAll({
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Property,
          attributes: ['id', 'title', 'city'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: Property,
          attributes: ['id', 'title', 'city'],
        },
      ],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async findByProperty(propertyId: string): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: { propertyId },
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

  async findByUser(reviewerId: string): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: { reviewerId },
      include: [
        {
          model: Property,
          attributes: ['id', 'title', 'city'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async update(id: string, updateData: Partial<CreateReviewDto>): Promise<Review> {
    const review = await this.findOne(id);
    await review.update(updateData);
    return review;
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    await review.destroy();
  }
}