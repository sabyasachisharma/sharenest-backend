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
import { ApiTags } from '@nestjs/swagger'
import { Roles } from 'src/auth/roles/roles.decorator'
import { UserRole } from 'src/auth/enums/role.enum'
import { BookingsService } from './bookings.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { BookingStatus } from 'src/common/enums/booking-status.enum'
import { RolesGuard } from 'src/auth/roles/roles.guard'
import { JwtAccessGuard } from 'src/auth/strategies/jwt-access-token.guard'

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
    const booking = await this.bookingsService.findOne(id)
    if (booking.tenantId === req.user.id || booking.property.ownerId === req.user.id) {
      return booking
    }
    throw new ForbiddenException('You do not have access to this booking')
  }

  @Put(':id/status')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TENANT, UserRole.LANDLORD)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Request() req
  ) {
    const booking = await this.bookingsService.findOne(id)    
    if (booking.property.ownerId !== req.user.id && booking.tenantId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to update this booking')
    }
    return this.bookingsService.updateStatus(booking, status, req.user.id)
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  async remove(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingsService.findOne(id)
    if (booking.tenantId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to delete this booking')
    }
    return this.bookingsService.remove(id)
  }
}