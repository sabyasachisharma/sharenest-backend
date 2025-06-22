import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript'
import { Property } from './property.entity'

@Table({
  tableName: 'PropertyImages',
  timestamps: true,
})
export class PropertyImage extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'property_id',
  })
  propertyId: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'image_url',
  })
  imageUrl: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'cloudinary_public_id',
  })
  cloudinaryPublicId: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'sort_order',
  })
  sortOrder: number

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date

  @BelongsTo(() => Property)
  property: Property
}