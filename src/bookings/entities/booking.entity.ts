import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { User } from '../../users/entities/user.entity'
import { Property } from '../../properties/entities/property.entity'
import { BookingStatus } from '../../common/enums/booking-status.enum'

@Table({
  tableName: 'Bookings',
  timestamps: true,
  underscored: true,
})
export class Booking extends Model {
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
    field: 'tenant_id',
  })
  tenantId: string

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'property_id',
  })
  propertyId: string

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'start_date',
  })
  startDate: Date

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'end_date',
  })
  endDate: Date

  @Column({
    type: DataType.ENUM(...Object.values(BookingStatus)),
    allowNull: false,
    defaultValue: BookingStatus.PENDING,
  })
  status: BookingStatus

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  message: string

  @BelongsTo(() => User, { as: 'tenant' })
  tenant: User

  @BelongsTo(() => Property)
  property: Property
}