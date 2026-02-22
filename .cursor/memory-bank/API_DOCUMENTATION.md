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
  - Resource routes use **Laravel route-model binding**: `{category}`, `{product}`, `{customer}`, `{image}`, `{subcategory}` are **numeric DB IDs**, not `item_id`.
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
  - **`tenant.resolve`**: resolves the tenant from the authenticated user's `tenant_id` and binds it into the container as `tenant`.
  - **`tenant.schema`**: sets PostgreSQL `search_path` to `"{tenant_schema}, public"` so tenant tables are isolated per schema.
  - If the user is missing a tenant or the tenant is inactive, the middleware layer can return errors (commonly **401/403/404**).

- **Dashboard-only authorization**
  - Dashboard CRUD endpoints are under the **`/dashboard`** prefix and require:
    - `auth:sanctum`, `tenant.resolve`, `tenant.schema`, and `role:admin,staff`
  - Dashboard login (`/dashboard/login`) does **not** use `role` middleware, but the controller enforces it and returns **403** if role is not `admin` or `staff`.

### Standard error responses

Laravel's default validation errors:

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
- **Subcategories** (nested): `/categories/{category}/subcategories`
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
- **tenant**: the user's tenant (serialized), or `null` if none

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

Relationships:

- **products**: `hasMany(Product)`
- **subcategories**: `hasMany(Subcategory)`

---

### 2.1 List categories

- **Method**: `GET`
- **Routes**:
  - `/categories`
  - `/dashboard/categories`
- **Middleware**:
  - Store: `tenant.resolve`, `tenant.schema`
  - Dashboard: `auth:sanctum`, `tenant.resolve`, `tenant.schema`, `role:admin,staff`

#### Query parameters

- `page` (optional): page number

#### Success response (200) -- paginated

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

**Important**: Products referencing this category will have `category_id` set to `null` (category is `nullOnDelete`). Subcategories under this category are cascade-deleted.

---

## 2b. Subcategories (nested under category, tenant-scoped)

All subcategory endpoints exist in two variants:

- **Store API**: `/categories/{category}/subcategories/*`
- **Dashboard API**: `/dashboard/categories/{category}/subcategories/*` (admin/staff only)

### Subcategory model fields

- **id**: integer
- **category_id**: integer (FK to categories)
- **subcategory_name**: string
- **created_at**, **updated_at**: timestamps

Relationships:

- **category**: `belongsTo(Category)`
- **products**: `belongsToMany(Product)` via `product_subcategory` pivot

---

### 2b.1 List subcategories for a category

- **Method**: `GET`
- **Routes**:
  - `/categories/{category}/subcategories`
  - `/dashboard/categories/{category}/subcategories`

#### Path parameters

- **category**: integer (category `id`)

#### Success response (200) -- paginated

Returns a standard Laravel paginator of subcategory records for the given category.

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "category_id": 5,
      "subcategory_name": "Tablets",
      "created_at": "2026-02-17T10:00:00.000000Z",
      "updated_at": "2026-02-17T10:00:00.000000Z"
    },
    {
      "id": 2,
      "category_id": 5,
      "subcategory_name": "Syrups",
      "created_at": "2026-02-17T10:00:00.000000Z",
      "updated_at": "2026-02-17T10:00:00.000000Z"
    }
  ],
  "per_page": 15,
  "total": 2
}
```

---

### 2b.2 Create subcategory

- **Method**: `POST`
- **Routes**:
  - `/categories/{category}/subcategories`
  - `/dashboard/categories/{category}/subcategories`

#### Request body (JSON)

Validation rules:

- **subcategory_name**: required, string, max 255

```json
{
  "subcategory_name": "Tablets"
}
```

#### Success response (201)

```json
{
  "id": 3,
  "category_id": 5,
  "subcategory_name": "Tablets",
  "created_at": "2026-02-17T10:00:00.000000Z",
  "updated_at": "2026-02-17T10:00:00.000000Z"
}
```

---

### 2b.3 Get subcategory by ID

- **Method**: `GET`
- **Routes**:
  - `/categories/{category}/subcategories/{subcategory}`
  - `/dashboard/categories/{category}/subcategories/{subcategory}`

#### Path parameters

- **category**: integer (category `id`)
- **subcategory**: integer (subcategory `id`)

If the subcategory does not belong to the given category, returns **404**.

---

### 2b.4 Update subcategory

- **Method**: `PATCH`
- **Routes**:
  - `/categories/{category}/subcategories/{subcategory}`
  - `/dashboard/categories/{category}/subcategories/{subcategory}`

#### Request body (JSON)

- **subcategory_name**: optional, string, max 255

#### Success response (200)

Returns the updated subcategory record.

---

### 2b.5 Delete subcategory

- **Method**: `DELETE`
- **Routes**:
  - `/categories/{category}/subcategories/{subcategory}`
  - `/dashboard/categories/{category}/subcategories/{subcategory}`

#### Success response (204)

Returns empty body. Pivot rows in `product_subcategory` are cascade-deleted.

---

## 3. Products (tenant-scoped)

All product endpoints exist in two variants:

- **Store API**: `/products/*`
- **Dashboard API**: `/dashboard/products/*` (admin/staff only)

### Product model fields

| Field | Type | Description |
|-------|------|-------------|
| **id** | integer | Primary key |
| **item_id** | string | Unique SKU (e.g. from Excel) |
| **product_group_id** | string \| null | Variation group (e.g. `SEVLA`). Same across all variants. |
| **variation_type** | string \| null | What varies: `Strength`, `Size`, `Volume`, etc. |
| **variation_value** | string \| null | Specific value: `400mg`, `1L`, `50ml`, etc. |
| **item_name** | string | Display name |
| **generic_name** | string \| null | Generic / pharmaceutical name |
| **is_narcotic** | boolean | Whether the product is a narcotic (default false) |
| **category_id** | integer \| null | FK to categories |
| **brand** | string \| null | Manufacturer / brand |
| **retail_price_unit** | string | Supplier/cost reference price as decimal string (e.g. `"49.00"`). Internal only, not customer-facing. |
| **retail_price_item** | string | Price per single item (e.g. `"100.00"`). Customer-facing when `can_sell_item` is true. |
| **retail_price_secondary** | string | Price per secondary unit as decimal string (e.g. `"325.00"`). Customer-facing when `can_sell_secondary` is true. |
| **retail_price_box** | string | Price per box as decimal string (e.g. `"1990.04"`). Customer-facing when `can_sell_box` is true. |
| **pack_qty** | integer \| null | How many secondary units in a box (informational) |
| **strip_qty** | integer \| null | How many items in one secondary unit (informational) |
| **availability** | string | `yes`, `no`, or `short` (default `yes`) |
| **cold_chain_needed** | boolean | Whether cold storage is required (default false) |
| **item_discount** | string | Discount amount as decimal string (e.g. `"5.00"`, default `"0.00"`) |
| **can_sell_secondary** | boolean | Whether the product can be sold per secondary unit (default false) |
| **can_sell_box** | boolean | Whether the product can be sold per box (default false) |
| **can_sell_item** | boolean | Whether the product can be sold per individual item (default false) |
| **secondary_unit_label** | string | Admin-defined label for the secondary tier (e.g. `"Pack"`, `"Strip"`, `"Sachet"`; default `"Pack"`) |
| **box_unit_label** | string | Admin-defined label for the top/box tier (e.g. `"Box"`, `"Pack"`, `"Carton"`; default `"Box"`) |
| **base_unit_label** | string \| null | Label for the base unit (e.g. `"Tablet"`, `"Capsule"`, `"Bottle"`). Defaults to `"Unit"` in display when null. |
| **created_at** | string | ISO 8601 |
| **updated_at** | string | ISO 8601 |
| **category** | object \| null | Eager-loaded when included |
| **subcategories** | array | Eager-loaded when included (list, show, create, update) |
| **images** | array | Eager-loaded when included (list, show) |
| **packaging_display** | object | Computed. Contains `base_unit` (string) and `options` (array of sellable tiers for the "Select Pack Size" UI). See below. |

**Removed fields** (no longer present): `stock_qty`, `low_stock_threshold`, `in_stock`, `retail_price`, `retail_price_strip`, `can_sell_unit`, `can_sell_strip`.

**Variations:** Use `product_group_id` to group variants (e.g. Sevla 400mg / 800mg). Filter with `?product_group_id=SEVLA` to fetch all variants. Each variant has its own `item_id`, prices, and images.

#### packaging_display (computed, appended)

Every product response includes a computed `packaging_display` object. It contains only the **sellable** tiers so the frontend can render a "Select Pack Size" UI directly.

```json
{
  "packaging_display": {
    "base_unit": "Tablet",
    "options": [
      {
        "tier": "box",
        "label": "Pack",
        "description": "1 Pack = 10 Strips",
        "price": "135.00"
      },
      {
        "tier": "secondary",
        "label": "Strip",
        "description": "1 Strip = 10 Tablets",
        "price": "13.50"
      },
      {
        "tier": "item",
        "label": "Tablet",
        "description": "1 Tablet",
        "price": "1.35"
      }
    ]
  }
}
```

- `base_unit`: human label for the smallest unit (from `base_unit_label`, defaults to `"Unit"`).
- `options[]`: only tiers where the corresponding `can_sell_*` flag is `true`.
  - `tier`: `"box"`, `"secondary"`, or `"item"` (used as identifier for cart/order).
  - `label`: display name of the tier (from `box_unit_label` or `secondary_unit_label`).
  - `description`: formatted string like `"1 Pack = 10 Strips"`. Uses `pack_qty`/`strip_qty`. If qty is null, shows just `"1 Pack"`.
  - `price`: retail price as decimal string.

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
  - If `q` is present: filters server-side using a case-insensitive "contains" match across:
    - `products.item_id`
    - `products.item_name`
    - `products.generic_name`
    - `products.brand`
    - `categories.category_name` (via `whereHas`)

#### Success response (200) -- paginated

Paginator with `data` = array of products. Each product includes eager-loaded `category`, `subcategories`, and `images`.

Example:

- `GET /products?page=1&per_page=15&q=mask`
- `GET /products?product_group_id=SEVLA` -- all variants in that group
- `GET /dashboard/products?page=2&q=ibuprofen`

Response shape (paginator):

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 101,
      "item_id": "2112486",
      "product_group_id": null,
      "variation_type": null,
      "variation_value": null,
      "item_name": "Uv-Lite Spf-60 Sunblock Medium Tinted Cream",
      "generic_name": "cosmetics 0",
      "is_narcotic": false,
      "category_id": 5,
      "brand": "CRYSTOLITE PHARMACEUTICALS",
      "retail_price_unit": "220.00",
      "retail_price_secondary": "0.00",
      "retail_price_box": "0.00",
      "pack_qty": null,
      "strip_qty": null,
      "availability": "yes",
      "cold_chain_needed": false,
      "item_discount": "0.00",
      "can_sell_secondary": false,
      "can_sell_box": false,
      "secondary_unit_label": "Pack",
      "box_unit_label": "Box",
      "base_unit_label": null,
      "created_at": "2026-01-19T12:00:00.000000Z",
      "updated_at": "2026-01-19T12:00:00.000000Z",
      "packaging_display": {
        "base_unit": "Unit",
        "options": []
      },
      "category": {
        "id": 5,
        "category_name": "Consumer",
        "alias": "CON",
        "serial_id": "CON001",
        "created_at": "2026-01-19T11:00:00.000000Z",
        "updated_at": "2026-01-19T11:00:00.000000Z"
      },
      "subcategories": [
        {
          "id": 1,
          "category_id": 5,
          "subcategory_name": "Skincare",
          "created_at": "2026-02-17T10:00:00.000000Z",
          "updated_at": "2026-02-17T10:00:00.000000Z"
        }
      ],
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
  "to": 1,
  "total": 1
}
```

#### Frontend usage (required change)

- Use `q` to search server-side instead of fetching all pages and filtering client-side.
- Use `product_group_id` to load all variants of a product (e.g. for a product detail page with size/strength options).
- Reset to `page=1` whenever `q` or `product_group_id` changes.
- Debounce typing (recommended ~250-400ms) and cancel in-flight requests when the user keeps typing.

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
- **generic_name**: nullable, string, max 255
- **is_narcotic**: optional, boolean
- **product_group_id**: optional, string, max 64 (variation group)
- **variation_type**: optional, string, max 64
- **variation_value**: optional, string, max 128
- **category_id**: nullable, must exist in `categories.id` if provided
- **brand**: nullable, string, max 255
- **retail_price_unit**: optional, numeric, min 0 (internal/supplier price, defaults to 0 if omitted)
- **retail_price_item**: optional, numeric, min 0 (must be > 0 when `can_sell_item` is true; defaults to 0)
- **retail_price_secondary**: optional, numeric, min 0 (must be > 0 when `can_sell_secondary` is true; defaults to 0)
- **retail_price_box**: optional, numeric, min 0 (must be > 0 when `can_sell_box` is true; defaults to 0)
- **pack_qty**: nullable, integer, min 0
- **strip_qty**: nullable, integer, min 0
- **availability**: optional, string, one of `yes`, `no`, `short` (defaults to `yes`)
- **cold_chain_needed**: optional, boolean (defaults to false)
- **item_discount**: optional, numeric, min 0 (defaults to 0)
- **can_sell_secondary**: optional, boolean (defaults to false)
- **can_sell_box**: optional, boolean (defaults to false)
- **can_sell_item**: optional, boolean (defaults to false)
- **secondary_unit_label**: optional, string, max 50 (defaults to `"Pack"`)
- **box_unit_label**: optional, string, max 50 (defaults to `"Box"`)
- **base_unit_label**: nullable, string, max 50 (e.g. `"Tablet"`, `"Capsule"`)
- **subcategory_ids**: optional, array of subcategory IDs (each must exist in `subcategories.id`)

Example:

```json
{
  "item_id": "2117061",
  "item_name": "Cetaqua-V Cleanser 236ml",
  "generic_name": "consumer",
  "is_narcotic": false,
  "category_id": 1,
  "brand": "A- Crystolite",
  "retail_price_unit": 650.00,
  "retail_price_secondary": 50.00,
  "retail_price_box": 550.00,
  "can_sell_secondary": true,
  "can_sell_box": true,
  "secondary_unit_label": "Strip",
  "availability": "yes",
  "cold_chain_needed": false,
  "item_discount": 5,
  "subcategory_ids": [1, 3]
}
```

#### Success response (201)

Returns the created product with `category` and `subcategories` loaded (no `images`).

---

### 3.3 Get product by ID

- **Method**: `GET`
- **Routes**:
  - `/products/{product}`
  - `/dashboard/products/{product}`

#### Path parameters

- **product**: integer (product `id`)

#### Success response (200)

Returns the product with `category`, `subcategories`, and `images` loaded.

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
- **generic_name**: nullable, string, max 255
- **is_narcotic**: optional, boolean
- **product_group_id**: optional, nullable, string, max 64
- **variation_type**: optional, nullable, string, max 64
- **variation_value**: optional, nullable, string, max 128
- **category_id**: optional; if provided may be null; if non-null must exist in `categories.id`
- **brand**: optional; may be null; if non-null must be string, max 255
- **retail_price_unit**: optional, numeric, min 0 (internal/supplier price)
- **retail_price_item**: optional, numeric, min 0 (must be > 0 when `can_sell_item` is true)
- **retail_price_secondary**: optional, numeric, min 0 (must be > 0 when `can_sell_secondary` is true)
- **retail_price_box**: optional, numeric, min 0 (must be > 0 when `can_sell_box` is true)
- **pack_qty**: nullable, integer, min 0
- **strip_qty**: nullable, integer, min 0
- **availability**: optional, string, one of `yes`, `no`, `short`
- **cold_chain_needed**: optional, boolean
- **item_discount**: optional, numeric, min 0
- **can_sell_secondary**: optional, boolean
- **can_sell_box**: optional, boolean
- **can_sell_item**: optional, boolean
- **secondary_unit_label**: optional, string, max 50
- **box_unit_label**: optional, string, max 50
- **base_unit_label**: nullable, string, max 50
- **subcategory_ids**: optional, array of subcategory IDs (replaces current subcategories via sync)

Example:

```json
{
  "availability": "short",
  "retail_price_unit": 24.50,
  "subcategory_ids": [2]
}
```

#### Success response (200)

Returns the updated product with `category` and `subcategories` loaded (no `images`).

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

#### Success response (200) -- paginated

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
  -F "file=@Data Template.xlsx"
```

### Excel parsing behavior (exact)

- Reads the **active worksheet** (first/active sheet).
- Uses the **first row as headers** and maps them case-insensitively after `trim()` + `lowercase`.
- Only these headers are recognized:

| Excel Header | Maps to | Required |
|---|---|---|
| **Item Id** | `item_id` | Yes |
| **Item Name** | `item_name` | Yes |
| **Generic Name** | `generic_name` | No |
| **Narcotics(s)** | `is_narcotic` (TRUE/FALSE -> boolean) | No |
| **Category** | category name lookup (creates if missing) | No |
| **Sub Category** | subcategory 1 lookup (creates under category) | No |
| **Sub Category II** | subcategory 2 lookup (creates under category) | No |
| **Manufacturer** | `brand` | No |
| **Retail Price (Unit)** | `retail_price_unit` | No |
| **Retail Price (Item)** | `retail_price_item` | No |
| **Retail Price (Strip)** | `retail_price_secondary` | No |
| **Retail Price (Box)** | `retail_price_box` | No |
| **Pack Qty.** | `pack_qty` (cast to int) | No |
| **Strip Qty.** | `strip_qty` (cast to int) | No |
| **Availability** | `availability` (YES/NO/SHORT -> lowercase, default `yes`) | No |
| **Cold Chain Needed** | `cold_chain_needed` (YES/NO -> boolean) | No |
| **Item Discount** | `item_discount` (cast to decimal) | No |
| **Product Group Id** | `product_group_id` (legacy/future) | No |
| **Variation Type** | `variation_type` (legacy/future) | No |
| **Variation Value** | `variation_value` (legacy/future) | No |
| **Box Unit Label** | `box_unit_label` (e.g. "Pack", "Box") | No |
| **Base Unit Label** | `base_unit_label` (e.g. "Tablet", "Capsule") | No |

### Category handling

- If **Category** is present and non-empty, the backend looks up `categories.category_name` (case-insensitive, after `trim()`).
- If no match is found, a new category is created with that name.

### Subcategory handling

- If **Sub Category** or **Sub Category II** is present and non-empty, and a category was resolved, the backend looks up or creates a `Subcategory` under that category.
- After upserting the product, the resolved subcategory IDs are synced to the `product_subcategory` pivot table.
- If no category is resolved, subcategories are skipped.

### Smart auto-marking (sellable tiers)

The import **automatically sets** `can_sell_item`, `can_sell_secondary`, and `can_sell_box` based on which price columns have values > 0:

- If **Retail Price (Item)** has a value > 0 → `can_sell_item` = true
- If **Retail Price (Strip)** has a value > 0 → `can_sell_secondary` = true
- If **Retail Price (Box)** has a value > 0 → `can_sell_box` = true

Products with only `Retail Price (Item)` populated are sold per individual item. Products with Strip and/or Box prices get the corresponding flags enabled.

### Upsert behavior (important)

- Upserts by `item_id`:
  - `Product::updateOrCreate(['item_id' => (string) $itemId], $data)`
- Import **overwrites existing values**, including setting `category_id` to `null` if the Category cell is blank.
- Subcategories are **synced** (replaces previous associations for that product).

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
      "message": "Item Id and Item Name are required.",
      "data": {
        "item_id": null,
        "item_name": "Face Mask",
        "generic_name": null,
        "is_narcotic": "FALSE",
        "product_group_id": null,
        "variation_type": null,
        "variation_value": null,
        "category": "Medical Supplies",
        "sub_category_1": null,
        "sub_category_2": null,
        "brand": "HealthSafe",
        "retail_price_unit": "100",
        "retail_price_secondary": null,
        "retail_price_box": null,
        "pack_qty": null,
        "strip_qty": null,
        "availability": "YES",
        "cold_chain_needed": "NO",
        "item_discount": "0"
      }
    }
  ]
}
```

### Rejection logs (persistence)

When the import finishes, the backend **persists the summary + rejected rows** into the tenant database table:

- `product_import_logs`

This is keyed by `import_uuid` (returned in the response) so you can correlate a UI "Import run" with its saved rejection log.

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

#### Success response (200) -- paginated

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
- `item_id` is the product's `item_id`
- the filename number is `max(sort_order) + 1` for that product

---

### 7.1 List images for a product

- **Method**: `GET`
- **Routes**:
  - `/products/{product}/images`
  - `/dashboard/products/{product}/images`

#### Path parameters

- **product**: integer (product `id`)

#### Success response (200)

Returns a JSON array of image records for that product.

---

### 7.2 Create image record (no file upload)

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

### 7.3 Upload image file (backend uploads to object storage)

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

### 7.4 Update image metadata

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

### 7.5 Delete image (DB + best-effort object delete)

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

### 7.6 Automatic Image Pickup (Sync)

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
