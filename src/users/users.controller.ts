import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Request,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { RolesGuard } from 'src/auth/roles/roles.guard'
import { JwtAccessGuard } from 'src/auth/strategies/jwt-access-token.guard'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async findAll() {
    return this.usersService.findAll()
  }

  @Get('dashboard')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @ApiOperation({ summary: 'Get user profile with bookings' })
  @ApiResponse({ status: 200, description: 'Return user profile and bookings data' })
  async getUserDashboard(@Request() req) {
    return this.usersService.getUserProfileWithBookings(req.user.id, req.user.role)
  }

  @Put('profile')
  @UseGuards(JwtAccessGuard, RolesGuard)
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto)
  }

  @Post('profile/upload-image')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('profileImage'))
  async uploadProfileImage(@Request() req, @UploadedFile() file) {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }
    
    return this.usersService.updateProfileImage(req.user.id, file)
  }
}