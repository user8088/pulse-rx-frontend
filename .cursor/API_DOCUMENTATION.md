# Pulse RX API Documentation

This document tracks the available API endpoints, their expected request bodies, and sample responses.

## Base Configuration

- **Base URL**: `http://your-domain.com/api`
- **Backend (local dev)**: `https://pulse-rx-backend-dev-aiqyjn.laravel.cloud`
- **API Base URL (local dev)**: `https://pulse-rx-backend-dev-aiqyjn.laravel.cloud/api`
- **Authentication**: Bearer Token (Laravel Sanctum)
- **Multi-Tenancy**: Automatically resolved from the authenticated user.

---

## 1. Authentication

### Login
Authenticates a user and returns a Bearer Token.

- **Method**: `POST`
- **URL**: `/login`
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```
- **Response** (200 OK):
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

### Dashboard Login (Admin/Staff)
Authenticates a dashboard user (role must be `admin` or `staff`) and returns a Bearer Token.

- **Method**: `POST`
- **URL**: `/dashboard/login`
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```
- **Response** (200 OK):
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
- **Response** (403 Forbidden):
  ```json
  { "message": "Forbidden" }
  ```

### Get Current User
Returns the authenticated user and their tenant.

- **Method**: `GET`
- **URL**: `/auth/me`
- **Auth**: Bearer Token required
- **Response** (200 OK):
  ```json
  {
    "user": { "id": 1, "email": "admin@example.com", "role": "admin", "tenant_id": 1 },
    "tenant": { "id": 1, "name": "Default Store", "slug": "default", "schema_name": "tenant_default_..." }
  }
  ```

### Logout
Revokes the current access token.

- **Method**: `POST`
- **URL**: `/auth/logout`
- **Auth**: Bearer Token required
- **Response** (200 OK):
  ```json
  { "message": "Logged out" }
  ```

### Change Password

- **Method**: `POST`
- **URL**: `/auth/change-password`
- **Auth**: Bearer Token required
- **Request Body**:
  ```json
  {
    "current_password": "old_password",
    "new_password": "new_password_123",
    "new_password_confirmation": "new_password_123"
  }
  ```
- **Response** (200 OK):
  ```json
  { "message": "Password updated" }
  ```

### Dashboard API Base
All dashboard CRUD endpoints are available under:
- **Prefix**: `/dashboard/*`
- **Middleware**: `auth:sanctum`, `tenant.resolve`, `tenant.schema`, `role:admin,staff`

---

## 2. Categories

All endpoints require authentication and a valid tenant context.

### List Categories
- **Method**: `GET`
- **URL**: `/categories`
- **Response** (200 OK - Paginated):
  ```json
  {
    "data": [
      {
        "id": 1,
        "category_name": "Medical Supplies",
        "alias": "MED",
        "serial_id": "MED337027",
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "total": 1,
    "per_page": 15,
    "current_page": 1,
    ...
  }
  ```

### Create Category
- **Method**: `POST`
- **URL**: `/categories`
- **Request Body**:
  ```json
  {
    "category_name": "Medical Supplies"
  }
  ```
- **Response** (201 Created):
  *Note: alias and serial_id are auto-generated.*

### Update Category
- **Method**: `PUT/PATCH`
- **URL**: `/categories/{id}`
- **Request Body**:
  ```json
  {
    "category_name": "Pharma"
  }
  ```

### Delete Category
- **Method**: `DELETE`
- **URL**: `/categories/{id}`
- **Response**: 204 No Content

---

## 3. Products

### List Products
- **Method**: `GET`
- **URL**: `/products`
- **Response** (200 OK - Paginated):
  ```json
  {
    "data": [
      {
        "id": 1,
        "item_id": "23223232",
        "item_name": "Face Mask",
        "brand": "HealthSafe",
        "stock_qty": 50,
        "low_stock_threshold": 10,
        "in_stock": true,
        "category": { "id": 1, "category_name": "..." },
        "images": []
      }
    ]
  }
  ```

### Create Product
- **Method**: `POST`
- **URL**: `/products`
- **Request Body**:
  ```json
  {
    "item_id": "23223232",
    "item_name": "Face Mask",
    "category_id": 1,
    "brand": "HealthSafe",
    "stock_qty": 100,
    "low_stock_threshold": 10
  }
  ```

### Update Product
- **Method**: `PUT/PATCH`
- **URL**: `/products/{id}`

### Delete Product
- **Method**: `DELETE`
- **URL**: `/products/{id}`

---

## 4. Product Import

### Import Products from Excel
Imports products from an `.xlsx` file. Missing `Item Id` or `Item Name` rows are skipped. `item_id` duplicates are updated.

- **Method**: `POST`
- **URL**: `/products/import`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: (file) required, `.xlsx` or `.xls`

#### Expected Excel Columns
The import specifically looks for these headers (case-insensitive):
- **Item Id**: (Required) Unique identifier for upsert.
- **Item Name**: (Required) Product name.
- **Category**: (Optional) Must match an existing category name in the system.
- **Manufacturer**: (Optional) Mapped to `brand`.
- **Available Qty.**: (Optional) Mapped to `stock_qty`.
- **Re-Ordering level**: (Optional) Mapped to `low_stock_threshold`.

- **Response** (200 OK):
  ```json
  {
    "total_rows": 2411,
    "created_count": 2300,
    "updated_count": 10,
    "skipped_count": 101,
    "errors": [
      {
        "row": 45,
        "item_id": null,
        "reason": "missing_item_id",
        "message": "Item Id is required."
      },
      {
        "row": 102,
        "item_id": "2115296",
        "reason": "unknown_category",
        "message": "Category 'Unknown Cat' not found in system."
      }
    ]
  }
  ```

---

## 5. Product Images (Nested)

### List Images for Product
- **Method**: `GET`
- **URL**: `/products/{product_id}/images`

### Upload Image for Product (Backend uploads to Object Storage)
Uploads an image file to the (public) object storage bucket and creates a `product_images` record.

- **Method**: `POST`
- **URL**: `/products/{product_id}/images/upload`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: (file) required, one of `jpg`, `jpeg`, `png`, `webp` (max 10MB)
  - `is_primary`: (boolean) optional

#### Object key format (what backend stores in DB)
The backend stores only `object_key` like:

- `tenants/{tenant_id}/products/{item_id}/images/1.png`
- `tenants/{tenant_id}/products/{item_id}/images/2.jpg`

File numbering is automatically assigned based on the next `sort_order` (1, 2, 3, ...).

- **Response** (201 Created):
  ```json
  {
    "id": 1,
    "product_id": 123,
    "object_key": "tenants/2/products/2118298/images/1.png",
    "sort_order": 1,
    "is_primary": true,
    "created_at": "...",
    "updated_at": "..."
  }
  ```

### Add Image to Product
- **Method**: `POST`
- **URL**: `/products/{product_id}/images`
- **Request Body**:
  ```json
  {
    "object_key": "tenants/1/products/23223232/images/mask-front.jpg",
    "sort_order": 0,
    "is_primary": true
  }
  ```

### Update Image
- **Method**: `PATCH`
- **URL**: `/products/{product_id}/images/{image_id}`
- **Request Body**:
  ```json
  {
    "sort_order": 1,
    "is_primary": false
  }
  ```

### Delete Image
- **Method**: `DELETE`
- **URL**: `/products/{product_id}/images/{image_id}`

---

## 6. Customers

### List Customers
- **Method**: `GET`
- **URL**: `/customers`

### Create Customer
- **Method**: `POST`
- **URL**: `/customers`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
  ```

### Update Customer
- **Method**: `PUT/PATCH`
- **URL**: `/customers/{id}`

### Delete Customer
- **Method**: `DELETE`
- **URL**: `/customers/{id}`
