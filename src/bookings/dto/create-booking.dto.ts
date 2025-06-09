import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  propertyId: string;

  @ApiProperty({ example: '2023-06-01' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2023-06-15' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'I am interested in this property for a summer sublet.', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}