import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import * as express from 'express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Set global prefix
  app.setGlobalPrefix('api')
  
  // Setup validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }))
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  // Serve static files (property images)
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))
  
  // Setup Swagger documentation
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