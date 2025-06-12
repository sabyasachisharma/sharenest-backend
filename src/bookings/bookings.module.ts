import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Booking } from './entities/booking.entity'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { PropertiesModule } from '../properties/properties.module'
import { UsersModule } from '../users/users.module'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [
    SequelizeModule.forFeature([Booking]),
    PropertiesModule,
    UsersModule,
    MailModule
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService]
})
export class BookingsModule {}