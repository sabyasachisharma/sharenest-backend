import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Review } from './entities/review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Review,
      Booking
    ])
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService]
})
export class ReviewsModule {}