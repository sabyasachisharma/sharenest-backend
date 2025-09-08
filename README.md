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

5. **Start Development Server**
   ```bash
   npm run start:dev
   ```

6. **Access the API**
   - API: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/api/docs

## 📋 Database Migrations


### Run Migrations
```bash
npx sequelize-cli db:migrate
```

## API Documentation

### Interactive Documentation
Access the full Swagger API documentation at: **http://localhost:3000/api/docs**

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
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
