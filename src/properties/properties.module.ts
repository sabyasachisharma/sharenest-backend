import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Property } from './entities/property.entity'
import { PropertyImage } from './entities/property-image.entity'
import { Favorite } from './entities/favorite.entity'
import { PropertiesController } from './properties.controller'
import { PropertiesService } from './properties.service'
import { User } from '../users/entities/user.entity'
import { CloudinaryService } from '../common/services/cloudinary.service'

@Module({
  imports: [
    SequelizeModule.forFeature([
      Property,
      PropertyImage,
      Favorite,
      User,
    ])
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService, CloudinaryService],
  exports: [PropertiesService]
})
export class PropertiesModule {}
