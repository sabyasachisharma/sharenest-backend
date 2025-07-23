import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  IsInt,
  ArrayMaxSize,
} from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { PropertyCategory } from 'src/common/enums/property-category.enum'

export class CreatePropertyDto {
  @ApiProperty({ example: 'Cozy Studio in Downtown' })
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty({ example: 'A beautiful studio apartment with modern amenities...' })
  @IsNotEmpty()
  @IsString()
  description: string

  @ApiProperty({ enum: PropertyCategory, example: PropertyCategory.SUBLET })
  @IsNotEmpty()
  @IsEnum(PropertyCategory)
  category: PropertyCategory

  @ApiProperty({ example: 'New York' })
  @IsNotEmpty()
  @IsString()
  city: string

  @ApiProperty({ example: '10001' })
  @IsNotEmpty()
  @IsString()
  postcode: string

  @ApiProperty({ example: '123 Main St, Apt 4B' })
  @IsNotEmpty()
  @IsString()
  address: string

  @ApiProperty({ example: 'Main Street', required: false })
  @IsOptional()
  @IsString()
  street?: string

  @ApiProperty({ example: '123A', required: false })
  @IsOptional()
  @IsString()
  houseNumber?: string

  @ApiProperty({ example: 1500 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number

  @ApiProperty({ example: 'month', default: 'month' })
  @IsOptional()
  @IsString()
  priceUnit?: string

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bathrooms: number

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  size?: number

  @ApiProperty({ example: 'sqft', required: false })
  @IsOptional()
  @IsString()
  sizeUnit?: string

  @ApiProperty({ example: '2023-06-01' })
  @IsNotEmpty()
  @IsDateString()
  availableFrom: string

  @ApiProperty({ example: '2023-12-31', required: false })
  @IsOptional()
  @IsDateString()
  availableTo?: string

  @ApiProperty({ example: ['WiFi', 'Air Conditioning', 'Dishwasher'], required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
  })
  @IsArray()
  @IsString({ each: true })
  amenities?: string[]

  @ApiProperty({ example: true, default: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true'
    }
    return value
  })
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number

  @ApiProperty({ example: -74.006, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number

  @ApiProperty({ 
    type: 'array', 
    items: { type: 'string', format: 'binary' }, 
    maxItems: 3,
    required: false,
    description: 'Property images (maximum 3). Allowed formats: JPEG, JPG, PNG'
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: 'Maximum 3 images allowed' })
  images?: Express.Multer.File[]
}