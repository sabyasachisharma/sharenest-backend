import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/sequelize'
import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { UsersService } from '../users/users.service'
import { User } from '../users/entities/user.entity'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { MailService } from '../mail/mail.service'
import { CommonUtils } from '../common/utils/common.utils'

export enum ApplicationTypeEnum {
  MOBILE_APP = 'mobile_app',
  WEB_APP = 'web_app',
}

export class AuthConstants {
  static readonly ACCESS_TOKEN = 'accessToken'
  static readonly REFRESH_TOKEN = 'refreshToken'
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmailWithPassword(email)
    
    if (user) {
      const isPasswordValid = await this.usersService.validatePassword(password, user.password)
      if (isPasswordValid) {
        return user
      }
    }
    return null
  }

  async register(registerDto: RegisterDto): Promise<any> {
    try {
      const user = await this.usersService.create(registerDto)
      
      const { password: _, ...result } = user.toJSON()
      return {
        message: 'Registration successful.',
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Registration failed')
    }
  }

  async login(response: Response, loginDto: LoginDto): Promise<any> {
    const user = await this.validateUser(loginDto.email, loginDto.password)
  
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
  
    return this.createUserTokens(response, user)
  }
  
  async createUserTokens(response: Response, user: User) {
    const { accessTokenMobile, accessToken } = await this.createAccessToken(user)
    const { refreshTokenMobile, refreshToken } = await this.createRefreshToken(user)
  
    response.setHeader('Set-Cookie', [accessTokenMobile, refreshTokenMobile])
  
    Logger.log(`User ${user.email} logged in successfully. Token issued.`)

    return {
      id: user.id,
      accessToken: accessToken,
      refreshToken: refreshToken,
      success: true,
    }
  }
  
  async createAccessToken(user: User) {
    const accessToken = await this.generateAccessToken(user)
    const accessTokenHash = await CommonUtils.generateHash(accessToken)
  
    await this.userModel.update(
      {
        authAccessToken: accessTokenHash,
        lastAuthenticated: new Date(),
        updatedAt: new Date(),
      },
      { where: { id: user.id } }
    )  
    return {
      accessTokenMobile: `${AuthConstants.ACCESS_TOKEN}=${accessToken}; HttpOnly; Domain=${process.env.SIGNUP_DOMAIN}; Path=/; Max-Age=${process.env.JWT_ACCESS_COOKIE_EXPIRATION}`,
      accessToken: accessToken,
    }
  }
  
  async createRefreshToken(user: User) {
    const refreshToken = await this.generateRefreshToken(user)
    const refreshTokenHash = await CommonUtils.generateHash(refreshToken)
  
    await this.userModel.update(
      {
        authRefreshToken: refreshTokenHash,
        lastAuthenticated: new Date(),
        updatedAt: new Date(),
      },
      { where: { id: user.id } }
    )
    return {
      refreshTokenMobile: `${AuthConstants.REFRESH_TOKEN}=${refreshToken}; HttpOnly; Domain=${process.env.SIGNUP_DOMAIN}; Path=/; Max-Age=${process.env.JWT_REFRESH_COOKIE_EXPIRATION}`,
      refreshToken: refreshToken,
    }
  }  

  async generateAccessToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      tokenType: "auth",
      user: {
        id: user.id,
        email: user.email.toLowerCase(),
        role: user.roles,
      },
    }
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION
    })
  }

  async generateRefreshToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      tokenType: "auth",
      user: {
        id: user.id,
        email: user.email.toLowerCase(),
        role: user.roles,
      },
    }
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      expiresIn: '7d', // 7 days in seconds
    })
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      // First, verify the JWT token structure
      const decoded = this.jwtService.verify(refreshToken)
      
      // Find user with this refresh token hash
      const users = await this.userModel.findAll({
        where: { authRefreshToken: { [require('sequelize').Op.ne]: null } }
      })
      
      let validUser = null
      
      for (const user of users) {
        if (user.authRefreshToken && await CommonUtils.compareHash(refreshToken, user.authRefreshToken)) {
          validUser = user
          break
        }
      }
      
      if (!validUser || decoded.sub !== validUser.id) {
        return null
      }
      
      // Generate new access token
      const newAccessToken = await this.generateAccessToken(validUser)
      const accessTokenHash = await CommonUtils.generateHash(newAccessToken)
      
      // Update access token in user table
      await validUser.update({ 
        authAccessToken: accessTokenHash,
        lastAuthenticated: new Date(),
        updatedAt: new Date(),
      })
      
      return {
        accessToken: newAccessToken,
        user: {
          id: validUser.id,
          email: validUser.email,
          role: validUser.role,
        }
      }
    } catch (error) {
      Logger.error(`Refresh token error: {error}`)
      return null
    }
  }

  async generatePasswordResetToken(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email)
    
    if (!user) {
      return false
    }
    
    const resetToken = uuidv4()
    const resetTokenHash = await CommonUtils.generateHash(resetToken)
    
    // Store reset token in user table (reuse authRefreshToken field for this)
    await this.userModel.update(
      { authRefreshToken: resetTokenHash },
      { where: { id: user.id } }
    )
    
    // Send password reset email
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password/${resetToken}`
    await this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetUrl)
    
    return true
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Find user with this reset token hash
      const users = await this.userModel.findAll({
        where: { authRefreshToken: { [require('sequelize').Op.ne]: null } }
      })
      
      let validUser = null
      
      // Check each user's hashed reset token
      for (const user of users) {
        if (user.authRefreshToken && await CommonUtils.compareHash(token, user.authRefreshToken)) {
          validUser = user
          break
        }
      }
      
      if (!validUser) {
        return false
      }
      
      await this.usersService.updateUserPasswordAndResetUserStatus(validUser.id, newPassword)
      
      // Clear the reset token
      await validUser.update({ authRefreshToken: null })
      
      return true
    } catch (error) {
      Logger.error('Password reset error:', error)
      return false
    }
  }
}