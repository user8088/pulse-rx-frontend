## Pulse RX API Documentation

This document describes **every API route currently registered in** `routes/api.php`, including the exact path, required middleware, request validation rules, response shapes, and important behavioral notes.

### Base URLs

- **Local backend**: `http://localhost:8000`
- **Local API base**: `http://localhost:8000/api`
- **Production API base**: `https://<your-backend-domain>/api`

All routes documented below are shown **relative to `/api`**.

### Conventions (important)

- **JSON**: All endpoints return JSON (and expect JSON bodies unless noted).
- **Headers**:
  - `Accept: application/json` (recommended for consistent JSON errors)
  - `Content-Type: application/json` (for JSON bodies)
  - `Authorization: Bearer <token>` (for authenticated routes)
- **IDs in routes**:
  - Resource routes use **Laravel route-model binding**: `{category}`, `{product}`, `{customer}`, `{image}` are **numeric DB IDs**, not `item_id`.
- **Pagination**:
  - List endpoints use Laravel `paginate()` with default page size (typically **15**).
  - Supported query parameter: `?page=<number>`
  - Response includes paginator metadata (example shown below).

### CORS (browser access)

Configured in `config/cors.php`. Allowed origins include:

- `http://localhost:3000`, `http://127.0.0.1:3000`
- `http://localhost:5173`, `http://127.0.0.1:5173`
- `https://pulse-rx-frontend.vercel.app`

### Authentication + Multi-tenancy + Dashboard role rules

The API has three key layers:

- **`auth:sanctum`**
  - Requires a valid Sanctum personal access token.
  - Tokens are issued by the login endpoints and must be sent as `Authorization: Bearer <token>`.

- **Tenant middleware** (tenant-scoped endpoints only)
  - **`tenant.resolve`**: resolves the tenant from the authenticated user’s `tenant_id` and binds it into the container as `tenant`.
  - **`tenant.schema`**: sets PostgreSQL `search_path` to `"{tenant_schema}, public"` so tenant tables are isolated per schema.
  - If the user is missing a tenant or the tenant is inactive, the middleware layer can return errors (commonly **401/403/404**).

- **Dashboard-only authorization**
  - Dashboard CRUD endpoints are under the **`/dashboard`** prefix and require:
    - `auth:sanctum`, `tenant.resolve`, `tenant.schema`, and `role:admin,staff`
  - Dashboard login (`/dashboard/login`) does **not** use `role` middleware, but the controller enforces it and returns **403** if role is not `admin` or `staff`.

### Standard error responses

Laravel’s default validation errors:

- **422 Unprocessable Entity** (validation failed)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Validation message..."]
  }
}
```

Common auth/permission errors:

- **401 Unauthorized**: missing/invalid token or invalid credentials

```json
{ "message": "Unauthenticated." }
```

- **403 Forbidden**: authenticated but not allowed (dashboard role, inactive tenant, etc.)

```json
{ "message": "Forbidden." }
```

Common not-found errors:

- **404 Not Found**: resource ID not found, or tenant not found, or nested image mismatch

```json
{ "message": "Not Found" }
```

---

## Route map (all endpoints)

### Public (no auth)

- **POST** `/login`
- **POST** `/auth/login` (alias of `/login`)
- **POST** `/dashboard/login`

### Authenticated (`auth:sanctum`)

- **GET** `/auth/me`
- **POST** `/auth/logout`
- **POST** `/auth/change-password`

### Tenant-scoped CRUD (`auth:sanctum`, `tenant.resolve`, `tenant.schema`)

- **POST** `/products/import`
- **GET** `/product-import-logs`
- **GET** `/product-import-logs/{import_uuid}`
- **Categories** (REST): `/categories`
- **Products** (REST): `/products`
- **Customers** (REST): `/customers`
- **Product images (nested)**: `/products/{product}/images/*`

### Dashboard CRUD (admin/staff only)

Same tenant-scoped routes as above, but with:

- **Prefix**: `/dashboard`
- **Extra middleware**: `role:admin,staff`

Example dashboard path: `/dashboard/products` (instead of `/products`).

---

## 1. Authentication

### 1.1 Login (store / mobile / general)

- **Method**: `POST`
- **Route**: `/login`
- **Also available as**: `POST /auth/login` (same controller method)
- **Auth**: none

#### Request body (JSON)

Validation rules:

- **email**: required, must be a valid email
- **password**: required

Example:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

#### Success response (200)

Returns a Sanctum token and the serialized user model.

```json
{
  "token": "1|abcdef123456...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "tenant_id": 1,
    "created_at": "2026-01-19T12:34:56.000000Z",
    "updated_at": "2026-01-19T12:34:56.000000Z"
  }
}
```

#### Error responses

- **401** invalid credentials

```json
{ "message": "Invalid credentials" }
```

---

### 1.2 Dashboard Login (admin/staff only)

- **Method**: `POST`
- **Route**: `/dashboard/login`
- **Auth**: none
- **Role restriction**: enforced by controller logic (`admin` or `staff` only)

#### Request body (JSON)

Same as normal login:

- **email**: required, email
- **password**: required

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

#### Success response (200)

```json
{
  "token": "1|abcdef123456...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "tenant_id": 1
  }
}
```

#### Error responses

- **401** invalid credentials

```json
{ "message": "Invalid credentials" }
```

- **403** valid credentials but role is not `admin`/`staff`

```json
{ "message": "Forbidden" }
```

---

### 1.3 Get current user + tenant

- **Method**: `GET`
- **Route**: `/auth/me`
- **Middleware**: `auth:sanctum`

#### Request headers

- `Authorization: Bearer <token>`

#### Success response (200)

Returns:

- **user**: the authenticated user (serialized)
- **tenant**: the user’s tenant (serialized), or `null` if none

```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "tenant_id": 1
  },
  "tenant": {
    "id": 1,
    "name": "Default Store",
    "slug": "default",
    "schema_name": "tenant_default_...",
    "status": "active",
    "trial_ends_at": null
  }
}
```

---

### 1.4 Logout (revoke current token)

- **Method**: `POST`
- **Route**: `/auth/logout`
- **Middleware**: `auth:sanctum`

#### Request headers

- `Authorization: Bearer <token>`

#### Success response (200)

```json
{ "message": "Logged out" }
```

---

### 1.5 Change password

- **Method**: `POST`
- **Route**: `/auth/change-password`
- **Middleware**: `auth:sanctum`

#### Request body (JSON)

Validation rules:

- **current_password**: required, string
- **new_password**: required, string, min length 8, **must be confirmed**
  - Confirmation field must be named **`new_password_confirmation`**

Example:

```json
{
  "current_password": "old_password",
  "new_password": "new_password_123",
  "new_password_confirmation": "new_password_123"
}
```

#### Success response (200)

```json
{ "message": "Password updated" }
```

#### Error responses

- **422** if current password is wrong

```json
{ "message": "Current password is incorrect" }
```

---

## 2. Categories (tenant-scoped)

All category endpoints exist in two variants:

- **Store API**: `/categories/*`
- **Dashboard API**: `/dashboard/categories/*` (admin/staff only)

### Category model fields

- **id**: integer
- **category_name**: string
- **alias**: string (auto-generated on create if not provided)
  - Generated as 3 uppercase characters derived from the name (padded with `X` if needed)
- **serial_id**: string (auto-generated + unique)
  - Format: `<ALIAS><6 digits>` (example: `MED482913`)
- **created_at**, **updated_at**: timestamps

---

### 2.1 List categories

- **Method**: `GET`
- **Routes**:
  - `/categories`
  - `/dashboard/categories`
- **Middleware**:
  - Store: `auth:sanctum`, `tenant.resolve`, `tenant.schema`
  - Dashboard: `auth:sanctum`, `tenant.resolve`, `tenant.schema`, `role:admin,staff`

#### Query parameters

- `page` (optional): page number

#### Success response (200) — paginated

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "category_name": "Medical Supplies",
      "alias": "MED",
      "serial_id": "MED482913",
      "created_at": "2026-01-19T12:34:56.000000Z",
      "updated_at": "2026-01-19T12:34:56.000000Z"
    }
  ],
  "first_page_url": "http://localhost:8000/api/categories?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "http://localhost:8000/api/categories?page=1",
  "links": [],
  "next_page_url": null,
  "path": "http://localhost:8000/api/categories",
  "per_page": 15,
  "prev_page_url": null,
  "to": 1,
  "total": 1
}
```

---

### 2.2 Create category

- **Method**: `POST`
- **Routes**:
  - `/categories`
  - `/dashboard/categories`

#### Request body (JSON)

Validation rules:

- **category_name**: required, string, max 255

```json
{
  "category_name": "Medical Supplies"
}
```

#### Success response (201)

The backend auto-generates **alias** and **serial_id** on create.

```json
{
  "id": 1,
  "category_name": "Medical Supplies",
  "alias": "MED",
  "serial_id": "MED482913",
  "created_at": "2026-01-19T12:34:56.000000Z",
  "updated_at": "2026-01-19T12:34:56.000000Z"
}
```

---

### 2.3 Get category by ID

- **Method**: `GET`
- **Routes**:
  - `/categories/{category}`
  - `/dashboard/categories/{category}`

#### Path parameters

- **category**: integer (category `id`)

#### Success response (200)

Returns the category record.

---

### 2.4 Update category

- **Methods**: `PUT` or `PATCH`
- **Routes**:
  - `/categories/{category}`
  - `/dashboard/categories/{category}`

#### Request body (JSON)

Validation rules:

- **category_name**: optional, but if provided must be string, max 255

```json
{
  "category_name": "Pharma"
}
```

#### Success response (200)

Returns the updated category record.

---

### 2.5 Delete category

- **Method**: `DELETE`
- **Routes**:
  - `/categories/{category}`
  - `/dashboard/categories/{category}`

#### Success response (204)

Returns empty body.

**Important**: Products referencing this category will have `category_id` set to `null` (category is `nullOnDelete`).

---

## 3. Products (tenant-scoped)

All product endpoints exist in two variants:

- **Store API**: `/products/*`
- **Dashboard API**: `/dashboard/products/*` (admin/staff only)

### Product model fields

- **id**: integer
- **item_id**: string, unique per tenant schema (typically comes from Excel import)
- **item_name**: string
- **category_id**: integer or null
- **brand**: string or null
- **stock_qty**: integer (defaults to 0)
- **low_stock_threshold**: integer (defaults to 0)
- **in_stock**: boolean
  - Automatically recomputed on save: `in_stock = (stock_qty > 0)`
- **retail_price**: decimal (2 decimal places), default 0
  - Returned as string in JSON (e.g. `"19.99"`) via `decimal:2` cast
- **product_group_id**: nullable string (max 64)
  - Logical group for variations (e.g. `SEVLA`). Same value across all variations of one product.
- **variation_type**: nullable string (max 64)
  - What dimension varies: e.g. `Strength`, `Size`, `Volume`.
- **variation_value**: nullable string (max 128)
  - The specific value: e.g. `400mg`, `1L`, `50ml`.
- **created_at**, **updated_at**: timestamps

Relationships:

- **category**: `belongsTo(Category)` (nullable)
- **images**: `hasMany(ProductImage)`

**API responses:** All product endpoints (list, show, create, update) return the full product payload, including `retail_price` and variation fields (`product_group_id`, `variation_type`, `variation_value`) when present.

#### Product response shape (single object)

Every product in list/show/create/update responses includes these fields. Variation fields are `null` for standalone products.

| Field | Type | Description |
|-------|------|-------------|
| **id** | integer | Primary key |
| **item_id** | string | Unique SKU (e.g. from Excel) |
| **product_group_id** | string \| null | Variation group (e.g. `SEVLA`). Same across all variants. |
| **variation_type** | string \| null | What varies: `Strength`, `Size`, `Volume`, etc. |
| **variation_value** | string \| null | Specific value: `400mg`, `1L`, `50ml`, etc. |
| **item_name** | string | Display name |
| **category_id** | integer \| null | FK to categories |
| **brand** | string \| null | Manufacturer / brand |
| **stock_qty** | integer | On-hand quantity |
| **low_stock_threshold** | integer | Reorder trigger |
| **in_stock** | boolean | `stock_qty > 0` |
| **retail_price** | string | Decimal as string (e.g. `"49.00"`) |
| **created_at** | string | ISO 8601 |
| **updated_at** | string | ISO 8601 |
| **category** | object \| null | Eager-loaded when included |
| **images** | array | Eager-loaded when included (list, show) |

**Variations:** Use `product_group_id` to group variants (e.g. Sevla 400mg / 800mg). Filter with `?product_group_id=SEVLA` to fetch all variants. Each variant has its own `item_id`, price, stock, and images.

---

### 3.1 List products

- **Method**: `GET`
- **Routes**:
  - `/products`
  - `/dashboard/products`

#### Query parameters

- `page` (optional): page number
- `per_page` (optional): integer 1..100 (default 15)
- `product_group_id` (optional): filter by variation group (exact match). Use to fetch all variations of a product (e.g. `?product_group_id=SEVLA`).
- `q` (optional): full-dataset search string
  - If `q` is missing/empty: returns the normal paginated list
  - If `q` is present: filters server-side using a case-insensitive “contains” match across:
    - `products.item_id`
    - `products.item_name`
    - `products.brand`
    - `categories.category_name` (via `whereHas`)

#### Success response (200) — paginated

Paginator with `data` = array of products. Each product includes eager-loaded `category` and `images`, plus `retail_price` and variation fields (`product_group_id`, `variation_type`, `variation_value`).

Example:

- `GET /products?page=1&per_page=15&q=mask`
- `GET /products?product_group_id=SEVLA` — all variants in that group
- `GET /dashboard/products?page=2&q=ibuprofen`

Response shape (paginator):

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 101,
      "item_id": "2112486",
      "product_group_id": "SEVLA",
      "variation_type": "Strength",
      "variation_value": "400mg",
      "item_name": "Sevla 400mg",
      "category_id": 5,
      "brand": "IMPORTED",
      "stock_qty": 60,
      "low_stock_threshold": 0,
      "in_stock": true,
      "retail_price": "49.00",
      "created_at": "2026-01-19T12:00:00.000000Z",
      "updated_at": "2026-01-19T12:00:00.000000Z",
      "category": {
        "id": 5,
        "category_name": "Medicines",
        "alias": "MED",
        "serial_id": "MED001",
        "created_at": "2026-01-19T11:00:00.000000Z",
        "updated_at": "2026-01-19T11:00:00.000000Z"
      },
      "images": [
        {
          "id": 1,
          "product_id": 101,
          "object_key": "tenants/1/products/2112486/images/1.png",
          "sort_order": 1,
          "is_primary": true,
          "created_at": "2026-01-19T12:05:00.000000Z",
          "updated_at": "2026-01-19T12:05:00.000000Z"
        }
      ]
    },
    {
      "id": 102,
      "item_id": "2118298",
      "product_group_id": null,
      "variation_type": null,
      "variation_value": null,
      "item_name": "Uv-Lite Spf-60 Sunblock Medium Tinted Cream",
      "category_id": null,
      "brand": "CRYSTOLITE",
      "stock_qty": 3,
      "low_stock_threshold": 0,
      "in_stock": true,
      "retail_price": "2990.05",
      "created_at": "2026-01-19T12:00:00.000000Z",
      "updated_at": "2026-01-19T12:00:00.000000Z",
      "category": null,
      "images": []
    }
  ],
  "first_page_url": "http://localhost:8000/api/products?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "http://localhost:8000/api/products?page=1",
  "links": [],
  "next_page_url": null,
  "path": "http://localhost:8000/api/products",
  "per_page": 15,
  "prev_page_url": null,
  "to": 2,
  "total": 2
}
```

- First item: product **with variations** (`product_group_id`, `variation_type`, `variation_value` set; `category` and `images` present).
- Second item: **standalone** product (variation fields `null`, `category` null, `images` empty).

#### Frontend usage (required change)

- Use `q` to search server-side instead of fetching all pages and filtering client-side.
- Use `product_group_id` to load all variants of a product (e.g. for a product detail page with size/strength options).
- Reset to `page=1` whenever `q` or `product_group_id` changes.
- Debounce typing (recommended ~250–400ms) and cancel in-flight requests when the user keeps typing.

---

### 3.2 Create product

- **Method**: `POST`
- **Routes**:
  - `/products`
  - `/dashboard/products`

#### Request body (JSON)

Validation rules:

- **item_id**: required, string, unique in `products.item_id`
- **item_name**: required, string, max 255
- **product_group_id**: optional, string, max 64 (variation group)
- **variation_type**: optional, string, max 64
- **variation_value**: optional, string, max 128
- **category_id**: nullable, must exist in `categories.id` if provided
- **brand**: nullable, string, max 255
- **stock_qty**: optional, integer, min 0
- **low_stock_threshold**: optional, integer, min 0
- **retail_price**: optional, numeric, min 0 (defaults to 0 if omitted)

Example (standalone product):

```json
{
  "item_id": "23223232",
  "item_name": "Face Mask",
  "category_id": 1,
  "brand": "HealthSafe",
  "stock_qty": 100,
  "low_stock_threshold": 10,
  "retail_price": 19.99
}
```

Example (product with variations):

```json
{
  "item_id": "2112486",
  "item_name": "Sevla 400mg",
  "product_group_id": "SEVLA",
  "variation_type": "Strength",
  "variation_value": "400mg",
  "category_id": 5,
  "brand": "IMPORTED",
  "stock_qty": 60,
  "low_stock_threshold": 10,
  "retail_price": 49
}
```

Notes:

- Do **not** send `null` for `stock_qty` / `low_stock_threshold` (they are not `nullable`); omit them or send an integer.
- `in_stock` is computed automatically from `stock_qty`.
- `retail_price` is included in all product API responses (list, show, create, update).

#### Success response (201)

Returns the created product with `category` loaded (no `images`). Includes all product fields and variation fields.

Example (product with variations):

```json
{
  "id": 103,
  "item_id": "V001",
  "product_group_id": "SEVLA",
  "variation_type": "Strength",
  "variation_value": "400mg",
  "item_name": "Sevla 400mg",
  "category_id": 5,
  "brand": "IMPORTED",
  "stock_qty": 60,
  "low_stock_threshold": 10,
  "in_stock": true,
  "retail_price": "49.00",
  "created_at": "2026-01-22T10:00:00.000000Z",
  "updated_at": "2026-01-22T10:00:00.000000Z",
  "category": {
    "id": 5,
    "category_name": "Medicines",
    "alias": "MED",
    "serial_id": "MED001",
    "created_at": "2026-01-19T11:00:00.000000Z",
    "updated_at": "2026-01-19T11:00:00.000000Z"
  }
}
```

Standalone product: `product_group_id`, `variation_type`, and `variation_value` are `null`.

---

### 3.3 Get product by ID

- **Method**: `GET`
- **Routes**:
  - `/products/{product}`
  - `/dashboard/products/{product}`

#### Path parameters

- **product**: integer (product `id`)

#### Success response (200)

Returns the product with `category` and `images` loaded. Includes `retail_price` and variation fields.

Example (product with variations and images):

```json
{
  "id": 101,
  "item_id": "2112486",
  "product_group_id": "SEVLA",
  "variation_type": "Strength",
  "variation_value": "400mg",
  "item_name": "Sevla 400mg",
  "category_id": 5,
  "brand": "IMPORTED",
  "stock_qty": 60,
  "low_stock_threshold": 0,
  "in_stock": true,
  "retail_price": "49.00",
  "created_at": "2026-01-19T12:00:00.000000Z",
  "updated_at": "2026-01-19T12:00:00.000000Z",
  "category": {
    "id": 5,
    "category_name": "Medicines",
    "alias": "MED",
    "serial_id": "MED001",
    "created_at": "2026-01-19T11:00:00.000000Z",
    "updated_at": "2026-01-19T11:00:00.000000Z"
  },
  "images": [
    {
      "id": 1,
      "product_id": 101,
      "object_key": "tenants/1/products/2112486/images/1.png",
      "sort_order": 1,
      "is_primary": true,
      "created_at": "2026-01-19T12:05:00.000000Z",
      "updated_at": "2026-01-19T12:05:00.000000Z"
    }
  ]
}
```

Standalone product: `product_group_id`, `variation_type`, `variation_value` are `null`; `images` may be `[]`.

---

### 3.4 Update product

- **Methods**: `PUT` or `PATCH`
- **Routes**:
  - `/products/{product}`
  - `/dashboard/products/{product}`

#### Request body (JSON)

Validation rules:

- **item_id**: optional, but if provided must be unique in `products.item_id` excluding current product
- **item_name**: optional, string, max 255
- **product_group_id**: optional, nullable, string, max 64
- **variation_type**: optional, nullable, string, max 64
- **variation_value**: optional, nullable, string, max 128
- **category_id**: optional; if provided may be null; if non-null must exist in `categories.id`
- **brand**: optional; may be null; if non-null must be string, max 255
- **stock_qty**: optional integer, min 0
- **low_stock_threshold**: optional integer, min 0
- **retail_price**: optional, numeric, min 0

Example:

```json
{
  "stock_qty": 0,
  "retail_price": 24.50
}
```

Notes:

- `in_stock` will be recomputed on save.
- `retail_price` is returned in the response.
- You may set `product_group_id`, `variation_type`, `variation_value` to `null` to convert a variant into a standalone product (or clear variation metadata).

#### Success response (200)

Returns the updated product with `category` loaded (no `images`). Same shape as **Create (201)** — all product fields including `retail_price` and variation fields. Example:

```json
{
  "id": 101,
  "item_id": "2112486",
  "product_group_id": "SEVLA",
  "variation_type": "Strength",
  "variation_value": "400mg",
  "item_name": "Sevla 400mg",
  "category_id": 5,
  "brand": "IMPORTED",
  "stock_qty": 0,
  "low_stock_threshold": 10,
  "in_stock": false,
  "retail_price": "24.50",
  "created_at": "2026-01-19T12:00:00.000000Z",
  "updated_at": "2026-01-22T14:30:00.000000Z",
  "category": {
    "id": 5,
    "category_name": "Medicines",
    "alias": "MED",
    "serial_id": "MED001",
    "created_at": "2026-01-19T11:00:00.000000Z",
    "updated_at": "2026-01-19T11:00:00.000000Z"
  }
}
```

---

### 3.5 Delete product

- **Method**: `DELETE`
- **Routes**:
  - `/products/{product}`
  - `/dashboard/products/{product}`

#### Success response (204)

Returns empty body.

---

## 4. Customers (tenant-scoped)

All customer endpoints exist in two variants:

- **Store API**: `/customers/*`
- **Dashboard API**: `/dashboard/customers/*` (admin/staff only)

### Customer model fields

- **id**: integer
- **name**: string
- **email**: string or null (**unique** per tenant schema if provided)
- **phone**: string or null
- **created_at**, **updated_at**: timestamps

---

### 4.1 List customers

- **Method**: `GET`
- **Routes**:
  - `/customers`
  - `/dashboard/customers`

#### Query parameters

- `page` (optional)

#### Success response (200) — paginated

Returns a standard Laravel paginator of customer records.

---

### 4.2 Create customer

- **Method**: `POST`
- **Routes**:
  - `/customers`
  - `/dashboard/customers`

#### Request body (JSON)

Validation rules:

- **name**: required, string, max 255
- **email**: nullable, email format, unique in `customers.email`
- **phone**: nullable, string, max 50

Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

#### Success response (201)

Returns the created customer record.

---

### 4.3 Get customer by ID

- **Method**: `GET`
- **Routes**:
  - `/customers/{customer}`
  - `/dashboard/customers/{customer}`

#### Path parameters

- **customer**: integer (customer `id`)

---

### 4.4 Update customer

- **Methods**: `PUT` or `PATCH`
- **Routes**:
  - `/customers/{customer}`
  - `/dashboard/customers/{customer}`

#### Request body (JSON)

Validation rules:

- **name**: optional, but if provided required, string, max 255
- **email**: optional; may be null; if provided must be valid email and unique excluding current customer
- **phone**: optional; may be null; if provided must be string, max 50

---

### 4.5 Delete customer

- **Method**: `DELETE`
- **Routes**:
  - `/customers/{customer}`
  - `/dashboard/customers/{customer}`

#### Success response (204)

Returns empty body.

---

## 5. Product Import (tenant-scoped)

Imports products from an Excel file and upserts by `item_id`.

- **Method**: `POST`
- **Routes**:
  - `/products/import`
  - `/dashboard/products/import`
- **Middleware**:
  - Store: `auth:sanctum`, `tenant.resolve`, `tenant.schema`
  - Dashboard: `auth:sanctum`, `tenant.resolve`, `tenant.schema`, `role:admin,staff`

### Request (multipart/form-data)

- **file**: required, file, must be `xlsx` or `xls`

Example curl:

```bash
curl -X POST "http://localhost:8000/api/products/import" \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json" \
  -F "file=@Item List - 08Jan26.xlsx"
```

### Excel parsing behavior (exact)

- Reads the **active worksheet** (first/active sheet).
- Uses the **first row as headers** and maps them case-insensitively after `trim()` + `lowercase`.
- Only these headers are recognized:
  - **Item Id** → `item_id` (required)
  - **Item Name** → `item_name` (required)
  - **Retail Value** → `retail_price` (required)
  - **Product Group Id** → `product_group_id` (optional; same value for all variants of one product, e.g. `SEVLA`)
  - **Variation Type** → `variation_type` (optional; e.g. `Strength`, `Size`, `Volume`)
  - **Variation Value** → `variation_value` (optional; e.g. `400mg`, `1L`, `50ml`)
  - **Category** → category name lookup (optional; creates category if missing)
  - **Manufacturer** → `brand` (optional)
  - **Available Qty.** → `stock_qty` (optional, cast to int, default 0)
  - **Re-Ordering level** → `low_stock_threshold` (optional, cast to int, default 0)

See **`EXCEL_VARIATIONS_SCHEMA.md`** for full variation + images design.

### Category handling

- If **Category** is present and non-empty, the backend looks up `categories.category_name` (case-insensitive, after `trim()`).
- If no match is found, a new category is created with that name.

### Upsert behavior (important)

- Upserts by `item_id`:
  - `Product::updateOrCreate(['item_id' => (string) $itemId], $data)`
- Import **overwrites existing values**, including setting `category_id` to `null` if the Category cell is blank.

### Response (200)

```json
{
  "import_uuid": "c4d2d5fe-0c0c-4d1e-bcf5-9b3c0ddc6e71",
  "log_saved": true,
  "total_rows": 2411,
  "created_count": 2300,
  "updated_count": 10,
  "skipped_count": 101,
  "errors": [
    {
      "row": 45,
      "item_id": null,
      "reason": "missing_required_fields",
      "message": "Item Id, Item Name, and Retail Price are required.",
      "data": {
        "item_id": null,
        "item_name": "Face Mask",
        "product_group_id": null,
        "variation_type": null,
        "variation_value": null,
        "category": "Medical Supplies",
        "brand": "HealthSafe",
        "stock_qty": "100",
        "low_stock_threshold": "10",
        "retail_price": null
      }
    },
    {
      "row": 102,
      "item_id": "2115296",
      "reason": "exception",
      "message": "...",
      "data": {
        "item_id": "2115296",
        "item_name": "Some Item",
        "product_group_id": "SEVLA",
        "variation_type": "Strength",
        "variation_value": "400mg",
        "category": "Unknown Cat",
        "brand": "ACME",
        "stock_qty": "0",
        "low_stock_threshold": "0",
        "retail_price": "19.99"
      }
    },
    {
      "row": 250,
      "item_id": "2119999",
      "reason": "exception",
      "message": "...",
      "data": {
        "item_id": "2119999",
        "item_name": "Some Item",
        "product_group_id": null,
        "variation_type": null,
        "variation_value": null,
        "category": "Medical Supplies",
        "brand": null,
        "stock_qty": "10",
        "low_stock_threshold": "0",
        "retail_price": "5.00"
      }
    }
  ]
}
```

### Rejection logs (persistence)

When the import finishes, the backend **persists the summary + rejected rows** into the tenant database table:

- `product_import_logs`

This is keyed by `import_uuid` (returned in the response) so you can correlate a UI “Import run” with its saved rejection log.

---

## 6. Product Import Logs (tenant-scoped)

Review saved logs for each product import run (keyed by `import_uuid`).

All endpoints exist in two variants:

- **Store API**: `/product-import-logs/*`
- **Dashboard API**: `/dashboard/product-import-logs/*` (admin/staff only)

### 6.1 List import logs

- **Method**: `GET`
- **Routes**:
  - `/product-import-logs`
  - `/dashboard/product-import-logs`
- **Middleware**:
  - Store: `auth:sanctum`, `tenant.resolve`, `tenant.schema`
  - Dashboard: `auth:sanctum`, `tenant.resolve`, `tenant.schema`, `role:admin,staff`

#### Query parameters

- `per_page` (optional): integer 1..100

#### Success response (200) — paginated

Returns a standard Laravel paginator of import log records **without** the heavy `errors` payload.

### 6.2 Get import log by UUID

- **Method**: `GET`
- **Routes**:
  - `/product-import-logs/{import_uuid}`
  - `/dashboard/product-import-logs/{import_uuid}`

#### Path parameters

- **import_uuid**: UUID string returned by `POST /products/import`

#### Success response (200)

Returns the saved import log **including** `errors` (rejected rows).

---

## 7. Product Images (nested under product)

These routes manage `product_images` rows and (for the upload endpoint) also upload/delete the underlying file in object storage.

All endpoints exist in two variants:

- **Store API**: `/products/{product}/images/*`
- **Dashboard API**: `/dashboard/products/{product}/images/*` (admin/staff only)

### ProductImage model fields

- **id**: integer
- **product_id**: integer
- **object_key**: string
  - Stored key/path in object storage (not a full URL)
- **sort_order**: integer (default 0)
- **is_primary**: boolean (default false)
- **created_at**, **updated_at**: timestamps

### Object key format (upload endpoint)

When using the upload endpoint, the backend generates keys like:

- `tenants/{tenant_id}/products/{item_id}/images/1.png`
- `tenants/{tenant_id}/products/{item_id}/images/2.jpg`

Where:

- `tenant_id` is resolved from tenant middleware
- `item_id` is the product’s `item_id`
- the filename number is `max(sort_order) + 1` for that product

---

### 6.1 List images for a product

- **Method**: `GET`
- **Routes**:
  - `/products/{product}/images`
  - `/dashboard/products/{product}/images`

#### Path parameters

- **product**: integer (product `id`)

#### Success response (200)

Returns a JSON array of image records for that product.

---

### 6.2 Create image record (no file upload)

Use this endpoint if your frontend uploads the file separately and you only want to register the `object_key` and metadata.

- **Method**: `POST`
- **Routes**:
  - `/products/{product}/images`
  - `/dashboard/products/{product}/images`

#### Request body (JSON)

Validation rules:

- **object_key**: required, string
- **sort_order**: optional, integer, min 0
- **is_primary**: optional, boolean

Example:

```json
{
  "object_key": "tenants/1/products/23223232/images/mask-front.jpg",
  "sort_order": 1,
  "is_primary": true
}
```

Behavior:

- If `is_primary=true`, backend sets all other images for the product to `is_primary=false` before creating this record.

#### Success response (201)

Returns the created image record.

---

### 6.3 Upload image file (backend uploads to object storage)

- **Method**: `POST`
- **Routes**:
  - `/products/{product}/images/upload`
  - `/dashboard/products/{product}/images/upload`
- **Content-Type**: `multipart/form-data`

#### Form fields

- **file**: required
  - must be an image file with extension: `jpg`, `jpeg`, `png`, `webp`
  - max size: **10240 KB** (10 MB)
- **is_primary**: optional boolean (`true`/`false`)

Example curl:

```bash
curl -X POST "http://localhost:8000/api/products/123/images/upload" \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json" \
  -F "file=@mask.png" \
  -F "is_primary=true"
```

#### Success response (201)

Returns the created image record (and the file is already uploaded).

Notes:

- Upload uses the `s3` filesystem disk and stores objects with `public` visibility.
- The file extension is derived from the upload and sanitized; default fallback is `jpg`.
- If tenant context is missing for any reason, upload throws an error (`Tenant context is missing.`).
- Local dev note: if you see timeouts to `169.254.169.254` (EC2 instance metadata), you are missing S3 credentials locally.
  - Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, and `AWS_BUCKET` in your `.env`
  - For local dev, also set `AWS_EC2_METADATA_DISABLED=true` to prevent the AWS SDK from attempting EC2 instance-profile lookup.

---

### 6.4 Update image metadata

- **Method**: `PATCH`
- **Routes**:
  - `/products/{product}/images/{image}`
  - `/dashboard/products/{product}/images/{image}`

#### Path parameters

- **product**: integer (product `id`)
- **image**: integer (product image `id`)

#### Request body (JSON)

Validation rules:

- **sort_order**: optional, integer, min 0
- **is_primary**: optional, boolean

Example:

```json
{
  "sort_order": 2,
  "is_primary": false
}
```

Behavior:

- If the `{image}` does not belong to `{product}`, returns:

```json
{ "message": "Image not found for this product." }
```

- If `is_primary=true`, backend clears `is_primary` on all other images for the product.

#### Success response (200)

Returns the updated image record.

---

### 6.5 Delete image (DB + best-effort object delete)

- **Method**: `DELETE`
- **Routes**:
  - `/products/{product}/images/{image}`
  - `/dashboard/products/{product}/images/{image}`

Behavior:

- Deletes the DB row inside a transaction.
- Attempts to delete the underlying object from `s3` using the stored `object_key`.
  - Object deletion is **best-effort**: if delete fails or object is missing, the API still succeeds.

#### Success response (204)

Returns empty body.

---

### 6.6 Automatic Image Pickup (Sync)

The system automatically scans object storage for images that match existing products and registers them in the database.

#### How it works

1. **Triggered on Import**: Whenever a product import (`POST /products/import`) is successfully completed, the system triggers a background sync for that tenant.
2. **Manual Trigger**: Admin can manually trigger a sync via Artisan command:
   ```bash
   php artisan products:sync-images {tenant_id?}
   ```

#### Expected Folder Structure

For the system to pick up images, they must be uploaded to the following path in object storage:

`tenants/{tenant_id}/products/{item_id}/images/{filename}.{ext}`

- **tenant_id**: The numeric ID of the tenant.
- **item_id**: The `item_id` string of the product (e.g., `2118298`).
- **filename**: If numeric (e.g., `1.png`, `2.jpg`), it will be used as the `sort_order`.
- **ext**: Supported extensions are `jpg`, `jpeg`, `png`, `webp`, `gif`.

#### Pickup Behavior

- **No Duplicates**: If a `product_images` record already exists for that specific `object_key`, it is skipped.
- **Automatic Primary**: If a product has no primary image, the first image discovered during sync will be marked as `is_primary=true`.
- **Sorting**: If the filename is a number, it becomes the `sort_order`. Otherwise, it defaults to `max(sort_order) + 1`.

