# ShareNest API

Modern sublet and room-sharing platform API built with NestJS, TypeScript, and PostgreSQL.

## 🚀 Features

- JWT-based authentication with refresh tokens
- Role-based access control (Tenant/Landlord)
- Email verification and password reset
- Property listing management with image uploads
- Advanced search with multiple filters
- Booking system with approval workflow
- Review and rating system
- Favorite properties functionality

## 🛠️ Tech Stack

- Node.js & TypeScript
- NestJS framework
- PostgreSQL with Sequelize ORM
- JWT for authentication
- Nodemailer for email services
- Multer for file uploads
- Swagger for API documentation

## 📋 Prerequisites

- Node.js (v16+)
- PostgreSQL
- SMTP server for emails

## 🔧 Installation


## Create Migrations

Check Sequelize CLI commands:
<https://sequelize.org/v5/manual/migrations.html#the-cli>

Create Migration:
```bash
npx sequelize-cli migration:generate --name create-user-table
```

Run Migrations:
```bash
npx sequelize-cli db:migrate
```

Undo Migrations:
```bash
npx sequelize-cli db:migrate:undo
```


1. Clone the repository
2. Copy `.env.example` to `.env` and configure:
   ```env
   # Application
   NODE_ENV=development
   PORT=3000
   API_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:8080

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=sharenest_db

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d

   # Email
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=user@example.com
   EMAIL_PASSWORD=your-email-password
   EMAIL_FROM=no-reply@sharenest.com
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run start:dev
   ```

## 📚 API Documentation

### Authentication

#### Register User
- **POST** `/api/auth/register`
- Creates a new user account
- Body:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "Password123!",
    "role": "tenant",
    "phone": "+1234567890",
    "bio": "Looking for a nice place"
  }
  ```

#### Login
- **POST** `/api/auth/login`
- Authenticates user and returns tokens
- Body:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "Password123!",
    "rememberMe": true
  }
  ```

#### Refresh Token
- **POST** `/api/auth/refresh-token`
- Gets new access token using refresh token
- Body:
  ```json
  {
    "refreshToken": "token"
  }
  ```

#### Forgot Password
- **POST** `/api/auth/forgot-password`
- Sends password reset email
- Body:
  ```json
  {
    "email": "john.doe@example.com"
  }
  ```

### Properties

#### Create Property
- **POST** `/api/properties`
- Creates new property listing (Landlords only)
- Body:
  ```json
  {
    "title": "Cozy Studio Downtown",
    "description": "Beautiful studio apartment...",
    "category": "sublet",
    "city": "New York",
    "postcode": "10001",
    "address": "123 Main St",
    "price": 1500,
    "bedrooms": 1,
    "bathrooms": 1,
    "availableFrom": "2023-06-01",
    "availableTo": "2023-12-31",
    "amenities": ["WiFi", "AC"]
  }
  ```

#### Search Properties
- **GET** `/api/properties`
- Searches properties with filters
- Query Parameters:
  - `query`: Search text
  - `category`: Property category
  - `city`: City name
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `availableFrom`: Start date
  - `availableTo`: End date
  - `page`: Page number
  - `limit`: Items per page

### Bookings

#### Create Booking
- **POST** `/api/bookings`
- Creates booking request (Tenants only)
- Body:
  ```json
  {
    "propertyId": "uuid",
    "startDate": "2023-06-01",
    "endDate": "2023-06-15",
    "message": "I'm interested in booking..."
  }
  ```

#### Update Booking Status
- **PUT** `/api/bookings/:id/status`
- Updates booking status (Landlords only)
- Body:
  ```json
  {
    "status": "approved"
  }
  ```

### Reviews

#### Create Review
- **POST** `/api/reviews`
- Creates property or user review
- Body:
  ```json
  {
    "type": "property",
    "propertyId": "uuid",
    "rating": 5,
    "comment": "Great place!"
  }
  ```

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. Access Token: Short-lived token (15 minutes)
2. Refresh Token: Long-lived token (7 days)

Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 🚦 Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

Error responses include:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## 📝 Development Guidelines

1. Use TypeScript strict mode
2. Follow NestJS best practices
3. Write comprehensive unit tests
4. Document all new endpoints
5. Follow REST API conventions
6. Use proper HTTP methods and status codes

## 🔍 API Documentation

Swagger documentation is available at `/api/docs` when running in development mode.

## 📦 Database Models

### User
- id (UUID)
- firstName (string)
- lastName (string)
- email (string, unique)
- password (string, hashed)
- role (enum: tenant, landlord)
- phone (string, optional)
- profileImage (string, optional)
- bio (text, optional)
- isVerified (boolean)

### Property
- id (UUID)
- ownerId (UUID, FK to User)
- title (string)
- description (text)
- category (enum)
- city (string)
- postcode (string)
- address (string)
- price (decimal)
- bedrooms (integer)
- bathrooms (integer)
- availableFrom (date)
- availableTo (date, optional)
- amenities (string[])
- isActive (boolean)

### Booking
- id (UUID)
- propertyId (UUID, FK to Property)
- tenantId (UUID, FK to User)
- startDate (date)
- endDate (date)
- status (enum: pending, approved, rejected, cancelled)
- message (text, optional)

### Review
- id (UUID)
- reviewerId (UUID, FK to User)
- reviewedId (UUID, FK to User, optional)
- propertyId (UUID, FK to Property, optional)
- type (enum: property, user)
- rating (integer, 1-5)
- comment (text, optional)

## 📄 License

MIT License