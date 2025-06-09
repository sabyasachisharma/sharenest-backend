import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export enum ApplicationTypeEnum {
  MOBILE_APP = 'mobile_app',
  WEB_APP = 'web_app',
}

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

  @ApiProperty({ 
    example: ApplicationTypeEnum.WEB_APP, 
    enum: ApplicationTypeEnum,
    required: false, 
    default: ApplicationTypeEnum.WEB_APP 
  })
  @IsOptional()
  @IsEnum(ApplicationTypeEnum)
  application?: ApplicationTypeEnum;
}