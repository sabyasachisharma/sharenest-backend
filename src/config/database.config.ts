import { registerAs } from '@nestjs/config'

export default registerAs('database', () => ({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'sharenestadmin',
  password: process.env.DB_PASSWORD || 'sharenest123',
  database: process.env.DB_NAME || 'sharenest',
  pool: {
    max: 20,
    min: 5,
    acquire: 60000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
  }
})) 