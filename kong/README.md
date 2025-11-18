# Kong API Gateway Configuration

This directory contains the configuration and setup files for Kong API Gateway, which acts as the central entry point for all microservices in the Shop Smart application.

## 📁 Files

### `Dockerfile`

Builds a lightweight Alpine-based image that runs the Kong setup script.

### `setup.sh`

Bash script that automatically configures Kong services, routes, and plugins when the container starts.

## 🔧 How It Works

### Architecture

```
Client Request
     ↓
Kong Gateway (Port 8000)
     ↓
Route Matching (/api/user/*)
     ↓
Service (user-service:3001)
     ↓
Backend Response
```

### Startup Sequence

1. **Wait for Kong Gateway**: Script polls Kong's `/status` endpoint until it's healthy
2. **Create/Update Service**: Registers the user-service backend with Kong
3. **Create/Update Route**: Maps URL paths to the service
4. **Enable CORS Plugin**: Configures cross-origin resource sharing
5. **Log Success**: Displays available endpoints

## 🛠️ Configuration Details

### Service Configuration

```bash
Service Name: user-service
Backend URL: http://user-service:3001
```

**What it does:**

- Tells Kong where to forward requests
- Uses Docker service name for internal networking
- Port 3001 matches the user-service Express app

### Route Configuration

```bash
Route Name: user-route
Paths: ["/api/user", "/api/user/~"]
Strip Path: true
```

**Path Matching:**

- `/api/user` - Exact match
- `/api/user/~` - Matches all sub-paths (regex pattern)

**Strip Path Behavior:**

```
Client Request:    GET /api/user/profile/123
Kong Strips:       /api/user
Backend Receives:  GET /profile/123
```

**Why strip_path=true?**

- Backend doesn't need to know about `/api/user` prefix
- Keeps backend routes clean and reusable
- Backend route: `/profile/:id` instead of `/api/user/profile/:id`

### CORS Plugin Configuration

```bash
Plugin: cors
Scope: Global (applies to all services)

Configuration:
- Origins: * (all origins allowed)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Accept, Authorization, Content-Type
- Exposed Headers: X-Auth-Token
- Credentials: true
- Max Age: 3600 seconds (1 hour)
```

**What it enables:**

- Allows frontend (http://localhost:8080) to call backend APIs
- Handles preflight OPTIONS requests automatically
- Permits authentication headers and cookies

## 🚀 Usage

### Running the Setup

The setup runs automatically when starting with docker-compose:

```bash
docker-compose up kong-setup
```

### Manual Execution

If you need to reconfigure Kong:

```bash
# From project root
docker-compose restart kong-setup

# Or manually
docker-compose exec kong-setup /setup.sh
```

### Viewing Logs

```bash
docker-compose logs -f kong-setup
```

## 🔍 Kong Admin API

Kong provides a RESTful Admin API on port 8001 for managing configuration.

### List All Services

```bash
curl http://localhost:8001/services
```

### View User Service

```bash
curl http://localhost:8001/services/user-service
```

### List All Routes

```bash
curl http://localhost:8001/routes
```

### View User Route

```bash
curl http://localhost:8001/routes/user-route
```

### List All Plugins

```bash
curl http://localhost:8001/plugins
```

### Delete a Route

```bash
curl -X DELETE http://localhost:8001/routes/user-route
```

### Delete a Service

```bash
curl -X DELETE http://localhost:8001/services/user-service
```

## 🧪 Testing Kong Routes

### Test Service Health

```bash
curl http://localhost:8000/api/user/health
```

### Test Signup Endpoint

```bash
curl -X POST http://localhost:8000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Test Login Endpoint

```bash
curl -X POST http://localhost:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Test Profile Endpoint

```bash
curl http://localhost:8000/api/user/profile/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test CORS Preflight

```bash
curl -X OPTIONS http://localhost:8000/api/user/login \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

## 📝 Adding New Services

To add a new microservice to Kong, update `setup.sh`:

### 1. Create the Service

```bash
# Add after user-service creation
echo "Creating/Updating Product Service..."
curl -s -X POST ${KONG_ADMIN_URL}/services \
  --data name=product-service \
  --data url=http://product-service:3002 ||
  curl -s -X PATCH ${KONG_ADMIN_URL}/services/product-service \
    --data url=http://product-service:3002
```

### 2. Create the Route

```bash
echo "Creating/Updating route for Product Service..."
curl -s -X POST ${KONG_ADMIN_URL}/services/product-service/routes \
  --data "paths[]=/api/product" \
  --data "paths[]=/api/product/~" \
  --data "strip_path=true" \
  --data "name=product-route" ||
  curl -s -X PATCH ${KONG_ADMIN_URL}/routes/product-route \
    --data "paths[]=/api/product" \
    --data "strip_path=true"
```

### 3. Restart Kong Setup

```bash
docker-compose restart kong-setup
```

## 🔐 Security Best Practices

### Current Configuration (Development)

```bash
CORS Origins: * (any origin)
```

### Production Recommendations

```bash
# Restrict CORS to specific origins
--data config.origins=https://yourapp.com \
--data config.origins=https://www.yourapp.com

# Add rate limiting plugin
curl -X POST http://localhost:8001/plugins \
  --data name=rate-limiting \
  --data config.minute=100 \
  --data config.policy=local

# Add JWT authentication plugin
curl -X POST http://localhost:8001/plugins \
  --data name=jwt \
  --data config.secret_is_base64=false

# Add IP restriction plugin
curl -X POST http://localhost:8001/plugins \
  --data name=ip-restriction \
  --data "config.allow=10.0.0.0/8"
```

## 🐛 Troubleshooting

### Kong Setup Keeps Restarting

**Problem:** Setup script can't reach Kong Admin API

**Solutions:**

```bash
# Check Kong Gateway health
docker-compose logs kong-gateway

# Check if Kong database is ready
docker-compose logs kong-database

# Verify network connectivity
docker-compose exec kong-setup ping kong-gateway
```

### Route Not Working (404 Error)

**Problem:** Request returns 404 from Kong

**Debug steps:**

```bash
# 1. Check if service exists
curl http://localhost:8001/services/user-service

# 2. Check if route exists
curl http://localhost:8001/routes/user-route

# 3. Test backend directly (bypass Kong)
curl http://localhost:3000/profile/USER_ID

# 4. Check Kong logs
docker-compose logs kong-gateway

# 5. Verify route paths
curl http://localhost:8001/routes/user-route | jq '.paths'
```

### CORS Errors in Browser

**Problem:** Browser blocks requests due to CORS

**Solutions:**

```bash
# Check CORS plugin is enabled
curl http://localhost:8001/plugins | jq '.data[] | select(.name == "cors")'

# Verify CORS headers in response
curl -v http://localhost:8000/api/user/login \
  -H "Origin: http://localhost:8080"

# Restart Kong setup to reapply CORS
docker-compose restart kong-setup
```

### Service Unreachable

**Problem:** Kong can't connect to backend service

**Solutions:**

```bash
# Check if backend is running
docker-compose ps user-service

# Check backend health
docker-compose exec user-service curl http://localhost:3001/health

# Verify service URL in Kong
curl http://localhost:8001/services/user-service | jq '.url'

# Check Docker network
docker network inspect shop-smart_microservices-networks
```

## 📚 Kong Documentation

- [Kong Gateway Official Docs](https://docs.konghq.com/gateway/latest/)
- [Kong Admin API Reference](https://docs.konghq.com/gateway/latest/admin-api/)
- [Kong Plugin Hub](https://docs.konghq.com/hub/)
- [Kong Configuration Reference](https://docs.konghq.com/gateway/latest/reference/configuration/)

## 🔄 Script Idempotency

The setup script is **idempotent**, meaning it can be run multiple times safely:

- **First run**: Creates services and routes (POST)
- **Subsequent runs**: Updates existing resources (PATCH)
- **No duplicates**: Uses `||` operator to try PATCH if POST fails

This design allows:

- Safe container restarts
- Configuration updates without manual cleanup
- Easy CI/CD integration

## 🎯 Key Concepts

### Services

A **Service** in Kong represents a backend API/microservice. It defines:

- Name (identifier)
- URL (where to forward requests)
- Protocol (http, https, tcp, etc.)

### Routes

A **Route** defines how requests are matched and forwarded to services:

- Paths (URL patterns to match)
- Methods (GET, POST, etc.)
- Headers (match on specific headers)
- Hosts (domain-based routing)

### Plugins

**Plugins** add functionality to Kong:

- Authentication (JWT, OAuth, Basic Auth)
- Security (Rate Limiting, IP Restriction)
- Traffic Control (Request/Response Transformation)
- Logging (File, HTTP, Syslog)
- Analytics (Prometheus, Datadog)

### Upstream

An **Upstream** represents a load balancer for multiple service instances (not used in current setup).

## 🚦 Health Checks

### Kong Gateway Health

```bash
curl http://localhost:8001/status
```

**Expected response:**

```json
{
  "database": {
    "reachable": true
  },
  "server": {
    "connections_accepted": 10,
    "connections_active": 1,
    "connections_handled": 10,
    "connections_reading": 0,
    "connections_waiting": 0,
    "connections_writing": 1,
    "total_requests": 20
  }
}
```

### Service Health via Kong

```bash
curl http://localhost:8000/api/user/health
```

## 🔧 Environment Variables

The setup script uses these environment variables:

| Variable         | Default                    | Description             |
| ---------------- | -------------------------- | ----------------------- |
| `KONG_ADMIN_URL` | `http://kong-gateway:8001` | Kong Admin API endpoint |

Set in `docker-compose.yml`:

```yaml
kong-setup:
  environment:
    KONG_ADMIN_URL: http://kong-gateway:8001
```

## 📊 Monitoring

### View Real-time Logs

```bash
# Kong Gateway logs
docker-compose logs -f kong-gateway

# Kong Setup logs
docker-compose logs -f kong-setup

# All Kong-related logs
docker-compose logs -f kong-gateway kong-database kong-migration kong-setup
```

### Request Logging

Kong logs all requests to stdout:

```
192.168.65.1 - - [18/Nov/2025:10:17:28 +0000] "POST /api/user/login HTTP/1.1" 200 ...
```

## 💡 Tips

1. **Always use Kong Admin API through http://localhost:8001** - Never expose this in production
2. **Test routes directly on backend first** - Isolate issues between Kong and backend
3. **Use `strip_path=true` for cleaner backend routes** - Backend doesn't need API prefix
4. **CORS must be configured correctly** - Browser will block requests otherwise
5. **Check logs when things fail** - Kong is very verbose about errors
6. **Use named services and routes** - Makes management easier
7. **Restart kong-setup after changes** - Ensures configuration is applied

## 🎓 Learning Resources

- [Kong Getting Started Guide](https://docs.konghq.com/gateway/latest/get-started/)
- [Kong Service & Route Configuration](https://docs.konghq.com/gateway/latest/key-concepts/services/)
- [Kong Plugin Development](https://docs.konghq.com/gateway/latest/plugin-development/)
- [Kong Performance Tuning](https://docs.konghq.com/gateway/latest/production/performance/)
