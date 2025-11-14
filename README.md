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

- **Technology**: Node.js + Express + TypeScript
- **Port**: 3000
- **Description**: Handles user authentication and management
- **Endpoints**:
  - `POST /api/user/login` - User login (username: `user`, password: `pass`)
  - `GET /api/user/check` - Check user authentication status
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

| Method | Endpoint                             | Description          |
| ------ | ------------------------------------ | -------------------- |
| POST   | http://localhost:8000/api/user/login | User login           |
| GET    | http://localhost:8000/api/user/check | Check authentication |

### Example Request

**Login:**

```bash
curl -X POST http://localhost:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'
```

**Check Authentication:**

```bash
curl http://localhost:8000/api/user/check
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
│   └── src/
│       ├── app.ts             # Server entry point
│       ├── server.ts          # Express app configuration
│       └── routes/
│           └── authRoute.ts   # Authentication routes
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

### Docker Compose Services

All services are connected via the `microservices-networks` bridge network, allowing inter-service communication using service names as hostnames.

## 🧪 Health Checks

All services include health checks:

- **User Service**: `curl http://localhost:3000/health`
- **Kong Gateway**: `kong health`
- **Frontend**: `curl http://localhost:80`
- **PostgreSQL**: `pg_isready -U kong`

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

- [ ] Add product service
- [ ] Add order service
- [ ] Add payment service
- [ ] Implement JWT authentication
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
