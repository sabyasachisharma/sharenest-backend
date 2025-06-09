import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Request,
  Get,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User has been created and verification email sent' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, description: 'User has been logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user, loginDto.rememberMe);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    if (!result) {
      throw new BadRequestException('Invalid refresh token');
    }
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({ status: 200, description: 'User has been logged out' })
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.generatePasswordResetToken(forgotPasswordDto.email);
    if (!result) {
      // Don't reveal if email exists for security
      return { message: 'If your email is registered, you will receive a password reset link' };
    }
    return { message: 'Password reset email sent' };
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password has been reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    
    if (!result) {
      throw new BadRequestException('Invalid or expired token');
    }
    
    return { message: 'Password has been reset successfully' };
  }

  @Get('verify/:token')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email has been verified' })
  @ApiResponse({ status: 404, description: 'Invalid or expired token' })
  async verifyEmail(@Param('token') token: string) {
    const result = await this.authService.verifyEmail(token);
    
    if (!result) {
      throw new NotFoundException('Invalid or expired verification token');
    }
    
    return { message: 'Email verified successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'Return the user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }

  // create health check endpoint
  @Get('health')
  @ApiOperation({ summary: 'Check if the server is running' })
  @ApiResponse({ status: 200, description: 'Server is running' })
  async healthCheck() {
    return { status: 'ok' };
  }
}