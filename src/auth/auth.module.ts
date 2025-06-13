import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from '../users/entities/user.entity'
import { UsersModule } from '../users/users.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { MailModule } from '../mail/mail.module'
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy'

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
    ]),
    UsersModule,
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessTokenStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}