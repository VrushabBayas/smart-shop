# Shop Smart

A microservices-based e-commerce application built with React, Node.js, Express, and Kong API Gateway.

## 🏗️ Architecture

This project follows a microservices architecture pattern with the following components:

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
│  Port 3001  │     │               │
└─────────────┘     └─────────────--┘
```

## 📦 Services

### Frontend
- **Technology**: React 19 + TypeScript + Vite
- **Port**: 8080
- **Description**: Single Page Application with centralized API layer
- **Documentation**: [Frontend README](./frontend/README.md)

### User Service
- **Technology**: Node.js + Express + TypeScript + Drizzle ORM
- **Port**: 3001 (exposed as 3000)
- **Database**: PostgreSQL 16 (port 5433)
- **Description**: Authentication and user management
- **Documentation**: [User Service README](./user-service/README.md)

### Product Service
- **Technology**: Node.js + Express + TypeScript + Drizzle ORM
- **Port**: 3002
- **Database**: PostgreSQL 16 (port 5434)
- **Description**: Product catalog, categories, variants, and reviews
- **Documentation**: [Product Service README](./product-service/README.md)

### Kong API Gateway
- **Technology**: Kong Gateway 3.4
- **Ports**: 8000 (Proxy), 8001 (Admin)
- **Database**: PostgreSQL 16 (port 5432)
- **Description**: Central API Gateway for routing and managing microservices
- **Documentation**: [Kong README](./kong/README.md)

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

All API requests go through Kong Gateway at `http://localhost:8000`

### Service Endpoints

- **User Service**: `/api/user/*` - Authentication and user management
- **Product Service**: `/api/products/*` - Product catalog management

For detailed API documentation, see each service's README:
- [User Service API Documentation](./user-service/README.md#api-endpoints)
- [Product Service API Documentation](./product-service/README.md#api-endpoints)

## 🛠️ Development

### Project Structure

```
shop-smart/
├── docker-compose.yml              # Multi-container orchestration
├── README.md                       # This file
├── frontend/                       # React frontend service
│   ├── README.md                   # Frontend documentation
│   └── ...
├── user-service/                   # Authentication microservice
│   ├── README.md                   # User service documentation
│   └── ...
├── product-service/                # Product catalog microservice
│   ├── README.md                   # Product service documentation
│   └── ...
└── kong/                           # API Gateway
    ├── README.md                   # Kong documentation
    └── ...
```

### Local Development

Each service can be developed independently. See individual service READMEs for detailed instructions:

- [Frontend Development Guide](./frontend/README.md)
- [User Service Development Guide](./user-service/README.md)
- [Product Service Development Guide](./product-service/README.md)
- [Kong Gateway Setup](./kong/README.md)

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
- `JWT_SECRET`: JWT signing secret key for access tokens (min 10 chars)
- `JWT_EXPIRES_IN`: 2h (access token expiry - default)
- `REFRESH_JWT_SECRET`: JWT signing secret key for refresh tokens (min 10 chars)
- `REFRESH_JWT_EXPIRES_IN`: 7d (refresh token expiry - default)
- `BCRYPT_SALT_ROUNDS`: 12 (default, range: 10-20)

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
- **Frontend**: `curl http://localhost:8080`
- **Kong PostgreSQL**: `pg_isready -U kong`
- **User Service PostgreSQL**: `pg_isready -U userservice`

## 🗄️ Database Management

Each service has its own PostgreSQL database:

- **Kong Database**: Port 5432
- **User Service Database**: Port 5433
- **Product Service Database**: Port 5434

For detailed database management instructions, see:
- [User Service Database Guide](./user-service/README.md#database-management)
- [Product Service Database Guide](./product-service/README.md#database-management)

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

## 🧪 Testing

Each service includes comprehensive test coverage. For testing instructions:

- [User Service Tests](./user-service/README.md#testing)
- [Product Service Tests](./product-service/README.md#testing)

## 🚧 Future Enhancements

- [x] User authentication with JWT
- [x] PostgreSQL database with Drizzle ORM
- [x] Password hashing with bcrypt
- [x] Centralized API service layer in frontend
- [x] Axios interceptors for authentication
- [x] Token management with localStorage
- [x] Refresh token mechanism with automatic token renewal
- [x] Password reset functionality
- [x] Protected routes with authentication middleware
- [x] JWT token verification middleware
- [x] User profile endpoint with password exclusion
- [x] Comprehensive test suite with 20+ test cases
- [x] Test helper functions for DRY test code
- [x] Automated test database cleanup
- [x] Query parameter validation with Zod
- [ ] Add email verification
- [ ] Add logout endpoint with token revocation
- [ ] Implement protected routes in frontend
- [ ] Add React Context for global auth state
- [ ] Add loading states and error boundaries
- [ ] Add product service
- [ ] Add order service
- [ ] Add payment service
- [ ] Add rate limiting via Kong
- [ ] Add monitoring and logging (ELK stack)
- [ ] Add CI/CD pipeline
- [ ] Implement service mesh (Istio/Linkerd)
- [ ] Add API versioning

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
