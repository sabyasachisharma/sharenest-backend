import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import * as express from 'express'
import cookieParser from 'cookie-parser'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())

  // Set global prefix
  app.setGlobalPrefix('api')

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }))

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))

  const config = new DocumentBuilder()
    .setTitle('ShareNest API')
    .setDescription('The ShareNest API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('properties', 'Property management endpoints')
    .addTag('bookings', 'Booking management endpoints')
    .addTag('reviews', 'Review management endpoints')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  Logger.log(`Application is running on: http://localhost:${port}`)
}

bootstrap()
