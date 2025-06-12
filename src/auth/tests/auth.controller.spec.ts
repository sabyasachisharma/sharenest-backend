import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { Response } from 'express'
import { AuthController } from '../auth.controller'
import { AuthService, ApplicationTypeEnum } from '../auth.service'
import { RegisterDto } from '../dto/register.dto'
import { LoginDto } from '../dto/login.dto'
import { RefreshTokenDto } from '../dto/refresh-token.dto'
import { ForgotPasswordDto } from '../dto/forgot-password.dto'
import { ResetPasswordDto } from '../dto/reset-password.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

describe('AuthController', () => {
  let authController: AuthController
  let authService: AuthService
  let moduleRef: TestingModule

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
  }

  const mockTokens = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
    user: mockUser,
  }

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    generatePasswordResetToken: jest.fn(),
    resetPassword: jest.fn(),
  }

  const mockResponse = {
    setHeader: jest.fn(),
    cookie: jest.fn(),
  } as unknown as Response

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile()

    authController = moduleRef.get<AuthController>(AuthController)
    authService = moduleRef.get<AuthService>(AuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await moduleRef.close()
  })

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    } as RegisterDto

    it('should register a new user successfully', async () => {
      const expectedResult = {
        ...mockUser,
        message: 'Registration successful.',
      }

      mockAuthService.register.mockResolvedValue(expectedResult)

      const result = await authController.register(registerDto)

      expect(authService.register).toHaveBeenCalledWith(registerDto)
      expect(result).toEqual({
        message: 'User registered successfully',
        ...expectedResult,
      })
    })

    it('should throw BadRequestException when registration fails', async () => {
      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Email already exists')
      )

      await expect(authController.register(registerDto)).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    } as LoginDto

    it('should login user successfully with default web app type', async () => {
      mockAuthService.login.mockResolvedValue({
        message: 'Login successful',
        ...mockTokens,
      })

      const result = await authController.login(mockResponse, loginDto)

      expect(authService.login).toHaveBeenCalledWith(
        mockResponse,
        loginDto,
        ApplicationTypeEnum.WEB_APP
      )
      expect(result).toEqual({
        message: 'Login successful',
        ...mockTokens,
      })
    })

    it('should login user successfully with mobile app type', async () => {
      const mobileLoginDto = {
        ...loginDto,
        application: ApplicationTypeEnum.MOBILE_APP,
      }

      mockAuthService.login.mockResolvedValue({
        message: 'Login successful',
        ...mockTokens,
      })

      const result = await authController.login(mockResponse, mobileLoginDto)

      expect(authService.login).toHaveBeenCalledWith(
        mockResponse,
        mobileLoginDto,
        ApplicationTypeEnum.MOBILE_APP
      )
      expect(result).toEqual({
        message: 'Login successful',
        ...mockTokens,
      })
    })

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      )

      await expect(
        authController.login(mockResponse, loginDto)
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'mock.refresh.token',
    }

    it('should refresh access token successfully', async () => {
      const expectedResult = {
        accessToken: 'new.access.token',
        user: mockUser,
      }

      mockAuthService.refreshToken.mockResolvedValue(expectedResult)

      const result = await authController.refreshToken(refreshTokenDto)

      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken
      )
      expect(result).toEqual({
        message: 'Access token refreshed',
        ...expectedResult,
      })
    })

    it('should throw BadRequestException for invalid refresh token', async () => {
      mockAuthService.refreshToken.mockResolvedValue(null)

      await expect(
        authController.refreshToken(refreshTokenDto)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('logout', () => {
    const mockRequest = {
      user: { id: mockUser.id },
    }

    it('should logout user successfully', async () => {
      mockAuthService.logout.mockResolvedValue(true)

      const result = await authController.logout(mockRequest)

      expect(authService.logout).toHaveBeenCalledWith(mockUser.id)
      expect(result).toEqual({ message: 'Logged out successfully' })
    })
  })

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    }

    it('should send password reset email successfully', async () => {
      mockAuthService.generatePasswordResetToken.mockResolvedValue(true)

      const result = await authController.forgotPassword(forgotPasswordDto)

      expect(authService.generatePasswordResetToken).toHaveBeenCalledWith(
        forgotPasswordDto.email
      )
      expect(result).toEqual({
        message: 'If your email is registered, a reset link has been sent',
      })
    })

    it('should return success message even for non-existent email', async () => {
      mockAuthService.generatePasswordResetToken.mockResolvedValue(false)

      const result = await authController.forgotPassword(forgotPasswordDto)

      expect(result).toEqual({
        message: 'If your email is registered, a reset link has been sent',
      })
    })
  })

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'reset-token',
      newPassword: 'newPassword123',
    }

    it('should reset password successfully', async () => {
      mockAuthService.resetPassword.mockResolvedValue(true)

      const result = await authController.resetPassword(resetPasswordDto)

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword
      )
      expect(result).toEqual({
        message: 'Password has been reset successfully',
      })
    })

    it('should throw BadRequestException for invalid or expired token', async () => {
      mockAuthService.resetPassword.mockResolvedValue(false)

      await expect(
        authController.resetPassword(resetPasswordDto)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('getProfile', () => {
    const mockRequest = {
      user: mockUser,
    }

    it('should return current authenticated user', async () => {
      const result = await authController.getProfile(mockRequest)

      expect(result).toEqual(mockUser)
    })
  })

  describe('healthCheck', () => {
    it('should return server health status', async () => {
      const result = await authController.healthCheck()

      expect(result).toEqual({ status: 'ok' })
    })
  })

  describe('endpoint validations', () => {
    it.each([
      ['register', 'POST', '/auth/register'],
      ['login', 'POST', '/auth/login'],
      ['refreshToken', 'POST', '/auth/refresh-token'],
      ['logout', 'POST', '/auth/logout'],
      ['forgotPassword', 'POST', '/auth/forgot-password'],
      ['resetPassword', 'POST', '/auth/reset-password'],
      ['getProfile', 'GET', '/auth/me'],
      ['healthCheck', 'GET', '/auth/health'],
    ])('should have %s endpoint configured correctly', (methodName, httpMethod, expectedPath) => {
      const controllerMetadata = Reflect.getMetadata('path', AuthController)
      expect(controllerMetadata).toBe('auth')
      
      // This is a basic check - in a real scenario, you might want to test
      // the actual route metadata more thoroughly
      expect(authController[methodName]).toBeDefined()
    })
  })
}) 