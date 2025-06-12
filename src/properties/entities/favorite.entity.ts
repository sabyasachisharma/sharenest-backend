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
import { Property } from './property.entity'

@Table({
  tableName: 'Favorites',
  timestamps: true,
})
export class Favorite extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    field: 'user_id',
  })
  userId: string

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    field: 'property_id',
  })
  propertyId: string

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date

  // Relationships
  @BelongsTo(() => User)
  user: User

  @BelongsTo(() => Property)
  property: Property
}