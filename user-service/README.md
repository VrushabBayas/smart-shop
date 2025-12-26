# User Service

Authentication and user management microservice for the Shop Smart e-commerce platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Management](#database-management)
- [Testing](#testing)
- [Authentication Flow](#authentication-flow)

## 🎯 Overview

The User Service handles:

- ✅ User registration with email/username validation
- ✅ Secure password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Access tokens (short-lived: 15 minutes)
- ✅ Refresh tokens (long-lived: 7 days)
- ✅ Token refresh mechanism
- ✅ Password reset functionality
- ✅ User profile management
- ✅ Consul service discovery integration

## 🛠️ Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jose library)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Testing**: Vitest + Supertest
- **Service Discovery**: Consul

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  refresh_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_refresh_token ON users(refresh_token);
```

### TypeScript Schema (Drizzle ORM)

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  refreshToken: varchar('refresh_token', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## 🔌 API Endpoints

All endpoints are accessible through Kong Gateway at `http://localhost:8000/api/user`

### Public Endpoints (No Authentication)

| Method | Endpoint          | Description          | Request Body                                           |
|--------|-------------------|----------------------|--------------------------------------------------------|
| POST   | `/signup`         | Register new user    | `{ email, username, password, first_name, last_name }` |
| POST   | `/login`          | User login           | `{ email, password }`                                  |
| POST   | `/refresh`        | Refresh access token | `{ refreshToken }`                                     |

### Protected Endpoints (Requires JWT)

| Method | Endpoint            | Description     | Headers                          | Query/Body                   |
|--------|---------------------|-----------------|----------------------------------|------------------------------|
| GET    | `/profile`          | Get user profile | `Authorization: Bearer <token>` | Query: `?id=<user-id>`       |
| POST   | `/reset-password`   | Reset password   | `Authorization: Bearer <token>` | Body: `{ email, newPassword }` |

### Request/Response Examples

#### Sign Up

```bash
curl -X POST http://localhost:8000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "username": "johndoe",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe"
  },
  "message": "User created successfully"
}
```

#### Login

```bash
curl -X POST http://localhost:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "username": "johndoe"
  },
  "message": "Login successful"
}
```

#### Get User Profile

```bash
curl -X GET "http://localhost:8000/api/user/profile?id=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2025-11-26T10:00:00Z",
    "updated_at": "2025-11-26T10:00:00Z"
  },
  "message": "User fetched successfully"
}
```

**Note:** Password is never returned in responses.

#### Refresh Access Token

```bash
curl -X POST http://localhost:8000/api/user/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Access token refreshed"
}
```

#### Reset Password

```bash
curl -X POST http://localhost:8000/api/user/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "email": "john.doe@example.com",
    "newPassword": "NewSecurePass123"
  }'
```

**Response:**
```json
{
  "data": null,
  "message": "Password reset successfully"
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Docker (optional)

### Installation

1. **Install dependencies:**
   ```bash
   cd user-service
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Configure PostgreSQL:**

   **Option A: Using Docker Compose (Recommended)**
   ```bash
   # From root directory
   docker-compose up -d user-database
   ```

   **Option B: Local PostgreSQL**
   ```bash
   # Create database
   createdb smart_shop_userdb
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE smart_shop_userdb;
   ```

4. **Run database migrations:**
   ```bash
   npm run db:push:local
   ```

5. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

6. **Start the service:**
   ```bash
   npm start
   ```

The service will be available at `http://localhost:3001`

### Development Mode

```bash
npm run dev
```

## ⚙️ Environment Variables

Create a `.env` file in the user-service directory:

```env
# Server
NODE_ENV=development
APP_STAGE=development
PORT=3001

# Database
DATABASE_URL=postgresql://userservice:userservice123@user-database:5432/smart_shop_userdb
DATABASE_URL_LOCAL=postgresql://youruser@localhost:5433/smart_shop_userdb
TEST_DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/smart_shop_testdb

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-10-chars"
JWT_EXPIRES_IN=15m
REFRESH_JWT_SECRET="your-super-secret-refresh-jwt-key-min-10-chars"
REFRESH_JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12

# Service Discovery (Optional)
SERVICE_NAME=user-service
CONSUL_HOST=localhost
CONSUL_PORT=8500
```

### Environment Variable Details

| Variable                | Description                              | Default     | Required |
|-------------------------|------------------------------------------|-------------|----------|
| `PORT`                  | Service port                             | 3001        | No       |
| `DATABASE_URL`          | PostgreSQL connection string             | -           | Yes      |
| `JWT_SECRET`            | Secret for signing access tokens         | -           | Yes      |
| `JWT_EXPIRES_IN`        | Access token expiration                  | 15m         | No       |
| `REFRESH_JWT_SECRET`    | Secret for signing refresh tokens        | -           | Yes      |
| `REFRESH_JWT_EXPIRES_IN`| Refresh token expiration                 | 7d          | No       |
| `BCRYPT_SALT_ROUNDS`    | Bcrypt hashing rounds (10-20)            | 12          | No       |
| `SERVICE_NAME`          | Service name for Consul                  | user-service| No       |

**Security Note:** Use strong, unique secrets for `JWT_SECRET` and `REFRESH_JWT_SECRET` in production.

## 🗄️ Database Management

### Drizzle ORM Commands

```bash
# Generate migrations
npm run db:generate

# Push schema to database (local development)
npm run db:push:local

# Push schema to database (Docker)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed database
npm run db:seed
```

### Access Database

**Using Docker:**
```bash
docker-compose exec user-database psql -U userservice -d smart_shop_userdb
```

**From local machine:**
```bash
psql -h localhost -p 5433 -U userservice -d smart_shop_userdb
# Password: userservice123
```

### Drizzle Studio

Visual database management tool:

```bash
npm run db:studio
```

Access at: `https://local.drizzle.studio`

Make sure your `.env` points to `localhost:5433` for local access:
```env
DATABASE_URL=postgresql://userservice:userservice123@localhost:5433/smart_shop_userdb
```

## 🧪 Testing

### Test Structure

```
src/
├── tests/
│   ├── setup.ts                    # Test database setup
│   ├── helper.ts                   # Test utilities
│   │   ├── createUserAndLogin()    # Helper for tests
│   │   ├── generateTestUser()      # Generate test data
│   │   └── insertTestUser()        # Insert test user
│   └── app.test.ts                 # Server tests
├── controller/
│   └── authController.test.ts      # Authentication tests (22 tests)
└── middleware/
    └── tests/
        └── auth.test.ts            # Middleware tests (3 tests)
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test authController.test.ts

# UI mode (interactive)
npm run test:ui
```

### Test Coverage

- ✅ **25 test cases** covering all endpoints
- ✅ Authentication endpoints (signup, login, refresh, profile, password reset)
- ✅ JWT token generation and validation
- ✅ Password hashing and comparison
- ✅ Query parameter validation
- ✅ Authorization middleware
- ✅ Error handling and edge cases
- ✅ Database operations
- ✅ Refresh token mechanism

### Helper Functions

```typescript
// Create user and login in one step
const { user, token, refreshToken, userId } = await createUserAndLogin(app);

// Generate test user data
const userData = generateTestUser();

// Insert user directly into database
const user = await insertTestUser(testDb, { email: 'test@example.com' });
```

### Test Database

Tests use a separate database (`smart_shop_testdb`) that is automatically cleaned between test runs.

## 🔐 Authentication Flow

### JWT Token Structure

**Access Token Payload:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Refresh Token Payload:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "iat": 1234567890,
  "exp": 1234908890
}
```

### Token Lifecycle

```
1. User logs in
   └─→ Generate access token (15m expiry)
   └─→ Generate refresh token (7d expiry)
   └─→ Store refresh token in database
   └─→ Return both tokens to client

2. Client makes API request
   └─→ Send access token in Authorization header
   └─→ Server validates token
   └─→ If valid, process request
   └─→ If expired, return 401

3. Client receives 401
   └─→ Call /refresh endpoint with refresh token
   └─→ Server validates refresh token
   └─→ Check if token exists in database
   └─→ If valid, generate new access token
   └─→ Return new access token

4. Logout (future implementation)
   └─→ Delete refresh token from database
   └─→ Client clears tokens from storage
```

### Password Hashing

```typescript
// Hashing (signup)
const hashedPassword = await hashPassword('plainPassword');
// Uses bcrypt with configurable salt rounds (default: 12)

// Verification (login)
const isMatch = await comparePassword('plainPassword', hashedPassword);
// Returns boolean
```

### Authentication Middleware

```typescript
// Protect routes
router.get('/profile', authenticateToken, getUserProfile);

// Middleware adds user info to request
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}
```

## 📁 Project Structure

```
user-service/
├── src/
│   ├── app.ts                     # Entry point
│   ├── server.ts                  # Express app configuration
│   ├── consul/
│   │   └── index.ts               # Consul service registration
│   ├── controller/
│   │   ├── authController.ts      # Authentication logic
│   │   └── authController.test.ts # Controller tests
│   ├── db/
│   │   ├── connection.ts          # Database connection
│   │   ├── schema.ts              # User table schema
│   │   └── seed.ts                # Database seeding
│   ├── middleware/
│   │   ├── auth.ts                # JWT authentication
│   │   ├── validation.ts          # Request validation
│   │   └── tests/
│   │       └── auth.test.ts       # Middleware tests
│   ├── routes/
│   │   └── authRoute.ts           # API routes
│   ├── tests/
│   │   ├── setup.ts               # Test setup
│   │   ├── helper.ts              # Test helpers
│   │   └── app.test.ts            # App tests
│   └── utils/
│       ├── jwt.ts                 # JWT utilities
│       └── password.ts            # Password hashing
├── coverage/                      # Test coverage reports
├── drizzle.config.ts              # Drizzle ORM config (Docker)
├── drizzle.local.config.ts        # Drizzle ORM config (local)
├── drizzle.test.config.ts         # Drizzle ORM config (test)
├── env.ts                         # Environment validation
├── vitest.config.ts               # Vitest configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error: ECONNREFUSED**

Solution:
```bash
# Check if PostgreSQL is running
docker-compose ps user-database

# Start database
docker-compose up -d user-database

# Check logs
docker-compose logs user-database
```

### JWT Token Issues

**Error: "Forbidden" or "Invalid token"**

Common causes:
- Token expired (access tokens expire after 15 minutes)
- Wrong JWT_SECRET
- Token format incorrect (missing "Bearer " prefix)

Solution:
```bash
# Use refresh token to get new access token
curl -X POST http://localhost:8000/api/user/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token"}'
```

### Port Already in Use

**Error: EADDRINUSE: address already in use :::3001**

Solution:
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env
PORT=3005
```

### Database Migration Failures

```bash
# Reset database (WARNING: deletes all data)
npm run db:push:local -- --force

# Or drop and recreate database
psql -U postgres
DROP DATABASE smart_shop_userdb;
CREATE DATABASE smart_shop_userdb;
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t user-service .

# Run container
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  --name user-service \
  user-service
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db-host:5432/dbname
JWT_SECRET=<use-strong-random-secret>
REFRESH_JWT_SECRET=<use-different-strong-random-secret>
BCRYPT_SALT_ROUNDS=14
```

**Security Checklist:**
- ✅ Use strong, unique JWT secrets
- ✅ Enable HTTPS
- ✅ Set appropriate CORS origins
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting
- ✅ Set up monitoring and logging
- ✅ Use production database with backups

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update this README for significant changes
4. Use conventional commit messages
5. Ensure all tests pass before submitting PR

## 📄 License

ISC

## 👥 Authors

- Vrushabh Bayas

## 🔗 Related Services

- [Product Service](../product-service/README.md)
- [Main Documentation](../README.md)
- [Kong Gateway](../kong/README.md)
