# Backend changes log — for frontend (customer + dashboard)

This document summarizes backend changes that affect the frontend. Use it to adjust the customer-facing app and the dashboard accordingly.

---

## Excel import: new columns & packaging logic (recent)

### What changed on the backend

1. **Excel template support**
   - Import now reads four new columns: **Is Pack Item**, **Sell Per Item Only**, **Pack Unit**, **Pack Item Unit**.
   - Header name fixes: **Genaric Name**, **Narcotic(s)**, **Sub Category I** are now recognized (in addition to existing spellings).

2. **Three product types from import**
   - **Pack + strips** (e.g. pharmacy: Box → Strips → Tablets): `can_sell_box` and `can_sell_secondary` set from box/strip prices; **Pack Unit** → `box_unit_label`, **Pack Item Unit** → `secondary_unit_label`; `base_unit_label` = "Tablets".
   - **Pack + individual items only** (e.g. box of jellies/chocolates): `can_sell_box` and `can_sell_item` set; `can_sell_secondary` = false. **Pack Unit** → `box_unit_label`, **Pack Item Unit** → `base_unit_label`. Single-item price comes from the *strip price column* in Excel; `strip_qty` is null.
   - **Standalone**: same as before; only `can_sell_item` from item price when no pack/strip.

3. **Product API / `packaging_display`**
   - **Box tier description** now depends on selling flags:
     - If `can_sell_secondary` → "1 {boxLabel} = {pack_qty} {secondaryLabel}" (e.g. "1 Box = 10 Strips").
     - If `can_sell_secondary` is false but `can_sell_item` is true → "1 {boxLabel} = {pack_qty} {baseLabel}" (e.g. "1 Box = 50 Jellies").
   - No change to response shape: still `packaging_display.base_unit` and `packaging_display.options[]` with `tier`, `label`, `description`, `price`.

4. **Labels are dynamic**
   - `box_unit_label` can be "Box", "Pack", "Carton", etc. (from **Pack Unit** or legacy **Box Unit Label**).
   - `secondary_unit_label` can be "Strip", "Sachet", etc. (from **Pack Item Unit** when it’s pack+strips).
   - `base_unit_label` can be "Tablets", "Jelly", "Chocolate", "Unit", etc. (from **Pack Item Unit** when sell-per-item-only, or legacy **Base Unit Label**).

---

### Customer-facing app

- **Use `packaging_display` only.**  
  Keep using `product.packaging_display.options` for "Select Pack Size". Each option has `tier`, `label`, `description`, `price`. No structural change required.
- **Don’t assume labels.**  
  Avoid hardcoding "Pack", "Strip", "Tablet". Always show `option.label` and `option.description` from the API.
- **New possibility: box + item only.**  
  Some products will have only two options: box and item (e.g. "1 Box = 50 Jellies" and "1 Jelly"). Handle 2-option lists the same as 3-option; no special case needed.
- **Cart/order payload.**  
  Continue sending `tier` (`"box"` | `"secondary"` | `"item"`) and `price` (and quantity). Backend contract unchanged.

---

### Dashboard (admin)

- **Product create/edit**
  - Expose and persist: `box_unit_label`, `secondary_unit_label`, `base_unit_label` (all optional; backend defaults: "Box", "Pack", "Unit").
  - Expose and persist: `can_sell_box`, `can_sell_secondary`, `can_sell_item` (read-only for imported data if you sync from backend after import; otherwise editable).
  - Validation: if a sellable flag is true, the corresponding price must be &gt; 0 (backend returns 422 otherwise).

- **After Excel import**
  - Imported products may now have:
    - **Box + strips + item** (three sellable tiers),
    - **Box + item only** (two tiers; no secondary),
    - **Item only** (one tier).
  - Labels will reflect Excel **Pack Unit** / **Pack Item Unit** (or legacy columns). Show them in the product form so admins can edit if needed.

- **Import logs / error snapshot**
  - Rejected rows in import logs now include: `is_pack_item`, `sell_per_item_only`, `pack_unit`, `pack_item_unit` in the `data` object. Useful for debugging and re-export/fix flows.

---

### API contract (unchanged)

- **GET** `/products`, **GET** `/products/{id}` (and dashboard variants): product payload still includes `packaging_display`, `box_unit_label`, `secondary_unit_label`, `base_unit_label`, `can_sell_box`, `can_sell_secondary`, `can_sell_item`, and all price fields.
- **POST/PATCH** product: same request body as before; no new required fields. New import logic only affects how Excel is mapped into these existing fields.

---

## Ordering & Customer profile (new)

### Backend overview

- **Guest checkout:** Any user can place an order without an account. Send **X-Tenant-Id** header and `POST /api/orders` with delivery info + items.
- **Registered customers:** Customers sign up via `POST /api/customer/register` (with **X-Tenant-Id**). Login with `POST /api/customer/login`. Profile is stored in tenant `customers` table; auth is Laravel Sanctum (email + password).
- **Customer profile:** Name, email, phone, gender, address, city, latitude, longitude, discount_percentage (admin-set). Frontend gets coordinates via Google Maps/geolocation and sends `latitude`/`longitude` to the backend.
- **Orders:** Delivery info is always snapshotted on the order. Prices are snapshotted on each order item. Order number is auto-generated (e.g. `ORD-00001`). Cash on Delivery only for now.

### API endpoints

**Public (tenant-aware; send X-Tenant-Id for guests)**

- `POST /api/customer/register` — body: name, email, password, password_confirmation, phone?, gender?, address?, city?, latitude?, longitude?
- `POST /api/customer/login` — body: email, password. Returns token, user, customer.
- `POST /api/orders` — place order (guest or with Bearer token). If Bearer token is a customer, order is linked and customer discount applied.
  - Body: delivery_name, delivery_phone, delivery_address, delivery_city?, delivery_gender?, delivery_latitude?, delivery_longitude?, notes?, items: [{ product_id, unit_type, quantity }]. `unit_type`: `item` | `secondary` | `box`.
- `GET /api/orders/{orderNumber}/track?phone=...` — guest order tracking.

**Customer-only (auth:sanctum + role customer)**

- `GET /api/customer/profile` — current customer profile.
- `PUT /api/customer/profile` — update name, phone, gender, address, city, latitude, longitude (no email change).
- `GET /api/customer/orders` — paginated order history.
- `GET /api/customer/orders/{order}` — single order (must own it).

**Dashboard (admin/staff)**

- `GET /api/dashboard/orders` — list orders (query: status, from_date, to_date, customer_id, per_page).
- `GET /api/dashboard/orders/{order}` — order detail.
- `PATCH /api/dashboard/orders/{order}/status` — body: `{ "status": "pending"|"confirmed"|"processing"|"out_for_delivery"|"delivered"|"cancelled" }`.

### Customer-facing app

- **Checkout:** Collect delivery_name, delivery_phone, delivery_address, delivery_city, delivery_gender; get coordinates (Google Maps / geolocation) and send delivery_latitude, delivery_longitude. Send items with product_id, unit_type (from packaging_display.options[].tier), quantity.
- **Guest:** Omit Bearer token; send X-Tenant-Id. After order, show order_number and tell user to track with order number + phone.
- **Logged-in customer:** Send Bearer token; backend links order to customer and applies discount_percentage. Optionally prefill delivery from customer profile.
- **Tracking:** Call `GET /api/orders/{orderNumber}/track?phone=...` with X-Tenant-Id.

### Dashboard (admin)

- **Customers:** Customer list/detail now includes gender, address, city, latitude, longitude, discount_percentage. Editable; discount_percentage is a percentage (e.g. 10 = 10% off).
- **Orders:** New orders section: list orders, filter by status/date/customer, view order detail, update status (pending → confirmed → processing → out_for_delivery → delivered or cancelled).

---

*Last updated: after ordering feature and customer profile implementation.*
