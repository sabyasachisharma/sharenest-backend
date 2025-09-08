import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  BadRequestException,
  Req,
  Query,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Request } from "express"
import { AuthService, AuthConstants } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto)
    return {
      message: 'User registered successfully',
      ...result,
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(@Req() { res: response }: Request, @Body() loginDto: LoginDto
  ) {
    return await this.authService.login(response, loginDto)
  }


  @Post('refresh-token')
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
  @HttpCode(200)
  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({ status: 200, description: 'User logged out and tokens invalidated' })
  async logout(@Req() { res: response }: Request) {
    response.clearCookie(AuthConstants.ACCESS_TOKEN).clearCookie(AuthConstants.REFRESH_TOKEN)
    return { message: "User successfully logged out" }
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
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() { res: response }) {
    return response.user
  }

  // ⚙️ Health check endpoint
  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({ status: 200, description: 'Server is operational' })
  async healthCheck() {
    return { status: 'ok' }
  }

  @Get('check-email')
  @ApiOperation({ summary: 'Check if email exists' })
  @ApiResponse({ status: 200, description: 'Returns whether email exists', type: Object })
  async checkEmail(@Query('email') email?: string) {
    if (!email) {
      throw new BadRequestException('Email is required')
    }
    const exists = await this.authService.checkEmailExists(email)
    return { exists }
  }
}
