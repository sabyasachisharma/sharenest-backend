import {
  Table,
  Column,
  Model,
  DataType,
  Unique,
  UpdatedAt,
  CreatedAt,
} from 'sequelize-typescript'
import { UserRole } from '../../auth/enums/role.enum'
import { UserStatusEnum } from '../../auth/enums/user-status.enum'


@Table({
  tableName: 'Users',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'first_name',
  })
  firstName: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'last_name',
  })
  lastName: string

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  role: UserRole

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'profile_image',
  })
  profileImage: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'auth_access_token',
  })
  authAccessToken: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'auth_refresh_token',
  })
  authRefreshToken: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'EN',
  })
  language: string

  @Column({
    type: DataType.ENUM(UserStatusEnum.ACTIVE, UserStatusEnum.INACTIVE, UserStatusEnum.BLOCKED),
  })
  status: string
  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date
}