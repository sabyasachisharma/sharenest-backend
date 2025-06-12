import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsInt, IsUUID, Min, Max, IsString, IsOptional } from 'class-validator'

export class CreateReviewDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Property ID to review'
  })
  @IsNotEmpty()
  @IsUUID(4)
  propertyId: string

  @ApiProperty({ 
    example: 4, 
    minimum: 1, 
    maximum: 5,
    description: 'Rating from 1 to 5 stars'
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

  @ApiProperty({ 
    example: 'Great experience! The property was clean and well-maintained.',
    description: 'Optional comment about the property',
    required: false 
  })
  @IsOptional()
  @IsString()
  comment?: string
}