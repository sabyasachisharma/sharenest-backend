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
import { User } from '../../users/entities/user.entity'
import { Property } from '../../properties/entities/property.entity'

@Table({
  tableName: 'Reviews',
  timestamps: true,
})
export class Review extends Model {
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
    field: 'reviewer_id',
  })
  reviewerId: string

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'property_id',
  })
  propertyId: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  rating: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  comment: string

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date

  // Relationships
  @BelongsTo(() => User, { foreignKey: 'reviewerId', as: 'reviewer' })
  reviewer: User

  @BelongsTo(() => Property)
  property: Property
}