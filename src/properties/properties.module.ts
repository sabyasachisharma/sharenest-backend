import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Property } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';
import { Favorite } from './entities/favorite.entity';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Property,
      PropertyImage,
      Favorite
    ]),
    UsersModule
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService]
})
export class PropertiesModule {}