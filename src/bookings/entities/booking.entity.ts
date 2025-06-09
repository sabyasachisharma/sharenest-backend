import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Table
export class Booking extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tenantId: string;

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  propertyId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(BookingStatus)),
    defaultValue: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  message: string;

  @BelongsTo(() => User, { as: 'tenant' })
  tenant: User;

  @BelongsTo(() => Property)
  property: Property;
}