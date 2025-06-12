import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Property } from './entities/property.entity'
import { Favorite } from './entities/favorite.entity'
import { PropertiesController } from './properties.controller'
import { PropertiesService } from './properties.service'
import { User } from '../users/entities/user.entity'

@Module({
  imports: [
    SequelizeModule.forFeature([
      Property,
      Favorite,
      User,
    ])
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService]
})
export class PropertiesModule {}