import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './entities/user.entity'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { ConfigModule } from '@nestjs/config'
import { Booking } from '../bookings/entities/booking.entity'
import { Property } from '../properties/entities/property.entity'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Booking, Property]),
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}