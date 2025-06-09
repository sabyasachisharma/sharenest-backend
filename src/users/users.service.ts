import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import { CommonUtils } from '../common/utils/common.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    Logger.log(`Creating user with email: ${createUserDto.email}`);
    
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });
    
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password and prepare user data
    const hashedPassword = await CommonUtils.generatePasswordHash(createUserDto.password);
    
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    };

    const user = await this.userModel.create(userData);
    Logger.log(`User created successfully with ID: ${user.id}`);
    
    return user;
  }

  async validatePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return CommonUtils.validatePassword(candidatePassword, hashedPassword);
  }

  async updateUserPasswordAndResetUserStatus(userId: string, password: string): Promise<void> {
    const hashedPassword = await CommonUtils.generatePasswordHash(password);
    
    await this.userModel.update(
      {
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        updatedAt: new Date(),
      },
      { where: { id: userId } }
    );
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({
      where: { email },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    return this.userModel.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // If email is being updated, check for uniqueness
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }
    
    await user.update(updateUserDto);
    return user;
  }

  async updateProfileImage(id: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findOne(id);
    
    const imagePath = `${file.path.replace('\\', '/')}`;
    const apiUrl = this.configService.get('API_URL');
    const imageUrl = `${apiUrl}/${imagePath}`;
    
    await user.update({ profileImage: imageUrl });
    return user;
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.userModel.findByPk(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const isPasswordValid = await CommonUtils.comparePassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return false;
    }
    
    await this.updateUserPasswordAndResetUserStatus(id, newPassword);
    return true;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}