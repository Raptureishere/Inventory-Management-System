# Inventory Management System - Backend API

ExpressJS + TypeORM + PostgreSQL (Neon) backend for the Clinic Inventory Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create `.env` file:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # TypeORM configuration
│   ├── entities/                # Database entities
│   │   ├── User.ts
│   │   ├── Item.ts
│   │   ├── Supplier.ts
│   │   ├── Requisition.ts
│   │   ├── RequisitionItem.ts
│   │   ├── PurchaseOrder.ts
│   │   ├── PurchaseOrderItem.ts
│   │   ├── IssuingVoucher.ts
│   │   └── IssuingItem.ts
│   ├── controllers/             # Route controllers
│   ├── routes/                  # API routes
│   ├── middleware/              # Auth & validation
│   └── server.ts                # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## 🗄️ Database Entities

### User
- Authentication and authorization
- Roles: admin, subordinate
- JWT token-based auth

### Item
- Inventory items with categories
- Stock tracking
- Supplier relationships

### Supplier
- Supplier management
- Contact information

### Requisition
- Department requisitions
- Status workflow
- Multi-item support

### Purchase Order
- PO management
- Supplier orders
- Receiving workflow

### Issuing Voucher
- Item issuance
- Stock deduction
- Status tracking

## 🔐 Authentication

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Protected Routes
Include JWT token in header:
```
Authorization: Bearer <token>
```

## 📡 API Endpoints

### Auth
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register (admin only)

### Items
- `GET /api/v1/items` - List all items
- `GET /api/v1/items/:id` - Get item by ID
- `POST /api/v1/items` - Create item (admin)
- `PUT /api/v1/items/:id` - Update item (admin)
- `DELETE /api/v1/items/:id` - Delete item (admin)

### Suppliers
- `GET /api/v1/suppliers` - List suppliers
- `POST /api/v1/suppliers` - Create supplier
- `PUT /api/v1/suppliers/:id` - Update supplier
- `DELETE /api/v1/suppliers/:id` - Delete supplier

### Requisitions
- `GET /api/v1/requisitions` - List requisitions
- `POST /api/v1/requisitions` - Create requisition
- `PUT /api/v1/requisitions/:id/forward` - Forward requisition
- `PUT /api/v1/requisitions/:id/cancel` - Cancel requisition

### Purchase Orders
- `GET /api/v1/purchase-orders` - List POs
- `POST /api/v1/purchase-orders` - Create PO
- `PUT /api/v1/purchase-orders/:id/receive` - Receive PO

### Issuing
- `GET /api/v1/issuing` - List vouchers
- `POST /api/v1/issuing` - Create voucher
- `PUT /api/v1/issuing/:id` - Update voucher

## 🛠️ Development

### Run Migrations
```bash
npm run migration:generate -- src/database/migrations/InitialSchema
npm run migration:run
```

### Seed Database
```bash
npm run seed
```

### Linting
```bash
npm run lint
```

## 📦 Dependencies

### Core
- express - Web framework
- typeorm - ORM
- pg - PostgreSQL client
- bcrypt - Password hashing
- jsonwebtoken - JWT auth

### Middleware
- cors - CORS support
- helmet - Security headers
- morgan - Logging
- express-rate-limit - Rate limiting

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- Helmet security headers
- CORS configuration
- Rate limiting
- Role-based access control

## 📝 Next Steps

1. Install dependencies: `npm install`
2. Configure `.env` file
3. Run migrations
4. Seed database
5. Start server: `npm run dev`
6. Test endpoints with Postman/Thunder Client

## 🚀 Deployment

### Neon PostgreSQL Setup
1. Create account at neon.tech
2. Create new project
3. Copy connection string to `.env`

### Deploy Backend
- Render.com
- Railway.app
- Fly.io
- Heroku

## ✅ Status

**Current Implementation:**
- ✅ Database entities
- ✅ TypeORM configuration
- ✅ Authentication middleware
- ✅ Auth controller
- ✅ Item routes
- ⏳ Remaining controllers (in progress)
- ⏳ Swagger documentation
- ⏳ Validation DTOs
- ⏳ Error handling

**To Complete:**
- Item controller
- Supplier controller
- Requisition controller
- Purchase Order controller
- Issuing controller
- Swagger setup
- Seed data
- Tests

## 📚 Resources

- [TypeORM Documentation](https://typeorm.io)
- [Express.js Guide](https://expressjs.com)
- [Neon PostgreSQL](https://neon.tech)
- [JWT.io](https://jwt.io)

---

Built with ❤️ for Clinic Inventory Management
