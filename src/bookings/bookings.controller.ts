import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  Delete
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from 'src/auth/roles/roles.decorator'
import { UserRole } from 'src/auth/enums/role.enum'
import { BookingsService } from './bookings.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { BookingStatus } from './entities/booking.entity'

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.TENANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a booking request' })
  @ApiResponse({ status: 201, description: 'Booking request has been created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  async create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto, req.user.id)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bookings' })
  @ApiResponse({ status: 200, description: 'Return user bookings' })
  async findAll(@Request() req) {
    return this.bookingsService.findUserBookings(req.user.id, req.user.role)
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by id' })
  @ApiResponse({ status: 200, description: 'Return the booking' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingsService.findOne(id)
    
    // Check if user has access to this booking
    if (
      req.user.role !== UserRole.LANDLORD &&
      booking.tenantId !== req.user.id &&
      booking.property.ownerId !== req.user.id
    ) {
      throw new ForbiddenException('You do not have access to this booking')
    }
    
    return booking
  }

  @Put(':id/status')
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status' })
  @ApiResponse({ status: 200, description: 'Booking status has been updated' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Request() req
  ) {
    const booking = await this.bookingsService.findOne(id)
    
    // Only property owner can update booking status
    if (booking.property.ownerId !== req.user.id) {
      throw new ForbiddenException('Only the property owner can update booking status')
    }
    
    return this.bookingsService.updateStatus(id, status)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiResponse({ status: 200, description: 'Booking has been deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async remove(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingsService.findOne(id)
    
    // Check if user has permission to delete
    if (
      req.user.role !== UserRole.LANDLORD &&
      booking.tenantId !== req.user.id &&
      booking.property.ownerId !== req.user.id
    ) {
      throw new ForbiddenException('You do not have permission to delete this booking')
    }
    
    return this.bookingsService.remove(id)
  }
}