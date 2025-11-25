# Kong API Gateway Configuration

This directory contains the configuration and setup files for Kong API Gateway, which acts as the central entry point for all microservices in the Shop Smart application.

## 📁 Files

### `Dockerfile`

Builds a lightweight Alpine-based image with `curl`, `bash`, and `jq` installed for JSON processing, which runs the Kong setup script.

### `setup.sh`

Bash script that automatically configures Kong services, routes, and plugins when the container starts. It integrates with Consul for dynamic service discovery.

## 🔧 How It Works

### Architecture

```
Client Request
     ↓
Kong Gateway (Port 8000)
     ↓
Consul Service Discovery
     ↓
Route Matching (/api/user/*)
     ↓
Service Instance (user-service:3001)
     ↓
Backend Response
```

### Startup Sequence

1. **Wait for Kong Gateway**: Script polls Kong's `/status` endpoint until it's healthy
2. **Wait for Consul**: Ensures Consul is ready before querying services
3. **Discover Services from Consul**: Queries Consul for healthy user-service instances
4. **Create/Update Service**: Registers the user-service backend with Kong using discovered URL
5. **Create/Update Route**: Maps URL paths to the service
6. **Enable CORS Plugin**: Configures cross-origin resource sharing
7. **Log Success**: Displays available endpoints and access points

## 🛠️ Configuration Details

### Service Discovery with Consul

```bash
Consul URL: http://consul:8500
Query: /v1/health/service/user-service?passing
```

**Discovery Flow:**

1. **Query Consul**: Fetches all healthy instances of user-service
2. **Parse Response**: Uses `jq` to extract service address and port
3. **Fallback**: If no instances found, uses static URL `http://user-service:3001`
4. **Register with Kong**: Creates/updates Kong service with discovered URL

**Example Consul Response:**

```json
[
  {
    "Node": {
      "Node": "consul-server",
      "Address": "172.20.0.5"
    },
    "Service": {
      "ID": "user-service",
      "Service": "user-service",
      "Address": "user-service",
      "Port": 3001
    },
    "Checks": [
      {
        "Status": "passing"
      }
    ]
  }
]
```

### Service Configuration

```bash
Service Name: user-service
Backend URL: Dynamically discovered from Consul or http://user-service:3001 (fallback)
```

**What it does:**

- Queries Consul for service location
- Uses Docker service name for internal networking
- Port 3001 matches the user-service Express app
- Automatically updates if service location changes

### Route Configuration

```bash
Route Name: user-route
Paths: ["/api/user", "/api/user/~"]
Strip Path: false
```

**Path Matching:**

- `/api/user` - Exact match
- `/api/user/~` - Matches all sub-paths (regex pattern)

**Strip Path Behavior:**

```
Client Request:    GET /api/user/profile?id=123
Kong Strips:       (nothing - strip_path=false)
Backend Receives:  GET /api/user/profile?id=123
```

**Why strip_path=false?**

- Backend expects full path including `/api/user` prefix
- Matches your user-service route definitions
- No path manipulation needed

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
# Kong setup logs
docker-compose logs -f kong-setup

# Kong gateway logs
docker-compose logs -f kong-gateway

# Consul logs
docker-compose logs -f consul

# All together
docker-compose logs -f kong-setup kong-gateway consul
```

## 🏥 Consul Integration

### Access Consul UI

```
http://localhost:8500/ui
```

### Query Services via Consul API

```bash
# List all services
curl http://localhost:8500/v1/catalog/services | jq

# Get user-service health
curl http://localhost:8500/v1/health/service/user-service | jq

# Get only healthy instances
curl http://localhost:8500/v1/health/service/user-service?passing | jq

# Get service instances
curl http://localhost:8500/v1/agent/services | jq
```

### Check Service Registration

```bash
# Verify user-service is registered
curl http://localhost:8500/v1/agent/services | jq '.["user-service"]'
```

## 🔍 Kong Admin API

Kong provides a RESTful Admin API on port 8001 for managing configuration.

### List All Services

```bash
curl http://localhost:8001/services
```

### View User Service

```bash
curl http://localhost:8001/services/user-service | jq
```

### List All Routes

```bash
curl http://localhost:8001/routes
```

### View User Route

```bash
curl http://localhost:8001/routes/user-route | jq
```

### List All Plugins

```bash
curl http://localhost:8001/plugins | jq
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

### Test Refresh Token

```bash
curl -X POST http://localhost:8000/api/user/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Test Profile Endpoint

```bash
curl "http://localhost:8000/api/user/profile?id=USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Password Reset

```bash
curl -X POST http://localhost:8000/api/user/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "user@example.com",
    "newPassword": "NewSecurePass123"
  }'
```

### Test CORS Preflight

```bash
curl -X OPTIONS http://localhost:8000/api/user/login \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

## 📝 Adding New Services

To add a new microservice to Kong with Consul integration, update `setup.sh`:

### 1. Discover Service from Consul

```bash
# Add after user-service discovery
echo "Discovering product-service instances from Consul..."
PRODUCT_SERVICE_INSTANCES=$(curl -s "${CONSUL_URL}/v1/health/service/product-service?passing" | jq -r '.[].Service | "\(.Address // .Node):\(.Port)"')

if [ -z "$PRODUCT_SERVICE_INSTANCES" ]; then
  echo "⚠️  No healthy product-service instances found in Consul. Using static configuration."
  PRODUCT_SERVICE_URL="http://product-service:3002"
else
  FIRST_INSTANCE=$(echo "$PRODUCT_SERVICE_INSTANCES" | head -n 1)
  PRODUCT_SERVICE_URL="http://$FIRST_INSTANCE"
  echo "✅ Found product-service at: $PRODUCT_SERVICE_URL"
fi
```

### 2. Create the Service

```bash
echo "Creating/Updating Product Service..."
curl -s -X POST ${KONG_ADMIN_URL}/services \
  --data name=product-service \
  --data url=$PRODUCT_SERVICE_URL || \
curl -s -X PATCH ${KONG_ADMIN_URL}/services/product-service \
  --data url=$PRODUCT_SERVICE_URL
```

### 3. Create the Route

```bash
echo "Creating/Updating route for Product Service..."
curl -s -X POST ${KONG_ADMIN_URL}/services/product-service/routes \
  --data "paths[]=/api/product" \
  --data "paths[]=/api/product/~" \
  --data "strip_path=false" \
  --data "name=product-route" || \
curl -s -X PATCH ${KONG_ADMIN_URL}/routes/product-route \
  --data "paths[]=/api/product" \
  --data "paths[]=/api/product/~" \
  --data "strip_path=false"
```

### 4. Register Service with Consul

In your new service (e.g., product-service), add Consul registration:

```typescript
// product-service/src/consul/index.ts
import Consul from 'consul';
import { env } from '../config/env';

const consul = new Consul({
  host: env.CONSUL_HOST,
  port: env.CONSUL_PORT,
});

export const registerService = async () => {
  const serviceName = env.SERVICE_NAME;
  const servicePort = parseInt(env.PORT);
  const serviceAddress = serviceName;

  await consul.agent.service.register({
    name: serviceName,
    address: serviceAddress,
    port: servicePort,
    checks: [
      {
        name: `${serviceName}-health-check`,
        http: `http://${serviceAddress}:${servicePort}/health`,
        interval: '10s',
        timeout: '5s',
      },
    ],
  });

  console.log(`✅ Registered service ${serviceName} with Consul`);
};

export const deregisterService = async () => {
  const serviceName = env.SERVICE_NAME;
  await consul.agent.service.deregister(serviceName);
  console.log(`🛑 Deregistered service ${serviceName} from Consul`);
};
```

### 5. Restart Kong Setup

```bash
docker-compose restart kong-setup
```

## 🔐 Security Best Practices

### Current Configuration (Development)

```bash
CORS Origins: * (any origin)
Consul: No authentication
Kong Admin API: Exposed on port 8001
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

# Add IP restriction plugin for Admin API
curl -X POST http://localhost:8001/plugins \
  --data name=ip-restriction \
  --data "config.allow=10.0.0.0/8"

# Enable Consul ACLs
# Add to docker-compose.yml:
consul:
  command: agent -server -ui -bootstrap-expect=1 -client=0.0.0.0 -acl-default-policy=deny

# Secure Kong Admin API
# Don't expose port 8001 in production
# Use Kong Manager UI with RBAC instead
```

## 🐛 Troubleshooting

### Kong Setup Keeps Restarting

**Problem:** Setup script can't reach Kong Admin API or Consul

**Solutions:**

```bash
# Check Kong Gateway health
docker-compose logs kong-gateway

# Check Consul health
docker-compose logs consul

# Check if Kong database is ready
docker-compose logs kong-database

# Verify network connectivity
docker-compose exec kong-setup ping kong-gateway
docker-compose exec kong-setup ping consul
```

### Service Not Found in Consul

**Problem:** user-service not registered with Consul

**Debug steps:**

```bash
# 1. Check Consul UI
open http://localhost:8500/ui

# 2. Query Consul API
curl http://localhost:8500/v1/agent/services | jq

# 3. Check user-service logs
docker-compose logs user-service | grep Consul

# 4. Verify Consul environment variables
docker-compose exec user-service env | grep CONSUL

# 5. Test Consul health endpoint
curl http://localhost:8500/v1/status/leader
```

### Route Not Working (404 Error)

**Problem:** Request returns 404 from Kong

**Debug steps:**

```bash
# 1. Check if service exists and has correct URL
curl http://localhost:8001/services/user-service | jq

# 2. Check if route exists
curl http://localhost:8001/routes/user-route | jq

# 3. Test backend directly (bypass Kong)
curl http://localhost:3000/api/user/health

# 4. Check Kong logs
docker-compose logs kong-gateway

# 5. Verify route paths
curl http://localhost:8001/routes/user-route | jq '.paths'

# 6. Check Consul service discovery
curl http://localhost:8500/v1/health/service/user-service?passing | jq
```

### Malformed Service URL

**Problem:** Kong service URL shows `http://:3001` (missing host)

**Solutions:**

```bash
# 1. Check Consul service registration
curl http://localhost:8500/v1/agent/services | jq '.["user-service"]'

# 2. Verify address field is set
# Should show: "Address": "user-service"

# 3. Check user-service Consul registration code
# Ensure 'address' field is set in registration

# 4. Restart user-service to re-register
docker-compose restart user-service

# 5. Wait for health check to pass
curl http://localhost:8500/v1/health/checks/user-service | jq

# 6. Restart kong-setup to rediscover service
docker-compose restart kong-setup
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

# Verify Consul has correct service address
curl http://localhost:8500/v1/catalog/service/user-service | jq
```

### jq Command Not Found

**Problem:** kong-setup container doesn't have `jq` installed

**Solution:**

```bash
# Rebuild the kong-setup container
docker-compose up -d --build kong-setup

# Verify jq is installed
docker-compose exec kong-setup jq --version
```

## 📚 Documentation Links

- [Kong Gateway Official Docs](https://docs.konghq.com/gateway/latest/)
- [Kong Admin API Reference](https://docs.konghq.com/gateway/latest/admin-api/)
- [Kong Plugin Hub](https://docs.konghq.com/hub/)
- [Consul Official Docs](https://developer.hashicorp.com/consul/docs)
- [Consul Service Discovery](https://developer.hashicorp.com/consul/docs/discovery/services)
- [Consul Health Checks](https://developer.hashicorp.com/consul/docs/services/configuration/checks-configuration-reference)

## 🔄 Script Idempotency

The setup script is **idempotent**, meaning it can be run multiple times safely:

- **First run**: Creates services and routes (POST)
- **Subsequent runs**: Updates existing resources (PATCH)
- **No duplicates**: Uses `||` operator to try PATCH if POST fails
- **Dynamic Discovery**: Always queries Consul for latest service locations

This design allows:

- Safe container restarts
- Configuration updates without manual cleanup
- Automatic service URL updates when services move
- Easy CI/CD integration
- Horizontal scaling support

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

### Service Discovery

**Consul** provides service discovery:

- Services register themselves on startup
- Health checks monitor service availability
- Kong queries Consul for service locations
- Automatic failover to healthy instances

### Upstream

An **Upstream** represents a load balancer for multiple service instances (can be added for horizontal scaling).

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

### Consul Health

```bash
curl http://localhost:8500/v1/status/leader
```

### Service Health via Kong

```bash
curl http://localhost:8000/api/user/health
```

### Service Health via Consul

```bash
curl http://localhost:8500/v1/health/service/user-service | jq
```

## 🔧 Environment Variables

The setup script uses these environment variables:

| Variable         | Default                    | Description             |
| ---------------- | -------------------------- | ----------------------- |
| `KONG_ADMIN_URL` | `http://kong-gateway:8001` | Kong Admin API endpoint |
| `CONSUL_URL`     | `http://consul:8500`       | Consul API endpoint     |

User-service environment variables:

| Variable          | Default        | Description                   |
| ----------------- | -------------- | ----------------------------- |
| `CONSUL_HOST`     | `consul`       | Consul server hostname        |
| `CONSUL_PORT`     | `8500`         | Consul HTTP API port          |
| `SERVICE_NAME`    | `user-service` | Service name for registration |
| `SERVICE_ADDRESS` | `user-service` | Service address/hostname      |
| `PORT`            | `3001`         | Service port                  |

Set in `docker-compose.yml`:

```yaml
kong-setup:
  environment:
    KONG_ADMIN_URL: http://kong-gateway:8001
    CONSUL_URL: http://consul:8500

user-service:
  environment:
    CONSUL_HOST: consul
    CONSUL_PORT: 8500
    SERVICE_NAME: user-service
    PORT: 3001
```

## 📊 Monitoring

### View Real-time Logs

```bash
# Kong Gateway logs
docker-compose logs -f kong-gateway

# Kong Setup logs
docker-compose logs -f kong-setup

# Consul logs
docker-compose logs -f consul

# User Service logs
docker-compose logs -f user-service

# All Kong-related logs
docker-compose logs -f kong-gateway kong-database kong-migration kong-setup consul
```

### Request Logging

Kong logs all requests to stdout:

```
192.168.65.1 - - [19/Nov/2025:10:17:28 +0000] "POST /api/user/login HTTP/1.1" 200 ...
```

### Consul UI Monitoring

Access the Consul UI at `http://localhost:8500/ui` to:

- View all registered services
- Check service health status
- Monitor health check results
- View service instances and metadata
- Debug service discovery issues

## 💡 Tips

1. **Always use Kong Admin API through http://localhost:8001** - Never expose this in production
2. **Test routes directly on backend first** - Isolate issues between Kong and backend
3. **Use `strip_path=false` for consistency** - Backend handles full paths
4. **CORS must be configured correctly** - Browser will block requests otherwise
5. **Check logs when things fail** - Kong and Consul are very verbose about errors
6. **Use named services and routes** - Makes management easier
7. **Restart kong-setup after changes** - Ensures configuration is applied
8. **Monitor Consul UI** - Visual feedback on service health
9. **Verify service registration** - Check Consul before troubleshooting Kong
10. **Use `jq` for JSON parsing** - Makes API responses readable

## 🎓 Learning Resources

- [Kong Getting Started Guide](https://docs.konghq.com/gateway/latest/get-started/)
- [Kong Service & Route Configuration](https://docs.konghq.com/gateway/latest/key-concepts/services/)
- [Kong Plugin Development](https://docs.konghq.com/gateway/latest/plugin-development/)
- [Kong Performance Tuning](https://docs.konghq.com/gateway/latest/production/performance/)
- [Consul Getting Started](https://developer.hashicorp.com/consul/tutorials/get-started-vms)
- [Consul Service Discovery Guide](https://developer.hashicorp.com/consul/tutorials/developer-discovery)
- [Microservices with Consul](https://developer.hashicorp.com/consul/tutorials/microservices)

## 🌟 Benefits of Consul Integration

1. **Dynamic Service Discovery**: Services are discovered automatically, no hardcoded URLs
2. **Health Monitoring**: Only healthy services receive traffic
3. **Automatic Failover**: If a service fails, Kong stops routing to it
4. **Horizontal Scaling**: Add more instances, they're automatically discovered
5. **Service Mesh Ready**: Foundation for advanced service mesh features
6. **Configuration Management**: Store configuration in Consul KV store
7. **Multi-Datacenter**: Supports multiple datacenters (future enhancement)
8. **Service Segmentation**: Network segmentation and security policies
