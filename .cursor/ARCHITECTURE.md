# Pulse RX Backend
### SaaS Architecture Documentation

**Tech Stack:** Laravel • PostgreSQL • Redis • Multi-Tenant  
**Repository:** pulse-rx-backend

---

## 1. Overview

Pulse RX Backend is the **core SaaS API** powering a reusable retail platform designed for pharmacies and other retail businesses (e.g. grocery, general stores).

This system is **not built for a single client**.  
It is designed as a **multi-tenant SaaS platform** where:

- One codebase serves many businesses
- Each business operates in complete data isolation
- Onboarding, scaling, and billing are automated

---

## 2. Core Principles

- Single Laravel backend
- Single PostgreSQL database
- Strong tenant isolation
- Subscription-ready architecture
- Excel-driven inventory management
- High performance with cost efficiency

---

## 3. Multi-Tenancy Strategy (CRITICAL)

### 3.1 Schema-Based Multi-Tenancy

Pulse RX uses **PostgreSQL schema-based multi-tenancy**.

- There is **ONE PostgreSQL database**
- Each tenant (business) gets its **own schema**
- Business data never overlaps between tenants

### 3.2 Database Layout Example

```
pulse_rx_db
│
├── public
│   ├── users
│   ├── tenants
│   ├── plans
│   ├── subscriptions
│   └── domains
│
├── tenant_pharmacy_abc123
│   ├── products
│   ├── product_variants
│   ├── inventory
│   ├── orders
│   ├── order_items
│   ├── customers
│   └── settings
│
└── tenant_store_xyz789
    ├── products
    ├── inventory
    └── orders
```

### 3.3 What NOT To Do

❌ Do not use `tenant_id` on every business table  
❌ Do not create one database per tenant  
❌ Do not share business tables across tenants

---

## 4. Data Separation Rules

### 4.1 Public Schema (SaaS Core)

The `public` schema stores **platform-level data only**:

- Users (authentication)
- Tenants
- Subscription plans
- Subscriptions
- Domain mappings
- Billing metadata

### 4.2 Tenant Schemas (Business Data)

Each tenant schema stores **only that business's data**:

- Products
- Inventory
- Orders
- Customers
- Payments
- Store settings

---

## 5. Tenant Resolution Flow

Every request **must resolve the active tenant before any database access**.

### 5.1 Resolution Sources

- Authenticated user → `users.tenant_id`
- (Future) Subdomain → `{tenant}.pulserx.app`

### 5.2 Schema Activation

Once tenant is resolved:

```sql
SET search_path TO tenant_schema_name;
```

After this:

- Eloquent models automatically query the tenant schema
- No tenant-specific logic is required in models

---

## 6. Middleware Responsibilities

A mandatory middleware layer must:

- Resolve the tenant
- Validate tenant status (active / suspended)
- Set PostgreSQL search_path
- Enforce subscription or trial validity

⚠️ **This middleware must run before any model query.**

---

## 7. Database Migrations Strategy

### 7.1 Global Migrations

**Location:**

```
database/migrations/global
```

**Used for:**

- users
- tenants
- plans
- subscriptions

**Run normally:**

```bash
php artisan migrate
```

### 7.2 Tenant Migrations

**Location:**

```
database/migrations/tenant
```

**Used for:**

- products
- inventory
- orders
- customers

**Executed via a custom Artisan command that:**

- Iterates all tenants
- Switches schema
- Runs tenant migrations per schema

---

## 8. Authentication & Roles

### 8.1 Authentication

- Laravel Sanctum
- API-first authentication
- Centralized user table

### 8.2 Roles

- `admin` → store owner
- `staff` → inventory & order management
- `customer` → order history & profile
- `guest` → checkout without account

Each user belongs to one tenant only.

---

## 9. Subscription & Access Control

Each tenant is linked to a subscription plan.

**Plans define:**

- Feature access
- Usage limits

**Middleware blocks access if:**

- Trial expires
- Subscription becomes inactive

---

## 10. Image & Media Handling

- No local file storage
- Use Cloudinary or S3
- Store only image URLs in database

### 10.1 Image Naming Convention

```
/tenants/{tenant_id}/products/{serial_number}.png
```

Images are matched automatically using product serial numbers.

---

## 11. Excel-Based Inventory Management

Inventory is managed primarily through Excel uploads.

### 11.1 Expected Flow

1. Upload Excel file
2. Validate file structure
3. Parse rows asynchronously
4. Match products by serial number
5. Auto-map product images
6. Insert or update inventory records

### 11.2 Requirements

All processing must be:

- Tenant-isolated
- Queued (background jobs)
- Fault-tolerant

---

## 12. Redis Usage

Redis is used for:

- Caching
- Sessions
- Queues

### 12.1 Key Namespace Convention

```
pulse_rx:tenant:{tenant_id}:*
```

Redis must never store permanent business data.

---

## 13. Backend Folder Structure (Expected)

```
app/
├── Models/
│   ├── User.php
│   ├── Tenant.php
│   ├── Plan.php
│   └── Subscription.php
│
├── Services/
│   ├── Tenant/
│   │   ├── TenantCreator.php
│   │   ├── TenantResolver.php
│   │   └── TenantSeeder.php
│   │
│   ├── Inventory/
│   │   └── ExcelImportService.php
│   │
│   └── Billing/
│       └── SubscriptionService.php
│
├── Http/
│   ├── Middleware/
│   │   ├── ResolveTenant.php
│   │   ├── SetTenantSchema.php
│   │   └── EnsureSubscriptionActive.php
│
├── Jobs/
│   ├── CreateTenantSchema.php
│   └── ProcessInventoryImport.php
│
└── Console/
    └── Commands/
        └── RunTenantMigrations.php
```

---

## 14. Hard Constraints (Do Not Violate)

❌ No per-tenant deployments  
❌ No shared tenant business data  
❌ No Firebase / Supabase as core database  
❌ No local image storage  
❌ No hardcoded tenant identifiers

---

## 15. Mental Model (IMPORTANT)

- Laravel = Brain
- PostgreSQL Schemas = Isolated Worlds
- Middleware = World Switcher

---

## 16. Cursor Instructions

When generating code:

- Follow this architecture strictly
- Assume schema-based multi-tenancy
- Never mix public and tenant data
- Build components incrementally
- Prefer services over fat controllers

**Example prompt:**

> "Create tenant middleware following the Pulse RX schema-based SaaS architecture."

---

## 17. End Goal

Pulse RX Backend must support:

- Automated tenant onboarding
- Secure data isolation
- Subscription-based access
- Excel-first inventory management
- High performance at low cost
- Reusability across retail verticals
