# Backend Setup Guide

Complete guide to set up and run the Inventory Management System backend.

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database (Neon recommended)
- Git (optional)

## 🚀 Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages:
- express, typeorm, pg
- bcrypt, jsonwebtoken
- cors, helmet, morgan
- And all TypeScript dependencies

### 2. Set Up Neon PostgreSQL Database

#### Option A: Using Neon (Recommended)

1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `CREATE DATABASE inventory_db;`
3. Note your connection details

### 3. Configure Environment Variables

Create `.env` file in the `backend` directory:

```env
# Server
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# Database (Neon)
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/inventory_db?sslmode=require
# Or for local PostgreSQL
# DATABASE_URL=postgresql://localhost:5432/inventory_db
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=yourpassword
# DB_DATABASE=inventory_db
# DB_SSL=false

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

**Important:** Change `JWT_SECRET` to a strong random string!

### 4. Build TypeScript

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist` folder.

### 5. Run Database Migrations

TypeORM will auto-sync in development mode, but for production:

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/InitialSchema

# Run migrations
npm run migration:run
```

### 6. Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:5000

You should see:
```
Database connected successfully
Server running on port 5000
```

## 🧪 Testing the API

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2023-10-31T12:00:00.000Z"
}
```

### 2. Register First User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin",
    "fullName": "System Administrator",
    "email": "admin@clinic.com"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Save the returned token!

### 4. Test Protected Endpoint

```bash
curl http://localhost:5000/api/v1/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📡 API Endpoints

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/register
```

### Items
```
GET    /api/v1/items
GET    /api/v1/items/:id
POST   /api/v1/items          (admin only)
PUT    /api/v1/items/:id      (admin only)
DELETE /api/v1/items/:id      (admin only)
```

### Users
```
GET    /api/v1/users          (admin only)
GET    /api/v1/users/:id      (admin only)
POST   /api/v1/users          (admin only)
PUT    /api/v1/users/:id      (admin only)
DELETE /api/v1/users/:id      (admin only)
```

### Suppliers
```
GET    /api/v1/suppliers
GET    /api/v1/suppliers/:id
POST   /api/v1/suppliers
PUT    /api/v1/suppliers/:id
DELETE /api/v1/suppliers/:id
```

### Requisitions
```
GET /api/v1/requisitions
GET /api/v1/requisitions/:id
POST /api/v1/requisitions
PUT /api/v1/requisitions/:id/forward
PUT /api/v1/requisitions/:id/cancel
```

### Purchase Orders
```
GET /api/v1/purchase-orders
GET /api/v1/purchase-orders/:id
POST /api/v1/purchase-orders    (admin only)
PUT /api/v1/purchase-orders/:id/receive (admin only)
```

## 🔧 Troubleshooting

### Error: "Cannot find module 'express'"

**Solution:** Run `npm install`

### Error: "Database connection failed"

**Solutions:**
1. Check DATABASE_URL in `.env`
2. Verify database is running
3. Check firewall/network settings
4. For Neon: Ensure SSL is enabled

### Error: "Invalid token"

**Solutions:**
1. Check JWT_SECRET matches between requests
2. Token may have expired (24h default)
3. Login again to get new token

### Error: "Port 5000 already in use"

**Solutions:**
1. Change PORT in `.env`
2. Kill process using port: `npx kill-port 5000`

### TypeScript Errors in IDE

**Solution:** These are expected before `npm install`. They'll disappear after installing dependencies.

## 🚀 Production Deployment

### 1. Build for Production

```bash
npm run build
```

### 2. Set Environment Variables

Update `.env` for production:
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=strong-random-secret-min-32-characters
CORS_ORIGIN=https://yourdomain.com
```

### 3. Start Production Server

```bash
npm start
```

### Deployment Platforms

#### Render.com
1. Connect GitHub repo
2. Select backend folder
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables

#### Railway.app
1. New project from GitHub
2. Select backend service
3. Add environment variables
4. Deploy

#### Fly.io
```bash
fly launch
fly deploy
```

## 📊 Database Schema

### Tables Created

- `users` - Authentication and user management
- `items` - Inventory items
- `suppliers` - Supplier information
- `requisitions` - Department requisitions
- `requisition_items` - Requisition line items
- `purchase_orders` - Purchase orders
- `purchase_order_items` - PO line items
- `issuing_vouchers` - Item issuance vouchers
- `issuing_items` - Issuing line items

## 🔐 Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT authentication
- [x] Role-based authorization
- [x] CORS configured
- [x] Helmet security headers
- [ ] Rate limiting (configured, needs testing)
- [ ] Input validation (needs DTOs)
- [ ] SQL injection prevention (TypeORM handles)

## 📝 Next Steps

1. **Add Seed Data**
   - Create seed script
   - Add sample items, suppliers
   - Match frontend mock data

2. **Add Validation**
   - Install class-validator
   - Create DTOs
   - Add validation middleware

3. **Complete Controllers**
   - Finish PurchaseOrderController
   - Create IssuingController

4. **Add Swagger**
   - Install swagger dependencies
   - Add API documentation
   - Set up Swagger UI

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

## 🆘 Getting Help

- Check IMPLEMENTATION_STATUS.md for current progress
- Review README.md for overview
- Check TypeORM docs: https://typeorm.io
- Check Express docs: https://expressjs.com

## ✅ Verification Checklist

After setup, verify:

- [ ] `npm install` completed without errors
- [ ] `.env` file created with all variables
- [ ] Database connection successful
- [ ] Server starts on specified port
- [ ] Health endpoint returns 200
- [ ] Can register a user
- [ ] Can login and receive token
- [ ] Protected endpoints require token
- [ ] Admin-only endpoints check role

---

**Your backend is ready to use!** 🎉

Next: Connect your React frontend to use these APIs instead of localStorage.
