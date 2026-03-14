# Customer Management Feature – Frontend Flow and API Reference

Use this document as context for building the dashboard UI screens and integrating with the backend APIs for the Customer Management feature.

---

## Overview

The Customer Management feature allows admins to:

1. **Import customers** from the "User Data" sheet of Data Template.xlsx (or any xlsx with that sheet).
2. **Edit and delete** customer details (existing CRUD).
3. **View order history** and **prescriptions per order** for each customer.
4. **Manage medical profiles** per customer: create profiles (e.g. "Diabetes", "Blood pressure"), add products to each profile (from the customer’s orders or from the product catalog), and attach prescriptions (from orders or upload).
5. **Set a customer discount** (percentage applied to all products for that customer).

All dashboard endpoints require: `Authorization: Bearer <token>`, and the user must have role `admin` or `staff`. The tenant is resolved from the authenticated user.

---

## Screens to Build

### 1. Customer list (dashboard)

- Table of customers with search/filter (e.g. by name, phone, email).
- Actions: "Import customers" (navigate to import screen), "View" / "Edit" (navigate to customer detail).
- Pagination (use `per_page` and `page` from API).

### 2. Customer import

- Upload area for Excel file (xlsx/xls). Use the same **Data Template.xlsx** file that has the "User Data" sheet (and optionally "Item List" for products).
- On success: show summary (total_rows, created_count, updated_count, skipped_count) and a link to view the import log (errors) by `import_uuid`.
- On error: show validation or server error message.

### 3. Customer detail

- Tabs or sections:
  - **Info**: Edit customer (name, email, phone, external_id, gender, address, city, coordinates, discount_percentage), Delete customer.
  - **Discount**: Display and edit `discount_percentage` (same as Info; can be a dedicated card).
  - **Order history**: List of orders for this customer (with status, date); click an order to open order detail (see below).
  - **Medical profiles**: List of profiles; "Add profile"; per profile: name, list of products (with quantity), list of prescriptions (view/delete, upload, "Add from order").

### 4. Order history (per customer)

- List: GET customer’s orders (paginated). Show order number, status, date, total.
- Order detail: When user clicks an order, call GET single order; show line items and **prescriptions per line item** (so admin can later "Add to profile" from here). Each item may have an `prescriptions` array.

### 5. Medical profiles section (within customer detail)

- **Profiles** are admin-created (e.g. "Diabetes", "Blood pressure") to track what the customer needs or typically buys.
- **Per profile**:
  - **Products**: List products with quantity. Actions: "Add from catalog" (search products, pick product + quantity), "Add from order" (pick one of the customer’s orders and optionally select which line items to add; then call from-order API).
  - **Prescriptions**: List attached prescriptions (view/download via file URL, delete). Actions: "Upload" (file picker), "Add from order" (pick a prescription that the customer uploaded on an order; then call from-order API).

---

## API Reference (Base URL: `/api`)

All dashboard routes are under `/api/dashboard`. Send `Accept: application/json` and `Content-Type: application/json` (except for file uploads).

### Customers (existing CRUD)

- **GET** `/api/dashboard/customers`  
  List customers (paginated). Query: `page`, `per_page`.
- **POST** `/api/dashboard/customers`  
  Create customer. Body: `name` (required), `email`, `phone`, `external_id`, `gender`, `address`, `city`, `latitude`, `longitude`, `discount_percentage`.
- **GET** `/api/dashboard/customers/{customer}`  
  Get one customer. Path: `customer` = customer ID.
- **PUT/PATCH** `/api/dashboard/customers/{customer}`  
  Update customer. Same body as create (all optional except as required by validation).
- **DELETE** `/api/dashboard/customers/{customer}`  
  Delete customer. Returns 204.

### Customer import

- **POST** `/api/dashboard/customers/import`  
  **Content-Type:** `multipart/form-data`.  
  **Body:** `file` = Excel file (xlsx or xls).  
  **Response (200):**  
  `{ "import_uuid": "...", "log_saved": true, "total_rows": N, "created_count": N, "updated_count": N, "skipped_count": N, "errors": [ { "row": 2, "reason": "...", "message": "...", "data": { ... } }, ... ] }`  
  Use `import_uuid` to fetch the full log (including errors) from the import-logs endpoint.

- **GET** `/api/dashboard/customers/import-logs`  
  List import logs (paginated). Query: `per_page` (optional, 1–100).
- **GET** `/api/dashboard/customers/import-logs/{import_uuid}`  
  Get one import log by UUID (includes full `errors` array).

### Customer orders

- **GET** `/api/dashboard/customers/{customer}/orders`  
  List orders for this customer (paginated). Query: `page`, `per_page`, `status`, `from_date`, `to_date`.  
  Response: standard Laravel paginator; each order includes `items` and `customer`. Optionally items include `prescriptions` (confirm with backend).

- **GET** `/api/dashboard/orders/{order}`  
  Get one order (order ID is global in tenant). Response includes `items` and each item has `prescriptions` array. Use this when user clicks an order from the customer’s order list.

### Medical profiles

- **GET** `/api/dashboard/customers/{customer}/profiles`  
  List profiles. Query: `with_products`, `with_prescriptions` (boolean) to include nested data.
- **POST** `/api/dashboard/customers/{customer}/profiles`  
  Create profile. Body: `name` (required), `sort_order` (optional).
- **GET** `/api/dashboard/customers/{customer}/profiles/{profile}`  
  Get one profile with products and prescriptions loaded.
- **PATCH** `/api/dashboard/customers/{customer}/profiles/{profile}`  
  Update profile. Body: `name`, `sort_order`.
- **DELETE** `/api/dashboard/customers/{customer}/profiles/{profile}`  
  Delete profile (cascades to profile products and prescriptions). Returns 204.

### Profile products

- **GET** `/api/dashboard/customers/{customer}/profiles/{profile}/products`  
  List products on the profile (each item includes `product` and `quantity`).
- **POST** `/api/dashboard/customers/{customer}/profiles/{profile}/products`  
  Add product from catalog (or update quantity). Body: `product_id` (required), `quantity` (optional, default 1).
- **POST** `/api/dashboard/customers/{customer}/profiles/{profile}/products/from-order`  
  Add products from a customer order. Body: `order_id` (required), `order_item_ids` (optional array of order_item IDs). If `order_item_ids` is omitted, all items of the order are added. Quantities are merged if the product is already on the profile.
- **DELETE** `/api/dashboard/customers/{customer}/profiles/{profile}/products/{product}`  
  Remove product from profile. Path: `product` = product ID. Returns 204.

### Profile prescriptions

- **GET** `/api/dashboard/customers/{customer}/profiles/{profile}/prescriptions`  
  List prescriptions attached to the profile. Each item includes `name` (optional label).
- **POST** `/api/dashboard/customers/{customer}/profiles/{profile}/prescriptions`  
  Upload a prescription file. **Content-Type:** `multipart/form-data`. Body: `file` (required; image or PDF, max 10 MB), `name` (optional; string, max 255 – label for the prescription).
- **POST** `/api/dashboard/customers/{customer}/profiles/{profile}/prescriptions/from-order`  
  Attach a prescription from an order. Body: `prescription_id` (required), `name` (optional; string, max 255 – label for the prescription). Backend copies the file to the profile; profile owns the copy.
- **PATCH** `/api/dashboard/customers/{customer}/profiles/{profile}/prescriptions/{profile_prescription}`  
  Update a profile prescription. Body: `name` (optional), `status` (optional: pending/approved/rejected), `notes` (optional). Use this to set or change the prescription name.
- **DELETE** `/api/dashboard/customers/{customer}/profiles/{profile}/prescriptions/{profile_prescription}`  
  Remove prescription from profile. Path: `profile_prescription` = profile prescription ID. Returns 204.
- **GET** `/api/dashboard/customers/{customer}/profiles/{profile}/prescriptions/{profile_prescription}/file`  
  Get a temporary URL to view/download the file. Response: `{ "url": "..." }`. Use this URL in a new tab or iframe to show the file.

---

## Data Template (User Data sheet)

For customer import, the Excel file must have a sheet named **"User Data"** (or the first sheet if the workbook has only one sheet). Row 1 is the header row. Supported columns (case-insensitive, trimmed):

| Column         | Maps to / behavior                                      |
|----------------|---------------------------------------------------------|
| User ID        | `external_id` (unique per tenant)                       |
| Name           | `name` (required if Contact # is empty)                |
| Contact #      | `phone` (required if Name is empty)                    |
| Gender         | `gender` (normalize to male/female/other)              |
| Address        | `address`                                              |
| City           | `city`                                                 |
| Coordinates    | Split into `latitude`, `longitude` (e.g. "31.52,74.35") |
| Profile I      | Name of first medical profile to create                |
| Profile II     | Name of second profile                                 |
| Profile III    | Name of third profile                                  |
| Profile IV     | Name of fourth profile                                 |
| Profile V      | Name of fifth profile                                  |
| User Discount  | `discount_percentage` (0–100)                          |

Upsert key: **phone** if present; otherwise **User ID** (external_id). Profile I–V create up to 5 **medical profiles** with the given names; products and prescriptions for those profiles are added later in the app (from orders or catalog/upload).

---

## Auth and errors

- **Auth:** All dashboard requests must send `Authorization: Bearer <token>` (Sanctum token from dashboard login).
- **403:** User is not admin or staff.
- **404:** Resource not found (e.g. customer, profile, order not in tenant or not belonging to customer).
- **422:** Validation error; response body includes `errors` object.
- **500:** Server error (e.g. tenant context missing, S3 unavailable).

Use the existing dashboard login flow to obtain the token and pass it on every request.
