import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { BookingsService } from '../bookings.service'

@Injectable()
export class BookingAccessGuard implements CanActivate {
  constructor(private bookingsService: BookingsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const bookingId = request.params.id

    if (!user) {
      throw new ForbiddenException('Authentication required')
    }

    const booking = await this.bookingsService.findOne(bookingId)

    // Check if the user is either the tenant or the landlord
    const isTenant = booking.tenantId === user.id
    const isLandlord = booking.property.ownerId === user.id

    if (!isTenant && !isLandlord) {
      throw new ForbiddenException('You do not have permission to view this booking')
    }

    return true
  }
} 