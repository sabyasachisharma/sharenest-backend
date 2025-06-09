import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewType } from './entities/review.entity';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  @ApiResponse({ status: 201, description: 'Review has been created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    const reviewerId = req.user.id;
    
    // Validate required fields based on type
    if (createReviewDto.type === ReviewType.PROPERTY && !createReviewDto.propertyId) {
      throw new BadRequestException('Property ID is required for property reviews');
    } else if (createReviewDto.type === ReviewType.USER && !createReviewDto.reviewedId) {
      throw new BadRequestException('Reviewed user ID is required for user reviews');
    }
    
    // Check if reviewer has permission to review
    const canReview = await this.reviewsService.canCreateReview(
      reviewerId,
      createReviewDto.type,
      createReviewDto.propertyId,
      createReviewDto.reviewedId,
    );
    
    if (!canReview) {
      throw new ForbiddenException('You cannot review this property or user');
    }
    
    // Check if user has already reviewed
    const hasReviewed = await this.reviewsService.hasAlreadyReviewed(
      reviewerId,
      createReviewDto.type,
      createReviewDto.propertyId,
      createReviewDto.reviewedId,
    );
    
    if (hasReviewed) {
      throw new BadRequestException('You have already reviewed this property or user');
    }
    
    return this.reviewsService.create(createReviewDto, reviewerId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get reviews for a property' })
  @ApiResponse({ status: 200, description: 'Return the property reviews' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findPropertyReviews(@Param('propertyId') propertyId: string) {
    return this.reviewsService.findPropertyReviews(propertyId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reviews for a user' })
  @ApiResponse({ status: 200, description: 'Return the user reviews' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.findUserReviews(userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review has been deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async remove(@Request() req, @Param('id') id: string) {
    const reviewerId = req.user.id;
    const review = await this.reviewsService.findOne(id);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    
    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }
    
    await this.reviewsService.remove(id);
    return { message: 'Review deleted successfully' };
  }

  @Get('user/me/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending reviews for the current user' })
  @ApiResponse({ status: 200, description: 'Return pending reviews' })
  async getPendingReviews(@Request() req) {
    return this.reviewsService.getPendingReviewsForUser(req.user.id);
  }
}