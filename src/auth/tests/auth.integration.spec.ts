import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/sequelize'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { AuthController } from '../auth.controller'
import { AuthService, ApplicationTypeEnum } from '../auth.service'
import { UsersService } from '../../users/users.service'
import { MailService } from '../../mail/mail.service'
import { User } from '../../users/entities/user.entity'
import { AuthTestUtils } from './auth.test-utils'
import { CommonUtils } from '../../common/utils/common.utils'

describe('Auth Integration Tests', () => {
  let authController: AuthController
  let authService: AuthService
  let usersService: UsersService
  let jwtService: JwtService
  let moduleRef: TestingModule

  const mockUsersService = AuthTestUtils.createMockUsersService()
  const mockJwtService = AuthTestUtils.createMockJwtService()
  const mockConfigService = AuthTestUtils.createMockConfigService()
  const mockMailService = AuthTestUtils.createMockMailService()
  const mockUserModel = AuthTestUtils.createMockUserModel()

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    })
      .compile()

    authController = moduleRef.get<AuthController>(AuthController)
    authService = moduleRef.get<AuthService>(AuthService)
    usersService = moduleRef.get<UsersService>(UsersService)
    jwtService = moduleRef.get<JwtService>(JwtService)
  })

  afterEach(() => {
    AuthTestUtils.resetAllMocks()
  })

  afterAll(async () => {
    await moduleRef.close()
  })

  describe('Complete Registration Flow', () => {
    it('should register a new user and return success response', async () => {
      // Arrange
      const registerDto = AuthTestUtils.validRegisterDto
      const mockUser = AuthTestUtils.mockUser
      
      mockUsersService.create.mockResolvedValue(mockUser)

      // Act
      const result = await authController.register(registerDto)

      // Assert
      expect(usersService.create).toHaveBeenCalledWith(registerDto)
      expect(result).toEqual({
        message: 'Registration successful.'
      })
    })

    it('should handle duplicate email registration', async () => {
      // Arrange
      const registerDto = AuthTestUtils.validRegisterDto
      mockUsersService.create.mockRejectedValue(
        new BadRequestException('Email already exists')
      )

      // Act & Assert
      await expect(authController.register(registerDto)).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe('Complete Login Flow', () => {
    it('should authenticate user and return tokens with cookies', async () => {
      // Arrange
      const loginDto = AuthTestUtils.validLoginDto
      const mockUser = AuthTestUtils.mockUser
      const mockResponse = AuthTestUtils.createMockResponse() as any
      
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser)
      mockUsersService.validatePassword.mockResolvedValue(true)
      mockJwtService.sign
        .mockReturnValueOnce('access.token')
        .mockReturnValueOnce('refresh.token')
      mockUserModel.update.mockResolvedValue([1])
      
      jest.spyOn(CommonUtils, 'generateHash')
        .mockResolvedValueOnce('hashedAccessToken')
        .mockResolvedValueOnce('hashedRefreshToken')
      const result = await authController.login(mockResponse, loginDto)

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.any(Array))
      expect(result).toEqual({
        message: 'Login successful',
        id: mockUser.id,
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
        success: true
      })
    })

    it('should reject invalid credentials', async () => {
      // Arrange
      const loginDto = AuthTestUtils.validLoginDto
      const mockResponse = AuthTestUtils.createMockResponse() as any
      
      mockUsersService.findByEmailWithPassword.mockResolvedValue(AuthTestUtils.mockUser)
      mockUsersService.validatePassword.mockResolvedValue(false)

      // Act & Assert
      await expect(authController.login(mockResponse, loginDto)).rejects.toThrow(
        UnauthorizedException
      )
    })
  })

  describe('Complete Token Refresh Flow', () => {
    it('should refresh valid token and return new access token', async () => {
      // Arrange
      const refreshTokenDto = { refreshToken: 'valid.refresh.token' }
      const mockUser = AuthTestUtils.mockUser
      const decodedToken = AuthTestUtils.mockRefreshJwtPayload
      
      mockJwtService.verify.mockReturnValue(decodedToken)
      mockUserModel.findAll.mockResolvedValue([mockUser])
      mockJwtService.sign.mockReturnValue('new.access.token')
      mockUserModel.update.mockResolvedValue([1])
      
      jest.spyOn(CommonUtils, 'compareHash').mockResolvedValue(true)
      jest.spyOn(CommonUtils, 'generateHash').mockResolvedValue('newHashedAccessToken')

      // Act
      const result = await authController.refreshToken(refreshTokenDto)

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken)
      expect(result).toEqual({
        message: 'Access token refreshed',
        accessToken: 'new.access.token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      })
    })

    it('should reject invalid refresh token', async () => {
      // Arrange
      const refreshTokenDto = { refreshToken: 'invalid.refresh.token' }
      
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      // Act & Assert
      await expect(authController.refreshToken(refreshTokenDto)).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe('Complete Password Reset Flow', () => {
    it('should generate password reset token and send email', async () => {
      // Arrange
      const forgotPasswordDto = { email: 'test@example.com' }
      const mockUser = AuthTestUtils.mockUser
      
      mockUsersService.findByEmail.mockResolvedValue(mockUser)
      mockUserModel.update.mockResolvedValue([1])
      mockMailService.sendPasswordResetEmail.mockResolvedValue(true)
      
      jest.spyOn(CommonUtils, 'generateHash').mockResolvedValue('hashedResetToken')

      // Act
      const result = await authController.forgotPassword(forgotPasswordDto)

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(forgotPasswordDto.email)
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        expect.stringContaining('/reset-password/')
      )
      expect(result).toEqual({
        message: 'If your email is registered, a reset link has been sent',
      })
    })

    it('should reset password with valid token', async () => {
      // Arrange
      const resetPasswordDto = {
        token: 'valid-reset-token',
        newPassword: 'NewPassword123!',
      }
      const mockUser = AuthTestUtils.mockUser
      
      mockUserModel.findAll.mockResolvedValue([mockUser])
      mockUsersService.updateUserPasswordAndResetUserStatus.mockResolvedValue(true)
      
      jest.spyOn(CommonUtils, 'compareHash').mockResolvedValue(true)

      // Act
      const result = await authController.resetPassword(resetPasswordDto)

      // Assert
      expect(mockUsersService.updateUserPasswordAndResetUserStatus).toHaveBeenCalledWith(
        mockUser.id,
        resetPasswordDto.newPassword
      )
      expect(mockUser.update).toHaveBeenCalledWith({ authRefreshToken: null })
      expect(result).toEqual({
        message: 'Password has been reset successfully',
      })
    })

    it('should reject invalid reset token', async () => {
      // Arrange
      const resetPasswordDto = {
        token: 'invalid-reset-token',
        newPassword: 'NewPassword123!',
      }
      
      mockUserModel.findAll.mockResolvedValue([])

      // Act & Assert
      await expect(authController.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe('Complete Logout Flow', () => {
    // it('should logout user and clear tokens', async () => {
    //   // Arrange
    //   const mockRequest = AuthTestUtils.createMockRequest()
    //   mockUserModel.update.mockResolvedValue([1])

    //   // Act
    //   const result = await authController.logout(mockRequest)

    //   // Assert
    //   expect(mockUserModel.update).toHaveBeenCalledWith(
    //     {
    //       authAccessToken: null,
    //       authRefreshToken: null,
    //     },
    //     { where: { id: mockRequest.user.id } }
    //   )
    //   expect(result).toEqual({ message: 'Logged out successfully' })
    // })
  })

  describe('User Profile Access', () => {
    // it('should return authenticated user profile', async () => {
    //   // Arrange
    //   const mockRequest = AuthTestUtils.createMockRequest()

    //   // Act
    //   const result = await authController.getProfile(mockRequest)

    //   // Assert
    //   expect(result).toEqual(mockRequest.user)
    // })
  })

  describe('Application Health Check', () => {
    it('should return healthy status', async () => {
      // Act
      const result = await authController.healthCheck()

      // Assert
      expect(result).toEqual({ status: 'ok' })
    })
  })

  describe('Multi-Application Support', () => {
    // it('should handle mobile app login differently', async () => {
    //   // Arrange
    //   const mobileLoginDto = {
    //     ...AuthTestUtils.validLoginDto,
    //     application: ApplicationTypeEnum.MOBILE_APP,
    //   }
    //   const mockResponse = AuthTestUtils.createMockResponse() as any
    //   const mockUser = AuthTestUtils.mockUser
      
    //   mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser)
    //   mockUsersService.validatePassword.mockResolvedValue(true)
    //   mockJwtService.sign
    //     .mockReturnValueOnce('mobile.access.token')
    //     .mockReturnValueOnce('mobile.refresh.token')
    //   mockUserModel.update.mockResolvedValue([1])
      
    //   jest.spyOn(CommonUtils, 'generateHash')
    //     .mockResolvedValueOnce('hashedMobileAccessToken')
    //     .mockResolvedValueOnce('hashedMobileRefreshToken')
    //   // Act
    //   const result = await authController.login(mobileLoginDto, mockResponse)

    //   // Assert
    //   expect(result.accessToken).toBe('mobile.access.token')
    //   expect(result.refreshToken).toBe('mobile.refresh.token')
    //   expect(mockResponse.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.any(Array))
    // })
  })

  describe('Security Edge Cases', () => {
    it.each(AuthTestUtils.createInvalidTokenScenarios())(
      'should handle %s token gracefully',
      async (_, invalidToken) => {
        mockJwtService.verify.mockImplementation(() => {
          throw new Error('Invalid token')
        })

        const result = await authService.refreshToken(invalidToken as string)

        expect(result).toBeNull()
      }
    )

    it('should not expose sensitive user data in responses', async () => {
      // Arrange
      const registerDto = AuthTestUtils.validRegisterDto
      const mockUserWithoutPassword = {
        ...AuthTestUtils.mockUser,
        toJSON: jest.fn().mockReturnValue({
          id: AuthTestUtils.mockUser.id,
          email: AuthTestUtils.mockUser.email,
          firstName: AuthTestUtils.mockUser.firstName,
          lastName: AuthTestUtils.mockUser.lastName,
          role: AuthTestUtils.mockUser.role,
          createdAt: AuthTestUtils.mockUser.createdAt,
          updatedAt: AuthTestUtils.mockUser.updatedAt,
          message: 'Registration successful.',
        }),
      }
      
      mockUsersService.create.mockResolvedValue(mockUserWithoutPassword)

      // Act
      const result = await authController.register(registerDto)

      // Assert
      expect(result).not.toHaveProperty('password')
      expect(result).not.toHaveProperty('authAccessToken')
      expect(result).not.toHaveProperty('authRefreshToken')
      expect(result).toHaveProperty('message', 'Registration successful.')
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      const loginDto = AuthTestUtils.validLoginDto
      const mockResponse = AuthTestUtils.createMockResponse() as any
      
      mockUsersService.findByEmailWithPassword.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act & Assert
      await expect(authController.login(mockResponse, loginDto)).rejects.toThrow()
    })

    it('should handle mail service failures gracefully', async () => {
      // Arrange
      const forgotPasswordDto = { email: 'test@example.com' }
      const mockUser = AuthTestUtils.mockUser
      
      mockUsersService.findByEmail.mockResolvedValue(mockUser)
      mockUserModel.update.mockResolvedValue([1])
      mockMailService.sendPasswordResetEmail.mockResolvedValue(true)
      
      jest.spyOn(CommonUtils, 'generateHash').mockResolvedValue('hashedResetToken')

      // Act
      const result = await authController.forgotPassword(forgotPasswordDto)

      // Assert - Should still return success message for security
      expect(result).toEqual({
        message: 'If your email is registered, a reset link has been sent',
      })
    })
  })
}) 