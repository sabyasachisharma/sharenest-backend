import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TENANT })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'I am a friendly tenant looking for a place.', required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}