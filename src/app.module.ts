import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Entity imports
import { User } from './users/entities/user.entity';
import { Property } from './properties/entities/property.entity';
import { PropertyImage } from './properties/entities/property-image.entity';
import { Favorite } from './properties/entities/favorite.entity';
import { Booking } from './bookings/entities/booking.entity';
import { Review } from './reviews/entities/review.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { VerificationToken } from './auth/entities/verification-token.entity';
import { PasswordResetToken } from './auth/entities/password-reset-token.entity';

// Module imports
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // Global config module with fallback env path
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),

    // Static files for uploaded content
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Sequelize async configuration
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = {
          dialect: configService.get<'mysql'>('DB_DIALECT', 'mysql'),
          dialectModule: require('mysql2'),
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: parseInt(configService.get<string>('DB_PORT', '3306')),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_NAME', 'test'),
          models: [
            User,
            Property,
            PropertyImage,
            Favorite,
            Booking,
            Review,
            RefreshToken,
            VerificationToken,
            PasswordResetToken,
          ],
          autoLoadModels: true,
          synchronize: configService.get<string>('NODE_ENV') === 'development',
          logging: configService.get<string>('NODE_ENV') === 'development' ? console.log : false,
          pool: {
            max: 20,
            min: 5,
            acquire: 60000,
            idle: 10000,
          },
          define: {
            timestamps: true,
            underscored: true,
          },
        };

        // Optional debug output
        console.log('Sequelize DB Config:', dbConfig);
        return dbConfig;
      },
      inject: [ConfigService],
    }),

    // File upload configuration
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('UPLOAD_DESTINATION', './uploads'),
        limits: {
          fileSize: parseInt(configService.get<string>('MAX_FILE_SIZE', '5242880')),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    UsersModule,
    AuthModule,
    PropertiesModule,
    BookingsModule,
    ReviewsModule,
    MailModule,
  ],
})
export class AppModule {}
