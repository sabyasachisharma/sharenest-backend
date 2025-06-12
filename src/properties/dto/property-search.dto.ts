import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsEnum, IsNumber, IsDateString, Min, Max, IsInt } from 'class-validator'
import { Type } from 'class-transformer'
import { PropertyCategory } from '../entities/property.entity'

export class PropertySearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string

  @ApiProperty({ enum: PropertyCategory, required: false })
  @IsOptional()
  @IsEnum(PropertyCategory)
  category?: PropertyCategory

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postcode?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minBedrooms?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minBathrooms?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  availableFrom?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  availableTo?: string

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10
}