import { ApiProperty } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  Min,
  IsInt,
} from 'class-validator'
import { PropertyCategory } from '../entities/property.entity'

export class UpdatePropertyDto {
  @ApiProperty({ example: 'Cozy Studio in Downtown', required: false })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({ example: 'A beautiful studio apartment with modern amenities...', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: PropertyCategory, example: PropertyCategory.SUBLET, required: false })
  @IsOptional()
  @IsEnum(PropertyCategory)
  category?: PropertyCategory

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  city?: string

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  postcode?: string

  @ApiProperty({ example: '123 Main St, Apt 4B', required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number

  @ApiProperty({ example: 'month', required: false })
  @IsOptional()
  @IsString()
  priceUnit?: string

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  size?: number

  @ApiProperty({ example: 'sqft', required: false })
  @IsOptional()
  @IsString()
  sizeUnit?: string

  @ApiProperty({ example: '2023-06-01', required: false })
  @IsOptional()
  @IsDateString()
  availableFrom?: string

  @ApiProperty({ example: '2023-12-31', required: false })
  @IsOptional()
  @IsDateString()
  availableTo?: string

  @ApiProperty({ example: ['WiFi', 'Air Conditioning', 'Dishwasher'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[]

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number

  @ApiProperty({ example: -74.006, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number
}