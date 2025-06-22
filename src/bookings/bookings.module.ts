import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Booking } from './entities/booking.entity'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { PropertiesModule } from '../properties/properties.module'
import { UsersModule } from '../users/users.module'
import { MailModule } from '../mail/mail.module'
import { BookingAccessGuard } from './guards/booking-access.guard'

@Module({
  imports: [
    SequelizeModule.forFeature([Booking]),
    PropertiesModule,
    UsersModule,
    MailModule
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingAccessGuard],
  exports: [BookingsService]
})
export class BookingsModule {}