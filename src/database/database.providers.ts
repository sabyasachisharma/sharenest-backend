import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { PropertyImage } from '../properties/entities/property-image.entity';
import { Favorite } from '../properties/entities/favorite.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Review } from '../reviews/entities/review.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { VerificationToken } from '../auth/entities/verification-token.entity';
import { PasswordResetToken } from '../auth/entities/password-reset-token.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async (configService: ConfigService) => {
      const sequelize = new Sequelize({
        dialect: configService.get('DB_DIALECT', 'mysql') as any,
        dialectModule: require('mysql2'),
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '3306')),
        username: configService.get('DB_USERNAME', 'sharenestadmin'),
        password: configService.get('DB_PASSWORD', 'sharenest123'),
        database: configService.get('DB_NAME', 'sharenest'),
        pool: {
          max: 20,
          min: 5,
          acquire: 60000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true,
        },
        logging: configService.get('NODE_ENV') === 'development' ? console.log : false,
      });

      sequelize.addModels([
        User,
        Property,
        PropertyImage,
        Favorite,
        Booking,
        Review,
        RefreshToken,
        VerificationToken,
        PasswordResetToken
      ]);

      await sequelize.sync();

      return sequelize;
    },
    inject: [ConfigService],
  },
];