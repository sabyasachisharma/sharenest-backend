import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsInt, IsUUID, Min, Max, IsString, IsOptional } from 'class-validator';
import { ReviewType } from '../entities/review.entity';

export class CreateReviewDto {
  @ApiProperty({ enum: ReviewType, example: ReviewType.PROPERTY })
  @IsNotEmpty()
  @IsEnum(ReviewType)
  type: ReviewType;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID(4)
  reviewedId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID(4)
  propertyId?: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great experience! The property was clean and well-maintained.', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}