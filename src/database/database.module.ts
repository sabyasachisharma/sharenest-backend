import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseProviders } from './database.providers';

@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}