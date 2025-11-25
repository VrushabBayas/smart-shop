#!/bin/bash
set -e

KONG_ADMIN_URL=${KONG_ADMIN_URL:-http://kong-gateway:8001}
CONSUL_URL=${CONSUL_URL:-http://consul:8500}

echo "Waiting for Kong Admin API at $KONG_ADMIN_URL to be available..."
until $(curl --output /dev/null --silent --head --fail $KONG_ADMIN_URL/status); do
  printf '.'
  sleep 2
done
echo ""
echo "Kong is ready! Configuring services and routes..."

echo "Waiting for Consul at $CONSUL_URL to be available..."
until $(curl --output /dev/null --silent --fail $CONSUL_URL/v1/status/leader); do
  printf '.'
  sleep 2
done
echo ""
echo "Consul is ready! Configuring services and routes..."

# Query Consul for user-service instances
echo "Discovering user-service instances from Consul..."
USER_SERVICE_INSTANCES=$(curl -s "${CONSUL_URL}/v1/health/service/user-service?passing" | jq -r '.[].Service | "\(.Address // .Node):\(.Port)"')

if [ -z "$USER_SERVICE_INSTANCES" ]; then
  echo "⚠️  No healthy user-service instances found in Consul. Using static configuration."
  USER_SERVICE_URL="http://user-service:3001"
else
  echo "Found user-service instances:"
  FIRST_INSTANCE=$(echo "$USER_SERVICE_INSTANCES" | head -n 1)
  USER_SERVICE_URL="http://$FIRST_INSTANCE"
  echo "✅ Using user-service URL: $USER_SERVICE_URL"
fi

# Create or Update User Service
echo "Creating/Updating User Service..."
curl -s -X POST ${KONG_ADMIN_URL}/services \
  --data name=user-service \
  --data url=$USER_SERVICE_URL ||
  curl -s -X PATCH ${KONG_ADMIN_URL}/services/user-service \
    --data url=$USER_SERVICE_URL

# Create or Update route for User Service (matches all /api/user/* paths)
echo "Creating/Updating route for User Service..."
curl -s -X POST ${KONG_ADMIN_URL}/services/user-service/routes \
  --data "paths[]=/api/user" \
  --data "paths[]=/api/user/~" \
  --data "strip_path=false" \
  --data "name=user-route" ||
  curl -s -X PATCH ${KONG_ADMIN_URL}/services/user-service/routes/user-route \
    --data "paths[]=/api/user" \
    --data "paths[]=/api/user/~" \
    --data "strip_path=false"

# Enable CORS plugin globally
echo "Enabling CORS plugin..."
curl -i -X POST ${KONG_ADMIN_URL}/plugins \
  --data name=cors \
  --data config.origins=* \
  --data config.methods=GET \
  --data config.methods=POST \
  --data config.methods=PUT \
  --data config.methods=DELETE \
  --data config.methods=OPTIONS \
  --data config.headers=Accept \
  --data config.headers=Authorization \
  --data config.headers=Content-Type \
  --data config.exposed_headers=X-Auth-Token \
  --data config.credentials=true \
  --data config.max_age=3600

echo ""
echo "Kong configuration completed successfully!"
echo ""
echo "Access points:"
echo "  - Kong Proxy: http://localhost:8000"
echo "  - Kong Admin API: http://localhost:8001"
echo "  - Kong Admin GUI: http://localhost:8002"
echo ""
echo "API Endpoints (through Kong):"
echo "  Public endpoints:"
echo "    - POST http://localhost:8000/api/user/signup          (User registration)"
echo "    - POST http://localhost:8000/api/user/login           (User login)"
echo "    - POST http://localhost:8000/api/user/refresh         (Refresh access token)"
echo ""
echo "  Protected endpoints (require Authorization header):"
echo "    - GET  http://localhost:8000/api/user/profile?id=<id> (Get user profile)"
echo "    - POST http://localhost:8000/api/user/reset-password  (Reset password)"
