import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Property } from './property.entity';

@Table
export class Favorite extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  userId: string;

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  propertyId: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Property)
  property: Property;
}