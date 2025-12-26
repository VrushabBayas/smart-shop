# Product Service

A microservice for managing products, categories, variants, and reviews in the Shop Smart e-commerce platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Management](#database-management)
- [Testing](#testing)
- [Authentication](#authentication)
- [Inter-Service Communication](#inter-service-communication)

## 🎯 Overview

The Product Service is responsible for:

- ✅ Product catalog management (CRUD operations)
- ✅ Hierarchical category management with unlimited nesting
- ✅ Product variants (sizes, colors, storage options)
- ✅ Customer reviews and ratings
- ✅ Inventory tracking
- ✅ Product search and filtering
- ✅ Featured products and new arrivals
- ✅ Sale price management

## 🛠️ Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Authentication**: JWT (shared with user-service)
- **Validation**: Zod
- **Testing**: Vitest + Supertest
- **Service Discovery**: Consul (optional)

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌──────────────────────────────┐
│        CATEGORIES            │
├──────────────────────────────┤
│ PK  id (UUID)                │
│     name (VARCHAR 255) UQ    │
│     slug (VARCHAR 255) UQ    │
│     description (TEXT)       │
│ FK  parent_id (UUID) ────┐   │  Self-referencing
│     status (ENUM)         │   │  for hierarchy
│     image_url (VARCHAR)   │   │
│     created_at            │   │
│     updated_at            │   │
└───────────────────────────┼───┘
                            └───┘
                            
┌──────────────────────────────┐
│         PRODUCTS             │
├──────────────────────────────┤
│ PK  id (UUID)                │
│     name (VARCHAR 255)       │
│     slug (VARCHAR 255) UQ    │
│     description (TEXT)       │
│     short_description        │
│     price (DECIMAL 10,2)     │
│     sku (VARCHAR 100) UQ     │
│     stock_quantity (INT)     │
│     barcode (VARCHAR)        │
│ FK  category_id (UUID) ──────┼──────┐
│     brand (VARCHAR)          │      │
│     tags (JSONB[])           │      │
│     images (JSONB[])         │      │
│     thumbnail_url            │      │
│     weight (DECIMAL)         │      │
│     dimensions (JSONB)       │      │
│     color (VARCHAR)          │      │
│     status (ENUM)            │      │
│     is_featured (BOOL)       │      │
│     is_on_sale (BOOL)        │      │
│     sale_price (DECIMAL)     │      │
│     is_new_arrival (BOOL)    │      │
│     created_at               │      │
│     updated_at               │      │
│     published_at             │      │
└──────────────────────────────┘      │
         │                            │
         │ 1:N                   N:1  │
         ▼                            ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│    PRODUCT_VARIANTS          │  │       CATEGORIES             │
├──────────────────────────────┤  └──────────────────────────────┘
│ PK  id (UUID)                │
│ FK  product_id (UUID)        │
│     variant_name (VARCHAR)   │
│     sku (VARCHAR 100) UQ     │
│     barcode (VARCHAR)        │
│     price (DECIMAL)          │
│     stock_quantity (INT)     │
│     attributes (JSONB)       │
│       {                      │
│         color: string        │
│         size: string         │
│         storage: string      │
│       }                      │
│     image_url (VARCHAR)      │
│     status (ENUM)            │
│     created_at               │
│     updated_at               │
│     published_at             │
└──────────────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────────────┐
│     PRODUCT_REVIEWS          │
├──────────────────────────────┤
│ PK  id (UUID)                │
│ FK  product_id (UUID)        │
│ FK  user_id (UUID) ──────────┼──→ USER SERVICE
│     rating (INT 1-5)         │    (cross-service)
│     title (VARCHAR 255)      │
│     comment (TEXT)           │
│     is_verified_purchase     │
│     is_approved (BOOL)       │
│     created_at               │
│     updated_at               │
└──────────────────────────────┘
```

### Table Relationships

#### 1. **Categories (Self-Referencing)**
```typescript
Type: One-to-Many (Self)
categories.parent_id → categories.id

// Example hierarchy:
Electronics (parent_id: NULL)
├── Laptops (parent_id: Electronics.id)
│   ├── Gaming Laptops (parent_id: Laptops.id)
│   └── Business Laptops (parent_id: Laptops.id)
└── Phones (parent_id: Electronics.id)
```

#### 2. **Categories → Products**
```typescript
Type: One-to-Many
categories.id → products.category_id
ON DELETE: RESTRICT (prevent deletion if products exist)

// One category can have multiple products
```

#### 3. **Products → Product Variants**
```typescript
Type: One-to-Many
products.id → product_variants.product_id
ON DELETE: CASCADE (delete variants when product is deleted)

// Example:
Product "T-Shirt" → [
  Variant "Red-Small",
  Variant "Red-Medium",
  Variant "Blue-Large"
]
```

#### 4. **Products → Product Reviews**
```typescript
Type: One-to-Many
products.id → product_reviews.product_id
ON DELETE: CASCADE

// One product can have multiple reviews
```

#### 5. **Users (External) → Product Reviews**
```typescript
Type: One-to-Many (Cross-Service)
users.id (from user-service) → product_reviews.user_id
NO FK CONSTRAINT (different database)

// Validated at application level via HTTP API call
```

### Enums

```typescript
// product_status
'active' | 'inactive' | 'out_of_stock' | 'discontinued'

// category_status
'active' | 'inactive'
```

### JSONB Fields

```typescript
// products.tags
["electronics", "laptop", "gaming"]

// products.images
[
  "https://cdn.example.com/img1.jpg",
  "https://cdn.example.com/img2.jpg"
]

// products.dimensions
{
  "length": 35.5,
  "width": 25.0,
  "height": 2.5,
  "unit": "cm"
}

// product_variants.attributes
{
  "color": "Midnight Blue",
  "size": "15.6 inch",
  "storage": "512GB SSD",
  "material": "Aluminum"
}
```

### Database Indexes

For optimal query performance, the following indexes are implemented:

```sql
-- Categories
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Products
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Product Variants
CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- Product Reviews
CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);
```

## 🔌 API Endpoints

### Public Endpoints (No Authentication)

| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| GET    | `/api/products`                 | List products with filters |
| GET    | `/api/products/:id`             | Get product by ID          |
| GET    | `/api/products/slug/:slug`      | Get product by slug        |
| GET    | `/api/categories`               | List all categories        |
| GET    | `/api/categories/:id`           | Get category by ID         |
| GET    | `/api/categories/:id/products`  | Get products in category   |

### Protected Endpoints (Admin Only)

| Method | Endpoint                    | Description            |
|--------|----------------------------|------------------------|
| POST   | `/api/products`            | Create product         |
| PATCH  | `/api/products/:id`        | Update product         |
| DELETE | `/api/products/:id`        | Delete product         |
| POST   | `/api/categories`          | Create category        |
| PATCH  | `/api/categories/:id`      | Update category        |
| DELETE | `/api/categories/:id`      | Delete category        |
| POST   | `/api/variants`            | Create variant         |
| PATCH  | `/api/variants/:id`        | Update variant         |
| DELETE | `/api/variants/:id`        | Delete variant         |

### Review Endpoints

| Method | Endpoint                    | Description            | Auth Required |
|--------|----------------------------|------------------------|---------------|
| GET    | `/api/products/:id/reviews` | Get product reviews    | No            |
| POST   | `/api/reviews`             | Create review          | Yes           |
| PATCH  | `/api/reviews/:id`         | Update own review      | Yes           |
| DELETE | `/api/reviews/:id`         | Delete own review      | Yes           |

### Query Parameters

**List Products:**
```typescript
GET /api/products?page=1&limit=20&categoryId=uuid&search=laptop&status=active&sortBy=price&sortOrder=asc

Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- categoryId: UUID (filter by category)
- search: string (search in name/description)
- status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued'
- sortBy: 'name' | 'price' | 'createdAt'
- sortOrder: 'asc' | 'desc'
- isFeatured: boolean
- isOnSale: boolean
- isNewArrival: boolean
```

### Request/Response Examples

**Create Product:**
```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "MacBook Pro 16",
    "slug": "macbook-pro-16",
    "description": "Powerful laptop for professionals",
    "shortDescription": "16-inch MacBook Pro with M3 Pro",
    "price": "2499.99",
    "sku": "APPLE-MBP16-001",
    "stockQuantity": 10,
    "categoryId": "category-uuid",
    "brand": "Apple",
    "tags": ["laptop", "premium", "apple"],
    "images": ["https://example.com/image1.jpg"],
    "status": "active",
    "isFeatured": true
  }'
```

**Response:**
```json
{
  "data": {
    "id": "product-uuid",
    "name": "MacBook Pro 16",
    "slug": "macbook-pro-16",
    "price": "2499.99",
    "sku": "APPLE-MBP16-001",
    "stockQuantity": 10,
    "status": "active",
    "createdAt": "2025-11-26T10:00:00Z"
  },
  "message": "Product created successfully"
}
```

**Get Products with Category:**
```bash
curl -X GET "http://localhost:8000/api/products?categoryId=uuid&page=1&limit=20"
```

**Response:**
```json
{
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "MacBook Pro 16",
        "slug": "macbook-pro-16",
        "price": "2499.99",
        "category": {
          "id": "uuid",
          "name": "Laptops",
          "slug": "laptops"
        },
        "variants": [
          {
            "id": "uuid",
            "variantName": "MacBook Pro - 512GB",
            "price": "2499.99",
            "stockQuantity": 5
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "Products retrieved successfully"
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
   cd product-service
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
   docker-compose up -d product-database
   ```

   **Option B: Local PostgreSQL**
   ```bash
   # Create database
   createdb smart_shop_productdb
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE smart_shop_productdb;
   ```

4. **Run database migrations:**
   ```bash
   npm run db:push:local
   ```

5. **Seed the database with dummy data:**
   ```bash
   npm run db:seed
   ```

6. **Start the service:**
   ```bash
   npm start
   ```

The service will be available at `http://localhost:3002`

### Development Mode

```bash
npm run dev
```

## ⚙️ Environment Variables

Create a `.env` file in the product-service directory:

```env
# Server
NODE_ENV=development
APP_STAGE=development
PORT=3002

# Database
DATABASE_URL=postgresql://productservice:productservice123@product-database:5432/smart_shop_productdb
DATABASE_URL_DEV=postgresql://youruser@localhost:5432/smart_shop_productdb
TEST_DATABASE_URL=postgresql://testuser:testpassword@localhost:5435/ss_product_testdb

# JWT (MUST MATCH user-service)
JWT_SECRET="your-super-secret-jwt-key-min-10-chars"
REFRESH_JWT_SECRET="your-super-secret-refresh-jwt-key-min-10-chars"
BCRYPT_SALT_ROUNDS=12
JWT_EXPIRES_IN=15m

# Service Discovery (Optional)
SERVICE_NAME=product-service
CONSUL_HOST=localhost
CONSUL_PORT=8500

# Inter-Service Communication
USER_SERVICE_URL=http://localhost:3001
```

**Important:** The `JWT_SECRET` must be the same as the user-service to validate tokens!

## 🗄️ Database Management

### Drizzle ORM Commands

```bash
# Generate migrations
npm run db:generate

# Push schema to database (development)
npm run db:push:local

# Push schema to database (Docker)
npm run db:push

# Open Drizzle Studio
npm run db:studio

# Seed database with dummy data
npm run db:seed
```

### Access Database

**Using Docker:**
```bash
docker-compose exec product-database psql -U productservice -d smart_shop_productdb
```

**From local machine:**
```bash
psql -h localhost -p 5434 -U productservice -d smart_shop_productdb
# Password: productservice123
```

### Seed Data

The seed script creates:
- 📁 **10 categories** (3 levels of hierarchy)
- 📦 **8 products** (laptops, phones, headphones, clothing)
- 🎨 **12 product variants** (sizes, colors, storage options)
- ⭐ **16 product reviews** (with realistic ratings and comments)

Run the seed script:
```bash
npm run db:seed
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test productController.test.ts
```

### Test Structure

```
src/
├── tests/
│   ├── setup.ts                    # Test database setup
│   ├── helper.ts                   # Test utilities
│   └── app.test.ts                 # Server tests
├── controllers/
│   ├── productController.ts
│   └── productController.test.ts   # Integration tests
└── middleware/
    └── tests/
        └── auth.test.ts            # Middleware tests
```

## 🔐 Authentication

The Product Service validates JWT tokens generated by the User Service.

### How It Works

```
1. User logs in → User Service
2. User Service generates JWT token (signed with JWT_SECRET)
3. Client sends request to Product Service with token
4. Product Service validates token using SAME JWT_SECRET
5. If valid, user info is extracted from token payload
```

### Token Payload

```typescript
{
  id: "user-uuid",
  email: "user@example.com",
  username: "username",
  iat: 1234567890,
  exp: 1234567890
}
```

### Protected Route Example

```typescript
import { authenticateToken } from './middleware/auth';

router.post('/api/products', authenticateToken, createProduct);

// In controller:
const userId = req.user?.id; // From JWT token
const userEmail = req.user?.email;
```

## 🔄 Inter-Service Communication

### Verifying User Exists (for Reviews)

```typescript
// product-service/src/services/userService.ts
export class UserServiceClient {
  async verifyUser(userId: string, token: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${USER_SERVICE_URL}/api/user/profile?id=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

// Usage in controller:
const userExists = await userServiceClient.verifyUser(userId, token);
if (!userExists) {
  return res.status(404).json({ message: 'User not found' });
}
```

### Service Discovery with Consul (Optional)

```typescript
// Get user-service URL from Consul
const services = await consulClient.catalog.service.nodes('user-service');
const serviceUrl = `http://${services[0].ServiceAddress}:${services[0].ServicePort}`;
```

## 📁 Project Structure

```
product-service/
├── src/
│   ├── app.ts                    # Server entry point
│   ├── server.ts                 # Express configuration
│   ├── env.ts                    # Environment validation
│   ├── controllers/
│   │   ├── productController.ts
│   │   ├── categoryController.ts
│   │   └── reviewController.ts
│   ├── routes/
│   │   ├── productRoute.ts
│   │   ├── categoryRoute.ts
│   │   └── reviewRoute.ts
│   ├── middleware/
│   │   ├── auth.ts               # JWT validation
│   │   └── validation.ts         # Request validation
│   ├── validators/
│   │   ├── productSchema.ts      # Zod schemas
│   │   └── categorySchema.ts
│   ├── services/
│   │   └── userService.ts        # User service client
│   ├── db/
│   │   ├── connection.ts
│   │   ├── schema.ts             # Database schema
│   │   └── seed.ts               # Seed script
│   ├── utils/
│   │   ├── jwt.ts                # JWT utilities
│   │   ├── slugify.ts
│   │   └── pagination.ts
│   └── tests/
│       ├── setup.ts
│       └── helper.ts
├── scripts/
│   └── setup-db.ts               # Database setup
├── drizzle.config.ts
├── drizzle.dev.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error: database "smart_shop_productdb" does not exist**

Solution:
```bash
# Create database manually
psql -U postgres
CREATE DATABASE smart_shop_productdb;

# Or run setup script
npm run db:setup
```

### JWT Token Validation Fails

**Error: "Forbidden" or "Invalid token"**

Causes:
- JWT_SECRET doesn't match user-service
- Token expired
- Malformed token

Solution:
```bash
# Ensure JWT_SECRET is identical in both services
# user-service/.env and product-service/.env must have same JWT_SECRET
```

### Port Already in Use

**Error: EADDRINUSE: address already in use :::3002**

Solution:
```bash
# Find and kill the process
lsof -ti:3002 | xargs kill -9

# Or change PORT in .env
PORT=3003
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t product-service .

# Run container
docker run -d \
  -p 3002:3002 \
  --env-file .env \
  --name product-service \
  product-service
```

### Using Docker Compose

```yaml
services:
  product-service:
    build: ./product-service
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://productservice:productservice123@product-database:5432/smart_shop_productdb
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - product-database
```

## 📝 API Documentation

For complete API documentation with examples, see:
- [Postman Collection](./postman_collection.json) (if available)
- [OpenAPI/Swagger](./swagger.yaml) (if available)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update this README for significant changes
4. Follow the existing code structure
5. Use conventional commit messages

## 📄 License

ISC

## 👥 Authors

- Vrushabh Bayas

## 🔗 Related Services

- [User Service](../user-service/README.md)
- [Main Documentation](../README.md)
