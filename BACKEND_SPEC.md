### Backend Specification and Implementation Plan (ExpressJS + Swagger + Neon Postgres)

## Overview
- Stack: ExpressJS, TypeORM (or Prisma), PostgreSQL (Neon), Swagger (OpenAPI 3), JWT auth with role-based access control.
- Domains: Auth/Users, Items (Inventory), Suppliers, Purchase Orders, Requisitions, Issuing Vouchers, Reports.
- Cross-cutting: Pagination, filtering, sorting, soft deletes (where appropriate), audit fields, error handling, validation, logging, rate limiting.

## High-Level Architecture
- Modules:
  - AuthModule (JWT, RolesGuard)
  - UsersModule
  - ItemsModule
  - SuppliersModule
  - PurchaseOrdersModule
  - RequisitionsModule
  - IssuingModule
  - ReportsModule
  - HealthModule
- Layers per module: Controller → Service → Repository (TypeORM) → Entity/DTO → Migrations
- Swagger: Auto-generated docs with tags per module, bearer auth configured.

## Environment and Config
- ENV (example)
  - DATABASE_URL=postgres://USER:PASSWORD@HOST/DB?sslmode=require
  - JWT_SECRET=...
  - JWT_EXPIRES_IN=1d
  - NODE_ENV=production|development
  - PORT=3000
- ConfigModule with validation via Joi.

## Database Schema (Neon Postgres)
- users
  - id (pk, uuid), username (unique), password_hash, role (enum: admin, subordinate), created_at, updated_at, is_active
- items
  - id (pk, uuid), item_code (unique), item_name, category (enum: SL, SM, CL, LG, A2), unit, quantity (int, default 0), date_received (date), supplier_id (fk suppliers.id, nullable), created_at, updated_at
- suppliers
  - id (pk, uuid), name (unique), contact_name, phone, email, address, notes, created_at, updated_at
- purchase_orders
  - id (pk, uuid), po_number (unique), supplier_id (fk), order_date (date), expected_delivery_date (date), received_date (date, nullable), status (enum: Pending, Received, Cancelled), created_at, updated_at
- purchase_order_items
  - id (pk, uuid), purchase_order_id (fk), item_id (fk), item_name_snapshot, quantity (int), unit_price (numeric(12,2)), created_at
- requisitions
  - id (pk, uuid), req_number (unique), department_name, created_by_user_id (fk users.id), date_requested (timestamptz), status (enum: Pending, Forwarded, Issued, Cancelled), created_at, updated_at
- requisition_items
  - id (pk, uuid), requisition_id (fk), item_id (fk), item_name_snapshot, quantity (int)
- issuing_vouchers
  - id (pk, uuid), voucher_id (unique), requisition_id (fk), department_name, issue_date (date), notes, status (enum: Pending, Partially Provided, Fully Provided), created_at, updated_at
- issuing_items
  - id (pk, uuid), issuing_voucher_id (fk), item_id (fk), item_name_snapshot, requested_qty (int), issued_qty (int), post_issue_balance (int)
- audit_log (optional, phase 2)
  - id, actor_user_id, action, entity_type, entity_id, before_json, after_json, occurred_at

Indexes: unique on codes/numbers; btree indexes on foreign keys, status, created_at.

## API Surface (Swagger Tags and Endpoints)

- Auth (tag: Auth)
  - POST /auth/login
    - body: { username, password }
    - 200: { accessToken, user: { id, username, role } }
  - GET /auth/me (bearer)
    - 200: user info
- Users (tag: Users) [admin]
  - GET /users?search=&page=&limit=
  - POST /users { username, password, role }
  - PATCH /users/:id { username?, password?, role?, isActive? }
  - DELETE /users/:id
- Items (tag: Items)
  - GET /items?search=&category=&page=&limit=&sort=
  - GET /items/:id
  - POST /items { itemCode?, itemName, category, unit, quantity, dateReceived, supplierId? }
  - PATCH /items/:id { itemName?, category?, unit?, quantity?, dateReceived?, supplierId? }
  - DELETE /items/:id
  - POST /items/import (multipart CSV/XLSX) [admin]
  - GET /items/export (CSV/XLSX)
- Suppliers (tag: Suppliers)
  - GET /suppliers?search=&page=&limit=
  - GET /suppliers/:id
  - POST /suppliers { name, contactName?, phone?, email?, address?, notes? }
  - PATCH /suppliers/:id { ...fields }
  - DELETE /suppliers/:id
- Purchase Orders (tag: Purchase Orders)
  - GET /purchase-orders?search=&status=&dateFrom=&dateTo=&page=&limit=
  - GET /purchase-orders/:id
  - POST /purchase-orders { poNumber, supplierId, orderDate, expectedDeliveryDate?, items: [{ itemId, quantity, unitPrice }] }
  - PATCH /purchase-orders/:id { expectedDeliveryDate?, status? }
  - POST /purchase-orders/:id/receive
    - body: { receivedDate? }
    - effect: set status=Received; increment item quantities by each line; write audit
  - POST /purchase-orders/:id/cancel
- Requisitions (tag: Requisitions)
  - GET /requisitions?dept=&status=&dateFrom=&dateTo=&page=&limit=
  - GET /requisitions/:id
  - POST /requisitions { departmentName, requestedItems: [{ itemId, quantity }], createdBy }
  - PATCH /requisitions/:id { departmentName?, requestedItems? }
  - POST /requisitions/:id/forward
  - POST /requisitions/:id/cancel
  - DELETE /requisitions/:id [admin]
- Issuing Vouchers (tag: Issuing)
  - GET /issuing-vouchers?dept=&status=&dateFrom=&dateTo=&page=&limit=
  - GET /issuing-vouchers/:id
  - POST /issuing-vouchers
    - body: { requisitionId, issueDate, notes?, issuedItems: [{ itemId, requestedQty, issuedQty }] }
    - effect: decrement stock by issuedQty; set requisition status=Issued; compute status (Pending/Partial/Full); generate voucherId
  - GET /issuing-vouchers/:id/print (HTML/PDF)
- Reports (tag: Reports)
  - GET /reports/stock-balance?category=
  - GET /reports/item-movement?dateFrom=&dateTo=
  - GET /reports/stock-quantity-by-category?dateFrom=&dateTo=
  - GET /reports/export?type=stock_balance|item_movement|stock_quantity_category&format=xlsx|pdf&filters...
- Health (tag: Health)
  - GET /health
    - db: ok, app: ok

## Request/Response Standards
- Pagination: query params page (1-based), limit (default 20), return: { data, meta: { page, limit, total, totalPages } }
- Sorting: sort=field:asc|desc; whitelist fields per endpoint
- Filtering: query filters with exact match or LIKE where relevant
- Errors:
  - 400 ValidationError
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
  - 409 Conflict (unique constraint)
  - 422 Business rule violation (e.g., negative stock)
- Validation: class-validator on DTOs
- Dates: Use ISO 8601 (YYYY-MM-DD for dates, ISO string for timestamp)

## Security and Roles
- JWT bearer auth
- RolesGuard with @Roles('admin'|'subordinate')
- Ownership/Permissions:
  - Subordinate: create requisitions, view items, view their own requests
  - Admin: full access, issue items, manage users, suppliers, POs, reports

## Entity and DTO Sketches

- Users
  - Entity: id, username, passwordHash, role, isActive, timestamps
  - DTOs: CreateUserDto, UpdateUserDto, LoginDto
- Items
  - Entity: id, itemCode, itemName, category, unit, quantity, dateReceived, supplier, timestamps
  - DTOs: CreateItemDto, UpdateItemDto, ImportItemsDto (file), ExportItemsDto
- Suppliers
  - Entity: id, name, contactName, phone, email, address, notes, timestamps
  - DTOs: CreateSupplierDto, UpdateSupplierDto
- Purchase Orders
  - Entity: id, poNumber, supplier, orderDate, expectedDeliveryDate, receivedDate, status, timestamps
  - Lines: itemId, itemNameSnapshot, quantity, unitPrice
  - DTOs: CreatePurchaseOrderDto, ReceivePurchaseOrderDto, UpdatePurchaseOrderDto
- Requisitions
  - Entity: id, reqNumber, departmentName, createdBy, dateRequested, status, timestamps
  - Lines: itemId, itemNameSnapshot, quantity
  - DTOs: CreateRequisitionDto, UpdateRequisitionDto, ForwardRequisitionDto, CancelRequisitionDto
- Issuing Vouchers
  - Entity: id, voucherId, requisition, departmentName, issueDate, notes, status, timestamps
  - Lines: itemId, itemNameSnapshot, requestedQty, issuedQty, postIssueBalance
  - DTOs: CreateIssuingVoucherDto
- Reports
  - DTOs for filters only

## Business Rules
- Items.quantity cannot go below 0.
- Receiving an already received/cancelled PO returns 422.
- Issuing with issuedQty > available stock returns 422.
- Requisition status transitions:
  - Pending → Forwarded → Issued
  - Pending/Forwarded → Cancelled
- Issuing voucher status:
  - If any issuedQty is 0 across all: Pending
  - If at least one issuedQty < requestedQty and some > 0: Partially Provided
  - If all issuedQty == requestedQty: Fully Provided

## Swagger Configuration
- Global bearer auth
- Tags: Auth, Users, Items, Suppliers, Purchase Orders, Requisitions, Issuing, Reports, Health
- Operation summaries, requestBody schemas, response schemas
- Example payloads in decorators
- Pagination meta schema

## Mapping Frontend → Backend Endpoints
- LoginPage → POST /auth/login, GET /auth/me
- AddItems (list, add, edit, delete, import/export) → /items, /items/import, /items/export
- RequisitionBook → /requisitions (CRUD, forward, cancel)
- StoreIssuingVoucher → /issuing-vouchers (create), /requisitions/:id
- IssuedItemsRecord → /issuing-vouchers (list, details)
- Reports → /reports/*, export variants
- SupplierManagement → /suppliers
- PurchaseOrders → /purchase-orders (+ receive, cancel)
- UserManagement → /users

## Implementation Plan (Phased)

1) Project Setup
- nest new api; add ConfigModule, TypeORM (or Prisma), Swagger.
- Configure DATABASE_URL for Neon (sslmode=require).
- Add health check.

2) Auth + Users
- Users entity, seed admin user via migration.
- AuthModule: local strategy, JWT strategy, RolesGuard.
- Endpoints: /auth/login, /auth/me, /users CRUD (admin).

3) Core Inventory
- Items entity, ItemsModule CRUD, pagination, filters.
- Import/Export endpoints using streaming (CSV/XLSX).
- Supplier entity and SuppliersModule.

4) Purchase Orders
- Entities: purchase_orders, purchase_order_items.
- Create PO, list, receive, cancel.
- Receiving updates item stock with single transaction.

5) Requisitions
- Entities: requisitions, requisition_items.
- Create, forward, cancel, list.
- Permissions: subordinate can create own; admin can manage all.

6) Issuing Vouchers
- Create voucher; decrement stock atomically.
- Status calculation (pending/partial/full); update requisition to Issued.
- Voucher print (server-side HTML layout; optional PDF phase 2).

7) Reports
- Stock balance by category/item
- Item movement (from PO received + issued vouchers)
- Export endpoints (XLSX, print)

8) Cross-cutting
- Error filter for standardized JSON errors.
- Logging (Nest logger + morgan).
- Rate limiting (optional).
- Audit log (phase 2).

9) Testing and CI
- Unit tests (services), e2e (supertest).
- GitHub Actions: lint, test; deploy to Render/Fly/Heroku or container.
- DB migrations with TypeORM CLI (or Prisma migrate).

## Migrations (TypeORM)
- 001_init: users, suppliers, items
- 002_pos: purchase_orders, purchase_order_items
- 003_requisitions: requisitions, requisition_items
- 004_issuing: issuing_vouchers, issuing_items
- 005_indexes: add needed indexes/constraints
- Seed admin user and base suppliers/items when NODE_ENV=development

## Sample DTOs (abbreviated)

```ts
// CreateItemDto
export class CreateItemDto {
  @IsString() itemName: string;
  @IsEnum(ItemCategory) category: ItemCategory;
  @IsString() unit: string;
  @IsInt() @Min(0) quantity: number;
  @IsDateString() dateReceived: string;
  @IsUUID() @IsOptional() supplierId?: string;
}
```

```ts
// CreatePurchaseOrderDto
export class CreatePurchaseOrderDto {
  @IsString() poNumber: string;
  @IsUUID() supplierId: string;
  @IsDateString() orderDate: string;
  @IsDateString() @IsOptional() expectedDeliveryDate?: string;
  @ValidateNested({ each: true }) items: Array<{ itemId: string; quantity: number; unitPrice: number }>;
}
```

## Error Response Example
```json
{
  "statusCode": 422,
  "message": "Insufficient stock for item Surgical Masks",
  "error": "Unprocessable Entity"
}
```

## Health Check
- GET /health: { app: 'ok', db: 'ok', version, timestamp }

## Deployment Notes (Neon)
- Use DATABASE_URL with SSL.
- Run migrations on deploy.
- Configure connection pooling (Neon serverless driver or pgbouncer if hosting elsewhere).
- Backup strategy via Neon branching/snapshots.

## Timeline (Indicative)
- Day 1-2: Setup, Auth/Users, Health, Config, DB scaffold
- Day 3-4: Items + Suppliers + Import/Export
- Day 5-6: POs + Receive flow
- Day 7-8: Requisitions + Forward/Cancel
- Day 9: Issuing + stock decrement + voucher
- Day 10: Reports + export
- Day 11: Tests, polish Swagger, error handling
- Day 12: CI/CD, deployment, handover


