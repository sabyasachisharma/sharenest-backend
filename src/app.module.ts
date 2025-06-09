import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    SequelizeModule.forRoot({
      dialect: "mysql",
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      database: process.env.MYSQL_DB_NAME,
      username: process.env.MYSQL_DB_USER,
      password: process.env.MYSQL_DB_PASS,
      pool: {
        max: 300,
        min: 20,
        idle: 30000,
        acquire: 90000,
      },
      retry: {
        max: 3,
        match: [/ETIMEDOUT/],
      },
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
      logging: false,
    }),
    MulterModule.register({
      dest: process.env.UPLOAD_DESTINATION || './uploads',
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
      },
    }),
    UsersModule,
    AuthModule,
    PropertiesModule,
    BookingsModule,
    ReviewsModule,
    MailModule,
  ],
})
export class AppModule {}
