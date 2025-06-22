import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, ArrayMaxSize } from 'class-validator'

export class UploadPropertyImagesDto {
  @ApiProperty({ 
    type: 'array', 
    items: { type: 'string', format: 'binary' }, 
    maxItems: 3,
    description: 'Property images (maximum 3). Allowed formats: JPEG, JPG, PNG, GIF, WebP, BMP, TIFF, SVG. Maximum file size: 10MB per image.'
  })
  @IsArray()
  @ArrayMaxSize(3, { message: 'Maximum 3 images allowed' })
  @IsOptional()
  images?: Express.Multer.File[]
} 