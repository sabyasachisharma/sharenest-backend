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
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Roles } from 'src/auth/roles/roles.decorator'
import { UserRole } from 'src/auth/enums/role.enum'
import { BookingsService } from './bookings.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { BookingStatus } from 'src/common/enums/booking-status.enum'
import { RolesGuard } from 'src/auth/roles/roles.guard'
import { JwtAccessGuard } from 'src/auth/strategies/jwt-access-token.guard'
import { BookingAccessGuard } from './guards/booking-access.guard'

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  async create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto, req.user.id)
  }

  @Get()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TENANT, UserRole.LANDLORD)
  async findAll(@Request() req) {
    return this.bookingsService.findUserBookings(req.user.id, req.user.role)
  }

  @Get(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TENANT, UserRole.LANDLORD)
  async findOne(@Param('id') id: string, @Request() req) {
    return this.bookingsService.findOne(id, req.user.id)
  }

  @Put(':id/status')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TENANT, UserRole.LANDLORD)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Request() req
  ) {
    const booking = await this.bookingsService.findOne(id, req.user.id)
    return this.bookingsService.updateStatus(booking, status, req.user.id)
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm/Approve a booking (Landlord only)' })
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  async confirmBooking(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingsService.findOne(id, req.user.id)
    return this.bookingsService.updateStatus(booking, BookingStatus.APPROVED, req.user.id)
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject a booking (Landlord only)' })
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  async rejectBooking(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingsService.findOne(id, req.user.id)
    return this.bookingsService.updateStatus(booking, BookingStatus.REJECTED, req.user.id)
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking (Tenant or Landlord)' })
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TENANT, UserRole.LANDLORD)
  async cancelBooking(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingsService.findOne(id, req.user.id)
    return this.bookingsService.updateStatus(booking, BookingStatus.CANCELLED, req.user.id)
  }
}