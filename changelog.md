## Prescription-required products & prescription uploads — backend APIs for frontend

### Product-level flag

- Products now include a boolean `requires_prescription` field derived from the Excel `Narcotic(s)` column in `Data Template.xlsx`.
  - `Narcotic(s)` values of `TRUE`/`true` → `requires_prescription = true`.
  - `FALSE`/`false` or empty → `requires_prescription = false`.
- This field is available on all product JSON payloads (e.g. `/products`, `/products/{id}`) so the frontend can:
  - Mark products as prescription-only in listings/product detail.
  - Enforce prescription upload UX in cart/checkout when such products are present.

### Data model for prescriptions

- New `Prescription` model with table `prescriptions` (tenant-scoped).
- Each row is linked to:
  - `product_id` (the product the prescription is for).
  - `order_id` and `order_item_id` (the specific order + line item).
  - `customer_id` (for logged-in customers) or `guest_phone`/`guest_name` (for guests).
  - `file_key` (object storage key on the `s3` disk).
  - `status` (`pending` | `approved` | `rejected`).
  - `reviewed_by_user_id`, `reviewed_at`, `notes` for dashboard review.

You generally don’t need to touch this directly from the frontend; use the APIs below.

### Object storage layout

- All prescriptions are stored on the `s3` disk using this pattern:

```text
tenants/{tenant_id}/users/{folder_id}/{filename}
```

- `folder_id` strategies:
  - **Authenticated customer**: `customer-{customer_id}-{slug(customer_name)}`
  - **Guest**: `guest-{normalized_phone}` (phone stripped to digits)
- Filenames are timestamp + random suffix, e.g. `20260310T120102-ABCD1234.pdf`.
- Files are **not** made publicly visible; dashboard access uses short-lived signed URLs (see below).

### Customer APIs (authenticated, per order item)

All routes below live under the existing customer group:

- Base prefix: `auth:sanctum`, `tenant.resolve`, `tenant.schema`, `role:customer`.

Endpoints:

- `GET /customer/orders/{order}/items/{item}/prescriptions`
  - **Purpose**: List prescriptions the logged-in customer has uploaded for a specific order item.
  - **Auth**: Customer must own the `order`; `item` must belong to that `order`.
  - **Response**: Paginated list of `Prescription` objects for that `order_item`.

- `POST /customer/orders/{order}/items/{item}/prescriptions`
  - **Purpose**: Upload a new prescription file for a specific order item.
  - **Auth / guards**:
    - The authenticated user must be the owner of the `order`.
    - The `item` must belong to the `order`.
    - The `item`’s product must have `requires_prescription = true`. Otherwise returns `422`.
  - **Request (multipart/form-data)**:
    - `file` (required): `jpg`, `jpeg`, `png`, or `pdf`; max size 8 MB.
    - `notes` (optional): string, max 2000 chars.
  - **Behavior**:
    - File is stored via `PrescriptionStorageService` under the customer’s folder.
    - A `Prescription` row is created with `status = "pending"`.
  - **Response**: `201 Created` + the created `Prescription` JSON.

- `DELETE /customer/orders/{order}/items/{item}/prescriptions/{prescription}`
  - **Purpose**: Allow customers to delete their own pending prescriptions (before review / processing).
  - **Auth / guards**:
    - Same ownership checks as above.
    - `prescription` must belong to that `order`, `order_item`, and `customer`.
    - Only `status = "pending"` can be deleted; otherwise returns `422`.
  - **Response**: `204 No Content` on success.

### Guest APIs (by order number + phone, per order item)

Guest flows are tenant-aware but do not require auth; they use order number + phone for identity:

- Group middlewares: `tenant.resolve`, `tenant.schema`.

Endpoints:

- `GET /orders/{orderNumber}/items/{orderItemId}/prescriptions?phone=...`
  - **Purpose**: List prescriptions uploaded for a specific order item by a guest.
  - **Query**:
    - `phone` (required): must match the order’s `delivery_phone`.
  - **Behavior**:
    - Finds `Order` by `order_number` + `delivery_phone`.
    - Ensures `orderItemId` belongs to that order.
  - **Response**: Paginated list of `Prescription` objects for that `order_item`.

- `POST /orders/{orderNumber}/items/{orderItemId}/prescriptions?phone=...`
  - **Purpose**: Guest upload of a prescription for a specific order item.
  - **Query**:
    - `phone` (required): must match the order’s `delivery_phone`.
  - **Request (multipart/form-data)**:
    - `file` (required): `jpg`, `jpeg`, `png`, or `pdf`; max size 8 MB.
    - `notes` (optional): string, max 2000 chars.
  - **Behavior**:
    - Resolves `Order` by `order_number` + `delivery_phone`.
    - Resolves `OrderItem` by `orderItemId` under that order.
    - Ensures related product has `requires_prescription = true` (422 otherwise).
    - Stores file via `PrescriptionStorageService` under `guest-{normalized_phone}` folder.
    - Creates `Prescription` row with:
      - `guest_phone` (from query),
      - `guest_name` (`order.delivery_name` snapshot),
      - `status = "pending"`.
  - **Response**: `201 Created` + created `Prescription` JSON.

### Dashboard APIs (admin/staff)

All routes under:

- Prefix: `/dashboard`
- Middlewares: `auth:sanctum`, `tenant.resolve`, `tenant.schema`, `role:admin,staff`.

Endpoints:

- `GET /dashboard/prescriptions`
  - **Purpose**: List/filter prescriptions for review.
  - **Query filters** (all optional):
    - `status`: `pending` | `approved` | `rejected`.
    - `product_id`
    - `order_id`
    - `customer_id`
    - `guest_phone`
    - `per_page` (default 15).
  - **Response**: Paginated list with related product/order/orderItem/customer/reviewer eagerly loaded.

- `GET /dashboard/prescriptions/{prescription}`
  - **Purpose**: Fetch a single prescription with full details.
  - **Response**: `Prescription` JSON with relations:
    - `product`, `order`, `orderItem`, `customer`, `reviewer`.

- `PATCH /dashboard/prescriptions/{prescription}`
  - **Purpose**: Approve or reject a prescription (or mark as pending).
  - **Request JSON**:
    - `status` (required): `pending` | `approved` | `rejected`.
    - `notes` (optional): string, max 2000 chars.
  - **Behavior**:
    - Updates `status` and `notes`.
    - Sets `reviewed_by_user_id` to the current dashboard user.
    - Sets `reviewed_at` to `now()`.
  - **Response**: Updated `Prescription` JSON with relations.

- `DELETE /dashboard/prescriptions/{prescription}`
  - **Purpose**: Hard-delete a prescription (cleanup/administrative).
  - **Response**: `204 No Content`.

- `GET /dashboard/prescriptions/{prescription}/file`
  - **Purpose**: Get a short-lived URL to view/download the prescription file.
  - **Behavior**:
    - Uses `Storage::disk('s3')->temporaryUrl(file_key, now()->addMinutes(10))`.
  - **Response**:
    - `200 OK` with `{ "url": "<signed-url>" }` for direct use in dashboard UI (e.g. open in new tab).

### Frontend integration notes

- **When to prompt for upload**:
  - During checkout or in order detail/confirmation/tracking views, inspect each order item’s `product.requires_prescription`.
  - If `true`, render “Upload prescription” UI and call the appropriate endpoint:
    - Logged-in customers: `POST /customer/orders/{order}/items/{item}/prescriptions`.
    - Guests: `POST /orders/{orderNumber}/items/{orderItemId}/prescriptions?phone=...`.
- **Handling status**:
  - Use the list endpoints to show whether a prescription is:
    - Pending review, approved, or rejected (and show `notes` when present).
  - For guests, ensure the phone used in the query matches the one they used when ordering.
- **Security**:
  - Only dashboard routes can fetch file URLs; customer and guest flows never receive direct file links by design. If you want user-visible previews later, we can add dedicated read endpoints with appropriate ACLs.