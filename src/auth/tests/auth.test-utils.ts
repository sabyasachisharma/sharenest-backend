import { User } from '../../users/entities/user.entity'
import { RegisterDto } from '../dto/register.dto'
import { LoginDto } from '../dto/login.dto'
import { ApplicationTypeEnum } from '../auth.service'

export class AuthTestUtils {
  static readonly mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    password: 'hashedPassword',
    authAccessToken: 'hashedAccessToken',
    authRefreshToken: 'hashedRefreshToken',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    lastAuthenticated: new Date('2023-01-01T00:00:00.000Z'),
    toJSON: jest.fn().mockReturnValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    }),
    update: jest.fn(),
    save: jest.fn(),
  }

  static readonly mockAdminUser = {
    ...AuthTestUtils.mockUser,
    id: '456e7890-e89b-12d3-a456-426614174000',
    email: 'admin@example.com',
    role: 'admin',
    toJSON: jest.fn().mockReturnValue({
      id: '456e7890-e89b-12d3-a456-426614174000',
      email: 'admin@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
      updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    }),
  }

  static readonly validRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
  } as RegisterDto

  static readonly validLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'Password123!',
    application: ApplicationTypeEnum.WEB_APP,
  } as LoginDto

  static readonly mockTokens = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE1MTYyMzkwMjJ9',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTUxNjIzOTAyMn0',
  }

  static readonly mockJwtPayload = {
    sub: AuthTestUtils.mockUser.id,
    email: AuthTestUtils.mockUser.email,
    role: AuthTestUtils.mockUser.role,
    type: 'access',
    iat: 1516239022,
    exp: 1516242622,
  }

  static readonly mockRefreshJwtPayload = {
    sub: AuthTestUtils.mockUser.id,
    email: AuthTestUtils.mockUser.email,
    type: 'refresh',
    iat: 1516239022,
    exp: 1516842622,
  }

  static createMockRequest(user?: any) {
    const mockUser = user || {
      id: AuthTestUtils.mockUser.id,
      email: AuthTestUtils.mockUser.email,
      firstName: AuthTestUtils.mockUser.firstName,
      lastName: AuthTestUtils.mockUser.lastName,
      role: AuthTestUtils.mockUser.role,
    }
    
    return {
      user: mockUser,
      headers: {
        authorization: `Bearer ${AuthTestUtils.mockTokens.accessToken}`,
      },
    }
  }

  static createMockResponse() {
    return {
      setHeader: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
  }

  static createMockUserModel() {
    return {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      bulkCreate: jest.fn(),
      count: jest.fn(),
    }
  }

  static createMockUsersService() {
    return {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      validatePassword: jest.fn(),
      updateUserPasswordAndResetUserStatus: jest.fn(),
    }
  }

  static createMockJwtService() {
    return {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    }
  }

  static createMockConfigService() {
    const defaultConfig = {
      JWT_ACCESS_TOKEN_EXPIRATION: '1h',
      JWT_REFRESH_TOKEN_EXPIRATION: '7d',
      JWT_ACCESS_COOKIE_EXPIRATION: '3600',
      JWT_REFRESH_COOKIE_EXPIRATION: '604800',
      SIGNUP_DOMAIN: 'localhost',
      FRONTEND_URL: 'http://localhost:3000',
    }

    return {
      get: jest.fn((key: string) => defaultConfig[key]),
    }
  }

  static createMockMailService() {
    return {
      sendPasswordResetEmail: jest.fn(),
      sendWelcomeEmail: jest.fn(),
      sendVerificationEmail: jest.fn(),
    }
  }

  static resetAllMocks() {
    jest.clearAllMocks()
    jest.resetAllMocks()
  }

  static createInvalidTokenScenarios() {
    return [
      ['empty string', ''],
      ['null', null],
      ['undefined', undefined],
      ['invalid format', 'invalid.token.format'],
      ['expired token', 'expired.jwt.token'],
      ['malformed header', 'malformed-header.valid-payload.valid-signature'],
    ]
  }

  static createPasswordResetScenarios() {
    return [
      ['valid token and password', 'valid-reset-token', 'NewPassword123!', true],
      ['invalid token', 'invalid-token', 'NewPassword123!', false],
      ['expired token', 'expired-token', 'NewPassword123!', false],
      ['weak password', 'valid-reset-token', '123', false],
    ]
  }

  static createValidationScenarios() {
    return [
      ['valid email and password', 'test@example.com', 'Password123!', true],
      ['invalid email format', 'invalid-email', 'Password123!', false],
      ['empty password', 'test@example.com', '', false],
      ['non-existent user', 'nonexistent@example.com', 'Password123!', false],
    ]
  }
} 