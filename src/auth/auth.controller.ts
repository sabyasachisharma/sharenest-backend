import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Request,
  Get,
  BadRequestException,
  Response,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Response as ExpressResponse } from 'express'
import { AuthService, ApplicationTypeEnum } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User has been created and tokens issued' })
  @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto)
    return {
      message: 'User registered successfully',
      ...result,
    }
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, description: 'Access and refresh tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Response({ passthrough: true }) response: ExpressResponse,
    @Body() loginDto: LoginDto
  ) {
    const applicationType = loginDto.application || ApplicationTypeEnum.WEB_APP
    const result = await this.authService.login(response, loginDto, applicationType)
    return {
      message: 'Login successful',
      ...result,
    }
  }

  @Post('refresh-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken)
    if (!result) {
      throw new BadRequestException('Invalid refresh token')
    }
    return {
      message: 'Access token refreshed',
      ...result,
    }
  }

  // 🚪 Logout user (revoke refresh token)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({ status: 200, description: 'User logged out and tokens invalidated' })
  async logout(@Request() req) {
    await this.authService.logout(req.user.id)
    return { message: 'Logged out successfully' }
  }

  // 🔑 Forgot password request
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'If email is registered, reset link is sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.generatePasswordResetToken(forgotPasswordDto.email)
    return {
      message: 'If your email is registered, a reset link has been sent',
    }
  }

  // 🔐 Reset password with token
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset user password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const success = await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    )

    if (!success) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    return { message: 'Password has been reset successfully' }
  }

  // 👤 Get current authenticated user
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return req.user
  }

  // ⚙️ Health check endpoint
  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({ status: 200, description: 'Server is operational' })
  async healthCheck() {
    return { status: 'ok' }
  }
}
