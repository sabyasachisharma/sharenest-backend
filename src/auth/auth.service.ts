import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationToken } from './entities/verification-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailService } from '../mail/mail.service';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectModel(RefreshToken)
    private readonly refreshTokenModel: typeof RefreshToken,
    @InjectModel(VerificationToken)
    private readonly verificationTokenModel: typeof VerificationToken,
    @InjectModel(PasswordResetToken)
    private readonly passwordResetTokenModel: typeof PasswordResetToken
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailWithPassword(email);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Remove password from returned object
    const { password: _, ...result } = user.toJSON();
    return result;
  }

  async register(registerDto: RegisterDto): Promise<any> {
    try {
      // Create user
      const user = await this.usersService.create(registerDto);
      
      // Generate verification token
      await this.generateVerificationToken(user);
      
      const { password: _, ...result } = user.toJSON();
      return {
        ...result,
        message: 'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async login(user: any, rememberMe: boolean = false): Promise<any> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    const accessToken = this.jwtService.sign(payload);
    let refreshToken = null;
    
    if (rememberMe) {
      refreshToken = await this.generateRefreshToken(user.id);
    }
    
    return {
      user,
      accessToken,
      refreshToken: refreshToken?.token || null,
    };
  }

  async refreshToken(token: string): Promise<any> {
    try {
      const refreshToken = await this.refreshTokenModel.findOne({
        where: {
          token,
          isRevoked: false,
        },
        include: [User],
      });
      
      if (!refreshToken || new Date() > refreshToken.expiresAt) {
        return null;
      }
      
      const user = refreshToken.user;
      const payload = { sub: user.id, email: user.email, role: user.role };
      
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      return null;
    }
  }

  async logout(userId: string): Promise<boolean> {
    try {
      // Revoke all refresh tokens for the user
      await this.refreshTokenModel.update(
        { isRevoked: true },
        { where: { userId, isRevoked: false } },
      );
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async generateRefreshToken(userId: string): Promise<RefreshToken> {
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRATION') || '7d';
    const token = uuidv4();
    
    // Calculate expiration date
    const expiresAt = new Date();
    if (expiresIn.endsWith('d')) {
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn.slice(0, -1), 10));
    } else if (expiresIn.endsWith('h')) {
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn.slice(0, -1), 10));
    } else if (expiresIn.endsWith('m')) {
      expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiresIn.slice(0, -1), 10));
    }
    
    // Create refresh token
    const refreshToken = await this.refreshTokenModel.create({
      token,
      userId,
      expiresAt,
    });
    
    return refreshToken;
  }

  async generateVerificationToken(user: User): Promise<VerificationToken> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiration
    
    // Create verification token
    const verificationToken = await this.verificationTokenModel.create({
      token,
      userId: user.id,
      expiresAt,
    });
    
    // Send verification email
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email/${token}`;
    await this.mailService.sendVerificationEmail(user.email, user.firstName, verificationUrl);
    
    return verificationToken;
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const verificationToken = await this.verificationTokenModel.findOne({
        where: { token },
        include: [User],
      });
      
      if (!verificationToken || new Date() > verificationToken.expiresAt) {
        return false;
      }
      
      const user = verificationToken.user;
      await this.usersService.markAsVerified(user.id);
      
      // Delete the token after use
      await verificationToken.destroy();
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async generatePasswordResetToken(email: string): Promise<PasswordResetToken | null> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration
    
    // Create password reset token
    const passwordResetToken = await this.passwordResetTokenModel.create({
      token,
      userId: user.id,
      expiresAt,
    });
    
    // Send password reset email
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password/${token}`;
    await this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetUrl);
    
    return passwordResetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const passwordResetToken = await this.passwordResetTokenModel.findOne({
        where: {
          token,
          isUsed: false,
        },
        include: [User],
      });
      
      if (!passwordResetToken || new Date() > passwordResetToken.expiresAt) {
        return false;
      }
      
      const user = passwordResetToken.user;
      await user.update({ password: newPassword });
      
      // Mark the token as used
      await passwordResetToken.update({ isUsed: true });
      
      return true;
    } catch (error) {
      return false;
    }
  }
}