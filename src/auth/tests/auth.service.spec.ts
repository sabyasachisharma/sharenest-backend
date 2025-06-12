import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/sequelize'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { Response } from 'express'
import { AuthService, ApplicationTypeEnum } from '../auth.service'
import { UsersService } from '../../users/users.service'
import { MailService } from '../../mail/mail.service'
import { CommonUtils } from '../../common/utils/common.utils'
import { User } from '../../users/entities/user.entity'
import { RegisterDto } from '../dto/register.dto'
import { LoginDto } from '../dto/login.dto'

describe('AuthService', () => {
  let authService: AuthService
  let usersService: UsersService
  let jwtService: JwtService
  let configService: ConfigService
  let mailService: MailService
  let userModel: typeof User
  let moduleRef: TestingModule

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    password: 'hashedPassword',
    authAccessToken: 'hashedAccessToken',
    authRefreshToken: 'hashedRefreshToken',
    toJSON: jest.fn().mockReturnValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      password: 'hashedPassword',
      authAccessToken: 'hashedAccessToken',
      authRefreshToken: 'hashedRefreshToken',  
    }),
    update: jest.fn(),
  }

  const mockUsersService = {
    findByEmailWithPassword: jest.fn(),
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
    create: jest.fn(),
    updateUserPasswordAndResetUserStatus: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
  }

  const mockUserModel = {
    update: jest.fn(),
    findAll: jest.fn(),
  }

  const mockResponse = {
    setHeader: jest.fn(),
    cookie: jest.fn(),
  } as unknown as Response

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
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
    }).compile()

    authService = moduleRef.get<AuthService>(AuthService)
    usersService = moduleRef.get<UsersService>(UsersService)
    jwtService = moduleRef.get<JwtService>(JwtService)
    configService = moduleRef.get<ConfigService>(ConfigService)
    mailService = moduleRef.get<MailService>(MailService)
    userModel = moduleRef.get<typeof User>(getModelToken(User))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await moduleRef.close()
  })

  describe('validateUser', () => {
    it('should return null for invalid password', async () => {
      const email = 'test@example.com'
      const password = 'wrongPassword'
      
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser)
      mockUsersService.validatePassword.mockResolvedValue(false)

      const result = await authService.validateUser(email, password)

      expect(result).toBeNull()
    })

    it('should return null for non-existent user', async () => {
      const email = 'nonexistent@example.com'
      const password = 'password123'
      
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null)

      const result = await authService.validateUser(email, password)

      expect(result).toBeNull()
    })
  })

  describe('Check the flow of register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    } as RegisterDto

    it('should register user successfully', async () => {
      const expectedResult = {
        message: 'Registration successful.',
      }

      mockUsersService.create.mockResolvedValue(mockUser)

      const result = await authService.register(registerDto)

      expect(usersService.create).toHaveBeenCalledWith(registerDto)
      expect(result).toEqual(expectedResult)
    })

    it('should throw BadRequestException when user creation fails', async () => {
      mockUsersService.create.mockRejectedValue(
        new BadRequestException('Email already exists')
      )

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException
      )
    })

    it('should throw BadRequestException for generic errors', async () => {
      mockUsersService.create.mockRejectedValue(new Error('Database error'))

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    } as LoginDto

    beforeEach(() => {
      jest.spyOn(authService, 'validateUser')
      jest.spyOn(authService, 'createUserTokens')
    })

    it('should login user successfully', async () => {
      const expectedTokensWithSuccess = {
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
        user: mockUser.toJSON(),
        id: mockUser.id,
        success: true
      }
      
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser.toJSON())
      jest.spyOn(authService, 'createUserTokens').mockResolvedValue(expectedTokensWithSuccess)

      const result = await authService.login(mockResponse, loginDto)

      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password)
      expect(authService.createUserTokens).toHaveBeenCalledWith(
        mockResponse,
        mockUser.toJSON()
      )
      expect(result).toEqual(expectedTokensWithSuccess)
    })

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null)

      await expect(authService.login(mockResponse, loginDto)).rejects.toThrow(
        UnauthorizedException
      )
    })
  })

  describe('createUserTokens', () => {
    it('should create and return user tokens', async () => {
      const result = await authService.createUserTokens(mockResponse, mockUser.toJSON())
      expect(result).toEqual({
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
        user: mockUser.toJSON(),
        id: mockUser.id,
        success: true
      })
    })

    it('should create and return user tokens with mobile app', async () => {
      const result = await authService.createUserTokens(mockResponse, mockUser.toJSON())
      expect(result).toEqual({
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
        user: mockUser.toJSON(),
        id: mockUser.id,
        success: true
      })
    })

    it('should create and return user tokens with web app', async () => {
      const result = await authService.createUserTokens(mockResponse, mockUser.toJSON())
      expect(result).toEqual({
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
        user: mockUser.toJSON(),
        id: mockUser.id,
        success: true
      })
    })
  })

  



  describe('refreshToken', () => {
    const refreshToken = 'valid.refresh.token'
    const decodedToken = {
      sub: mockUser.id,
      email: mockUser.email,
      type: 'refresh',
    }

    beforeEach(() => {
      jest.spyOn(CommonUtils, 'compareHash').mockResolvedValue(true)
      jest.spyOn(CommonUtils, 'generateHash').mockResolvedValue('hashedToken')
    })

    it('should refresh token successfully', async () => {
      mockJwtService.verify.mockReturnValue(decodedToken)
      mockUserModel.findAll.mockResolvedValue([mockUser])
      jest.spyOn(authService, 'generateAccessToken').mockResolvedValue('new.access.token')

      const result = await authService.refreshToken(refreshToken)

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken)
      expect(result).toEqual({
        accessToken: 'new.access.token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      })
    })

    it('should return null for invalid JWT token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = await authService.refreshToken('invalid.token')

      expect(result).toBeNull()
    })

    it('should return null when no matching user found', async () => {
      mockJwtService.verify.mockReturnValue(decodedToken)
      mockUserModel.findAll.mockResolvedValue([])

      const result = await authService.refreshToken(refreshToken)

      expect(result).toBeNull()
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockUserModel.update.mockResolvedValue([1])

      const result = await authService.logout(mockUser.id)

      expect(userModel.update).toHaveBeenCalledWith(
        {
          authAccessToken: null,
          authRefreshToken: null,
        },
        { where: { id: mockUser.id } }
      )
      expect(result).toBe(true)
    })

    it('should return false on logout error', async () => {
      mockUserModel.update.mockRejectedValue(new Error('Database error'))

      const result = await authService.logout(mockUser.id)

      expect(result).toBe(false)
    })
  })

  describe('generatePasswordResetToken', () => {
    const email = 'test@example.com'

    beforeEach(() => {
      jest.spyOn(CommonUtils, 'generateHash').mockResolvedValue('hashedResetToken')
    })

    it('should generate password reset token for existing user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser)
      mockUserModel.update.mockResolvedValue([1])
      mockConfigService.get.mockReturnValue('http://localhost:3000')
      mockMailService.sendPasswordResetEmail.mockResolvedValue(true)

      const result = await authService.generatePasswordResetToken(email)

      expect(usersService.findByEmail).toHaveBeenCalledWith(email)
      expect(userModel.update).toHaveBeenCalledWith(
        { authRefreshToken: 'hashedResetToken' },
        { where: { id: mockUser.id } }
      )
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        expect.stringContaining('http://localhost:3000/reset-password/')
      )
      expect(result).toBe(true)
    })

    it('should return false for non-existent user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null)

      const result = await authService.generatePasswordResetToken(email)

      expect(result).toBe(false)
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    const token = 'reset-token'
    const newPassword = 'newPassword123'

    beforeEach(() => {
      jest.spyOn(CommonUtils, 'compareHash').mockResolvedValue(true)
    })

    it('should reset password successfully', async () => {
      mockUserModel.findAll.mockResolvedValue([mockUser])
      mockUsersService.updateUserPasswordAndResetUserStatus.mockResolvedValue(true)

      const result = await authService.resetPassword(token, newPassword)

      expect(usersService.updateUserPasswordAndResetUserStatus).toHaveBeenCalledWith(
        mockUser.id,
        newPassword
      )
      expect(mockUser.update).toHaveBeenCalledWith({ authRefreshToken: null })
      expect(result).toBe(true)
    })

    it('should return false for invalid token', async () => {
      mockUserModel.findAll.mockResolvedValue([])

      const result = await authService.resetPassword(token, newPassword)

      expect(result).toBe(false)
    })

    it('should return false on password reset error', async () => {
      mockUserModel.findAll.mockResolvedValue([mockUser])
      mockUsersService.updateUserPasswordAndResetUserStatus.mockRejectedValue(
        new Error('Database error')
      )

      const result = await authService.resetPassword(token, newPassword)

      expect(result).toBe(false)
    })
  })

  describe('token validation edge cases', () => {
    it.each([
      ['empty string token', ''],
      ['null token', null],
      ['undefined token', undefined],
      ['malformed token', 'not.a.valid.jwt.token.format'],
    ])('should handle %s gracefully', async (_, invalidToken) => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = await authService.refreshToken(invalidToken as string)

      expect(result).toBeNull()
    })
  })
})