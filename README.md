# Shop Smart

A microservices-based e-commerce application built with React, Node.js, Express, and Kong API Gateway.

## 🏗️ Architecture

This project follows a microservices architecture pattern with the following components:
A microservices-based e-commerce application built with React, Node.js, Express, and Kong API Gateway.

- Frontend
- API Gateway → routes all frontend traffic - KONG
- User Service → authentication, registration - Express
- Product Service → product catalog - Express
- Cart Service → shopping cart management - Python Flask
- Order Service → order lifecycle - Go Gin
- Payment Service → mock payment simulation - Python FastAPI
- Notification Service → fake email notifications - Express

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│   Port 8080 │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Kong Gateway   │ (API Gateway)
│   Port 8000     │
└──────┬──────────┘
       │
       ├───────────────────┐
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────--┐
│User Service │     │Future Services│
│  Port 3000  │     │               │
└─────────────┘     └─────────────--┘
```

## 📦 Services

### Frontend

- **Technology**: React 19 + TypeScript + Vite
- **Port**: 8080
- **Description**: Single Page Application (SPA) served via Nginx
- **Features**:
  - Modern React with TypeScript
  - Vite for fast development and optimized builds
  - Nginx reverse proxy for API calls to Kong Gateway

### User Service

- **Technology**: Node.js + Express + TypeScript + Drizzle ORM
- **Port**: 3000 (exposed from container port 3001)
- **Database**: PostgreSQL 15 (dedicated instance on port 5433)
- **Description**: Handles user authentication and management
- **Features**:
  - User registration with email/username uniqueness validation
  - Secure password hashing with bcrypt
  - JWT token-based authentication
  - PostgreSQL database with Drizzle ORM
  - Automatic database migrations on startup
- **Endpoints**:
  - `POST /api/user/signup` - User registration
  - `POST /api/user/login` - User login (email/password)
  - `GET /health` - Health check endpoint

### Kong API Gateway

- **Technology**: Kong Gateway 3.4
- **Ports**:
  - 8000: Proxy (API requests)
  - 8001: Admin API
  - 8443: Proxy SSL
  - 8444: Admin API SSL
- **Description**: Central API Gateway for routing and managing microservices
- **Features**:
  - Dynamic service routing
  - CORS support
  - Request/response logging
  - Centralized authentication (ready for plugins)

### Kong Database

- **Technology**: PostgreSQL 15
- **Port**: 5432
- **Description**: Stores Kong's configuration and routes

### User Service Database

- **Technology**: PostgreSQL 15
- **Port**: 5433
- **Database**: smart_shop_userdb
- **User**: userservice
- **Description**: Dedicated PostgreSQL database for user service data
- **Schema**:
  - `users` table with UUID primary key
  - Email and username unique constraints
  - Password hashing with bcrypt
  - Timestamps for created_at and updated_at

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Git

### Installation & Running

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd shop-smart
   ```

2. **Start all services**

   ```bash
   docker-compose up --build
   ```

3. **Wait for services to be ready**
   The startup sequence:

   - PostgreSQL database starts
   - Kong runs database migrations
   - Kong Gateway starts
   - Kong setup configures routes
   - User Service starts
   - Frontend builds and starts

4. **Access the application**
   - Frontend: http://localhost:8080
   - Kong Proxy: http://localhost:8000
   - Kong Admin API: http://localhost:8001
   - User Service (direct): http://localhost:3000

### Stopping Services

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

## 🔌 API Endpoints

### Through Kong Gateway (Recommended)

| Method | Endpoint                              | Description       |
| ------ | ------------------------------------- | ----------------- |
| POST   | http://localhost:8000/api/user/signup | User registration |
| POST   | http://localhost:8000/api/user/login  | User login        |

### Example Requests

**Sign Up:**

```bash
curl -X POST http://localhost:8000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Response Format:**

```json
{
  "data": {
    "message": "Login Successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "error": null,
    "username": "testuser"
  }
}
```

## 🛠️ Development

### Project Structure

```
shop-smart/
├── docker-compose.yml          # Multi-container orchestration
├── frontend/                   # React frontend service
│   ├── Dockerfile
│   ├── nginx.conf             # Nginx configuration
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       └── ...
├── user-service/              # User microservice
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts      # Drizzle ORM configuration
│   ├── env.ts                 # Environment validation with Zod
│   └── src/
│       ├── app.ts             # Server entry point
│       ├── server.ts          # Express app configuration
│       ├── controller/
│       │   └── authController.ts   # Authentication logic
│       ├── db/
│       │   ├── connection.ts  # Database connection
│       │   └── schema.ts      # User table schema
│       ├── routes/
│       │   └── authRoute.ts   # Authentication routes
│       └── utils/
│           ├── jwt.ts         # JWT token generation
│           └── password.ts    # Password hashing & comparison
└── kong/                      # Kong API Gateway setup
    ├── Dockerfile
    └── setup.sh               # Kong route configuration
```

### Local Development

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**User Service:**

```bash
cd user-service
npm install
npm start
```

### Adding New Routes to Kong

Edit `kong/setup.sh` and add your service configuration:

```bash
# Create service
curl -X POST ${KONG_ADMIN_URL}/services \
  --data name=your-service \
  --data url=http://your-service:port

# Create route
curl -X POST ${KONG_ADMIN_URL}/services/your-service/routes \
  --data "paths[]=/api/your-path" \
  --data "strip_path=false"
```

Then restart the kong-setup service:

```bash
docker-compose restart kong-setup
```

## 🔧 Configuration

### Environment Variables

**Kong Gateway:**

- `KONG_DATABASE`: postgres
- `KONG_PG_HOST`: kong-database
- `KONG_PG_USER`: kong
- `KONG_PG_PASSWORD`: kong

**Kong Setup:**

- `KONG_ADMIN_URL`: http://kong-gateway:8001

**User Service:**

- `DATABASE_URL`: postgresql://userservice:userservice123@user-database:5432/smart_shop_userdb
- `PORT`: 3001
- `NODE_ENV`: development
- `APP_STAGE`: development
- `JWT_SECRET`: JWT signing secret key
- `JWT_EXPIRES_IN`: 7d
- `BCRYPT_SALT_ROUNDS`: 10

**User Database:**

- `POSTGRES_USER`: userservice
- `POSTGRES_DB`: smart_shop_userdb
- `POSTGRES_PASSWORD`: userservice123

### Docker Compose Services

All services are connected via the `microservices-networks` bridge network, allowing inter-service communication using service names as hostnames.

## 🧪 Health Checks

All services include health checks:

- **User Service**: `curl http://localhost:3000/health`
- **Kong Gateway**: `kong health`
- **Frontend**: `curl http://localhost:80`
- **Kong PostgreSQL**: `pg_isready -U kong`
- **User Service PostgreSQL**: `pg_isready -U userservice`

## 🗄️ Database Management

### Access User Service Database

```bash
# Using docker-compose
docker-compose exec user-database psql -U userservice -d smart_shop_userdb

# From local machine (if psql is installed)
psql -h localhost -p 5433 -U userservice -d smart_shop_userdb
```

Password: `userservice123`

### Useful psql Commands

```sql
\dt              -- List all tables
\d users         -- Describe users table
SELECT * FROM users;  -- View all users
\q               -- Quit psql
```

### Drizzle Studio

Run Drizzle Studio to visualize and manage your database:

```bash
cd user-service
npm run db:studio
```

Make sure your local `.env` file points to `localhost:5433` for local access:

```env
DATABASE_URL=postgresql://userservice:userservice123@localhost:5433/smart_shop_userdb
```

### Database Migrations

Migrations run automatically on container startup via:

```bash
npm run db:push
```

To run migrations manually:

```bash
docker-compose exec user-service npm run db:push
```

## 📝 Notes

### Kong Route Configuration

- **Path Matching**: Routes use regex patterns (`~/api/user/.*`) to match all sub-paths
- **strip_path**: Set to `false` to preserve the full API path when forwarding to services
- **Methods**: No method restrictions - all HTTP methods (GET, POST, PUT, DELETE, etc.) are forwarded

### CORS Configuration

CORS is enabled globally on Kong with:

- All origins allowed (`*`)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Accept, Authorization, Content-Type
- Credentials: Enabled
- Max Age: 3600 seconds

## 🚧 Future Enhancements

- [x] User authentication with JWT
- [x] PostgreSQL database with Drizzle ORM
- [x] Password hashing with bcrypt
- [ ] Add email verification
- [ ] Add password reset functionality
- [ ] Add refresh token mechanism
- [ ] Add product service
- [ ] Add order service
- [ ] Add payment service
- [ ] Add rate limiting via Kong
- [ ] Add monitoring and logging (ELK stack)
- [ ] Add CI/CD pipeline
- [ ] Add unit and integration tests
- [ ] Implement service mesh (Istio/Linkerd)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Vrushabh Bayas

## 🙏 Acknowledgments

- Kong Gateway for API management
- React team for the amazing frontend framework
- Express.js for the minimal web framework
- Docker for containerization
