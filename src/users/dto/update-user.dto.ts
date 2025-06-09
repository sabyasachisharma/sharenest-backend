import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'I am a friendly tenant looking for a place.', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}