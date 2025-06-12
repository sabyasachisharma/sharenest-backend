import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { Property } from './property.entity'

@Table
export class PropertyImage extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  url: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isFeatured: boolean

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  displayOrder: number

  @ForeignKey(() => Property)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  propertyId: string

  @BelongsTo(() => Property)
  property: Property
}