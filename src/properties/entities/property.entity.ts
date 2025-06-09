import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { PropertyImage } from './property-image.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Favorite } from './favorite.entity';

export enum PropertyCategory {
  SHARED_FLAT = 'shared_flat',
  SUBLET = 'sublet',
  STUDENT_HOUSING = 'student_housing',
}

@Table
export class Property extends Model {
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
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(PropertyCategory)),
    allowNull: false,
  })
  category: PropertyCategory;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  city: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  postcode: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'month',
  })
  priceUnit: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  bedrooms: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  bathrooms: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  size: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  sizeUnit: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  availableFrom: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  availableTo: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('amenities');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value: string[]) {
      this.setDataValue('amenities', JSON.stringify(value));
    }
  })
  amenities: string[];

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  ownerId: string;

  @BelongsTo(() => User)
  owner: User;

  @HasMany(() => PropertyImage)
  images: PropertyImage[];

  @HasMany(() => Booking)
  bookings: Booking[];

  @HasMany(() => Review)
  reviews: Review[];

  @HasMany(() => Favorite)
  favorites: Favorite[];

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  latitude: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  longitude: number;
}