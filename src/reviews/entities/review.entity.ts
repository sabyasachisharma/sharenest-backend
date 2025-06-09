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

export enum ReviewType {
  PROPERTY = 'property',
  USER = 'user',
}

@Table
export class Review extends Model {
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
  reviewerId: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  reviewedId: string;

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  propertyId: string;

  @Column({
    type: DataType.ENUM(...Object.values(ReviewType)),
    allowNull: false,
  })
  type: ReviewType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  rating: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  comment: string;

  @BelongsTo(() => User, { foreignKey: 'reviewerId', as: 'reviewer' })
  reviewer: User;

  @BelongsTo(() => User, { foreignKey: 'reviewedId', as: 'reviewed' })
  reviewed: User;

  @BelongsTo(() => Property)
  property: Property;
}