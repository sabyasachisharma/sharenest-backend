import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
  Unique,
  DefaultScope,
  Scopes,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Property } from '../../properties/entities/property.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Favorite } from '../../properties/entities/favorite.entity';

export enum UserRole {
  TENANT = 'tenant',
  LANDLORD = 'landlord',
}

@DefaultScope(() => ({
  attributes: { exclude: ['password'] },
}))
@Scopes(() => ({
  withPassword: {
    attributes: { include: ['password'] },
  },
}))
@Table
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  role: UserRole;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profileImage: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isVerified: boolean;

  @HasMany(() => Property)
  properties: Property[];

  @HasMany(() => Booking)
  bookings: Booking[];

  @HasMany(() => Review, {
    foreignKey: 'reviewerId',
    as: 'givenReviews',
  })
  givenReviews: Review[];

  @HasMany(() => Review, {
    foreignKey: 'reviewedId',
    as: 'receivedReviews',
  })
  receivedReviews: Review[];

  @HasMany(() => Favorite)
  favorites: Favorite[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}