import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript'
import { User } from '../../users/entities/user.entity'
import { Booking } from '../../bookings/entities/booking.entity'
import { Review } from '../../reviews/entities/review.entity'
import { Favorite } from './favorite.entity'
import { PropertyImage } from './property-image.entity'
import { PropertyCategory } from 'src/common/enums/property-category.enum'

@Table({
  tableName: 'Properties',
  timestamps: true,
})
export class Property extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'owner_id',
  })
  ownerId: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string

  @Column({
    type: DataType.ENUM(...Object.values(PropertyCategory)),
    allowNull: false,
  })
  category: PropertyCategory

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  city: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  postcode: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  street: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'house_number',
  })
  houseNumber: string

  @Column({
    type: DataType.DECIMAL(8, 6),
    allowNull: true,
  })
  latitude: number

  @Column({
    type: DataType.DECIMAL(9, 6),
    allowNull: true,
  })
  longitude: number

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  bedrooms: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  bathrooms: number

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  size: number

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  amenities: string[]

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'image_url',
  })
  imageUrl: string

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'available_from',
  })
  availableFrom: Date

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'available_to',
  })
  availableTo: Date

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_available',
  })
  isAvailable: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  isActive: boolean

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date

  @BelongsTo(() => User)
  owner: User

  @HasMany(() => PropertyImage)
  images: PropertyImage[]

  @HasMany(() => Booking)
  bookings: Booking[]

  @HasMany(() => Review)
  reviews: Review[]

  @HasMany(() => Favorite)
  favorites: Favorite[]
}