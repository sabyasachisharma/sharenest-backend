import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: true, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}