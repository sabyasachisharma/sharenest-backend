import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator'
import { BookingStatus } from '../entities/booking.entity'

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus, example: BookingStatus.APPROVED })
  @IsNotEmpty()
  @IsEnum(BookingStatus)
  status: BookingStatus

  @ApiProperty({ example: 'Your booking request has been approved. Looking forward to hosting you!', required: false })
  @IsOptional()
  @IsString()
  message?: string
}