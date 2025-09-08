# ShareNest API

Modern sublet and room-sharing platform API built with NestJS, TypeScript, and PostgreSQL.

## Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- SMTP server for emails

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sharenest-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb sharenest_db
   
   # Run migrations
   npx sequelize-cli db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run start:dev
   ```

6. **Access the API**
   - API: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/api/docs


##  Features

- **Authentication System**
  - JWT-based auth with refresh tokens
  - Role-based access (Tenant/Landlord)
  - Email verification & password reset
  - Secure cookie handling

- **Property Management**
  - Create, update, delete properties
  - Image upload with Cloudinary
  - Advanced search with filters
  - Property categories and amenities

- **Booking System**
  - Booking requests and approvals
  - Date validation and conflicts
  - Email notifications
  - Status tracking

- **User Features**
  - User profiles with images
  - Favorite properties
  - Review and rating system
  - Property owner/tenant roles

## 📋 Database Migrations

### Create New Migration
```bash
npx sequelize-cli migration:generate --name your-migration-name
```

### Run Migrations
```bash
npx sequelize-cli db:migrate
```

### Rollback Migration
```bash
npx sequelize-cli db:migrate:undo
```

### Check Migration Status
```bash
npx sequelize-cli db:migrate:status
```

## 📚 API Documentation

### Interactive Documentation
Access the full Swagger API documentation at: **http://localhost:3000/api/docs**

### Quick API Reference

#### 🔐 Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

#### 🏠 Property Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Search properties with filters |
| POST | `/api/properties` | Create property (Landlord only) |
| GET | `/api/properties/:id` | Get property details |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |
| POST | `/api/properties/:id/images` | Upload property images |

#### 📅 Booking Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get user bookings |
| POST | `/api/bookings` | Create booking request |
| PUT | `/api/bookings/:id/status` | Update booking status |

#### ⭐ Review Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Get reviews |
| POST | `/api/reviews` | Create review |

#### 👤 User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/favorites` | Toggle favorite property |

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Testing
npm run test               # Run unit tests
npm run test:e2e          # Run integration tests
npm run test:cov          # Run tests with coverage

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
npm run format            # Format with Prettier
```

### Project Structure

```
src/
├── auth/              # Authentication module
│   ├── dto/          # Data transfer objects
│   ├── guards/       # Auth guards
│   └── strategies/   # JWT strategies
├── users/            # User management
├── properties/       # Property management
├── bookings/         # Booking system
├── reviews/          # Review system
├── mail/             # Email service
│   └── templates/    # Email templates
├── common/           # Shared utilities
└── config/           # Configuration files
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `JWT_SECRET` | JWT secret key | Required |
| `EMAIL_HOST` | SMTP host | Required |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name | Required |

### Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📦 Database Models

### Core Entities

**User**
- `id` - UUID primary key
- `firstName`, `lastName` - User names
- `email` - Unique email address
- `password` - Hashed password
- `role` - tenant | landlord
- `phone` - Contact number (optional)
- `profileImage` - Profile picture URL
- `isVerified` - Email verification status

**Property**
- `id` - UUID primary key
- `ownerId` - Foreign key to User
- `title`, `description` - Property details
- `category` - Property type enum
- `city`, `postcode`, `address` - Location
- `price` - Monthly rent
- `bedrooms`, `bathrooms` - Property specs
- `availableFrom`, `availableTo` - Availability dates
- `amenities` - Array of features
- `isActive` - Publication status

**Booking**
- `id` - UUID primary key
- `propertyId` - Foreign key to Property
- `tenantId` - Foreign key to User
- `startDate`, `endDate` - Booking period
- `status` - pending | approved | rejected | cancelled
- `message` - Tenant's message

## 🚦 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

## 📄 License

MIT License
