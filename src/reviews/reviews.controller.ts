import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a property review' })
  @ApiResponse({ status: 201, description: 'Review has been created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    const reviewerId = req.user.id;
    return this.reviewsService.create(createReviewDto, reviewerId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'Return all reviews' })
  async findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiResponse({ status: 200, description: 'Return the review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get all reviews for a property' })
  @ApiResponse({ status: 200, description: 'Return property reviews' })
  async findByProperty(@Param('propertyId') propertyId: string) {
    return this.reviewsService.findByProperty(propertyId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all reviews by a user' })
  @ApiResponse({ status: 200, description: 'Return user reviews' })
  async findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review has been updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateReviewDto: Partial<CreateReviewDto>
  ) {
    const reviewerId = req.user.id;
    const review = await this.reviewsService.findOne(id);
    
    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('You can only update your own reviews');
    }
    
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review has been deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async remove(@Request() req, @Param('id') id: string) {
    const reviewerId = req.user.id;
    const review = await this.reviewsService.findOne(id);
    
    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    
    await this.reviewsService.remove(id);
    return { message: 'Review deleted successfully' };
  }
}