# Discounts: Frontend Behavior

This document describes how the frontend should handle **product discounts** (`item_discount`) and **customer discounts** (`discount_percentage`), and how the backend applies them at checkout.

---

## 1. How discounts work (backend)

- **Product discount**: Each product has `item_discount` — a **percentage** (0–100, e.g. `10` = 10% off). It applies **only when the customer buys the product’s biggest unit**: box if the product has box, else pack/secondary if it has pack, else **single item** (for products sold only by single item, with no packs or boxes). It is **not** applied when buying items *inside* a box or pack (e.g. buying by “item” or “secondary” when the product also sells by box or pack). Formula: `(unit_price × quantity) × (item_discount / 100)`.
- **Customer discount**: A logged-in customer may have `discount_percentage` (0–100) on their profile. Like product discount, it applies **only when buying the product’s biggest unit** (box, or pack if no box, or single item if no pack/box). It is **not** applied when buying items inside a box or pack. Formula: `(unit_price × quantity) × (customer.discount_percentage / 100)`.
- **Special offers (category/subcategory)**: Offers are attached to **one category** or **one subcategory**. Each offer has: name, description, banner image, discount %, start date, end date. All products in that category (or in that subcategory) get the offer discount when the offer is **active** (today between start_date and end_date). If a product qualifies for multiple offers (e.g. one on its category and one on a subcategory), we use the **maximum** offer discount %.
- **At checkout**: For each order line we apply **one** discount — the **best of three**: max(product discount, customer discount, offer discount) — **only when the line’s unit_type is the product’s “top” tier**. For items inside a box or pack, no discount (0).
  - Product discount for the line: `(unit_price × quantity) × (product.item_discount / 100)` when top tier; otherwise 0.
  - Customer discount for the line (if signed in): `(unit_price × quantity) × (customer.discount_percentage / 100)` when top tier; otherwise 0.
  - Offer discount for the line: `(unit_price × quantity) × (best_offer_percentage / 100)` when top tier; otherwise 0. Best offer = max discount % among active offers that apply to the product’s category or any of its subcategories.
- **Guest users**: Product and/or offer discount applies when buying the product’s top tier. For other tiers, no discount.

---

## 2. Checkout / cart

### Data you get from the API

After placing an order (`POST /api/orders`), and when loading an order (`GET /api/orders/{order}`, `GET /api/customer/orders/{order}`), the response includes:

**Order:**

- `subtotal` — Sum of (unit_price × quantity) **before** any discount.
- `discount_amount` — Total discount applied (sum of all line discounts).
- `discount_percentage` — The customer’s discount percentage at time of order (for display only; actual discount is line-based).
- `total` — Final amount: `subtotal - discount_amount + delivery_fee`.
- `delivery_fee` — Delivery fee (currently 0 if not used).

**Order items (`order.items[]`):**

- `unit_price` — Price per unit for the chosen tier (item / secondary / box).
- `quantity` — Quantity ordered.
- `line_total` — Line total **after** discount (what the customer pays for that line).
- `discount_amount` — **New.** Discount applied to this line only.

### What to do in the UI

- **Per line**: Show “You saved X” using `item.discount_amount` (format as currency).
- **Order summary**: Show:
  - Subtotal: `order.subtotal`
  - Discount: `- order.discount_amount`
  - Delivery: `+ order.delivery_fee`
  - Total: `order.total`
- **Cart preview (before placing order)**: You can estimate totals using the same rules:
  - For each cart line: **only when the line’s unit_type is the product’s top tier**: compute product discount = `(unit_price * quantity) * (product.item_discount / 100)`; customer discount = `(unit_price * quantity) * (customer.discount_percentage / 100)` when logged in (else 0); offer discount = `(unit_price * quantity) * (best_offer_percentage / 100)` where best_offer_percentage is the max % among active offers for that product’s category/subcategories (from `GET /api/offers`). Use the **greatest** of the three as the line discount. For items inside a box/pack, line discount = 0. Line total = `(unit_price * quantity) - line_discount`. Sum line totals and line discounts for “estimated total” and “estimated savings”.

---

## 3. Product listing / product detail (display only)

Here you are **showing** what discount the user will get per unit, not calculating the order total.

### Rule per tier (item / secondary / box)

**Product discount applies only on the product’s “top” tier** (biggest unit: box if can_sell_box, else pack/secondary if can_sell_secondary, else single item). We do **not** apply it when buying items *inside* a box or pack (e.g. single units when the product also sells by box/pack).

For each sellable tier (from `product.packaging_display.options` or product’s `retail_price_item`, `retail_price_secondary`, `retail_price_box`):

- **Product discount** (top tier only): `product.item_discount` is a **percentage** (0–100). Per-unit discount amount = `unit_price * (item_discount / 100)`. Show only for the tier that is the product’s top tier (box, or secondary if no box, or item if no pack/box).
- **Customer discount** (top tier only): Same rule — `unit_price * (customer.discount_percentage / 100)` only for the product’s top tier. Not applied for items inside a box/pack.
- **Offer discount** (top tier only): Get active offers from `GET /api/offers`. For a product, best offer % = max of offer.discount_percentage where offer applies to product.category_id or any of product.subcategory_ids. Per-unit offer discount = `unit_price * (best_offer_percentage / 100)`.
- **Effective discount to show**: For the **top** tier only, show the **greatest** of (product % discount, customer % discount, offer % discount). For other tiers (items inside a box/pack), show **no** discount.

### What to show

- **Top tier only** for product discount: show as percentage, e.g. “10% off per box” or “10% off” for single-item-only products, using `product.item_discount` (0–100). Do not show product discount for “items inside a box/pack” (item or secondary when the product also has box or pack).
- **Guest or no customer discount**: For the product’s top tier (box, or pack if no box, or item if no pack/box), show e.g. “10% off”. For other tiers, no product discount.
- **Logged-in customer**: For the **top** tier, product, customer, and offer % all apply — show the greatest of the three. For item/secondary when they are *not* the top tier (items inside a box/pack), show no discount.
- **Top tier** = box if `can_sell_box`, else secondary if `can_sell_secondary`, else item.

### Where to get customer data

- After login, from `GET /api/auth/me` (if you expose customer profile there) or from your customer profile API. Use `customer.discount_percentage` (0–100). If null or 0, treat as 0.

---

## 4. API fields reference

| Source | Field | Type | Meaning |
|--------|--------|------|--------|
| Product | `item_discount` | decimal string | Discount **percentage** (0–100). Applied **only when buying the product’s top unit** (box if can_sell_box, else pack/secondary if can_sell_secondary, else single item). Not applied when buying items inside a box or pack. |
| Product | `retail_price_item` / `retail_price_secondary` / `retail_price_box` | decimal string | Unit price for each tier. |
| Customer | `discount_percentage` | number | 0–100; applied only when buying the product’s top unit (same rule as product discount). null/undefined treated as 0. |
| Offer | `discount_percentage`, `category_id`, `subcategory_id`, `start_date`, `end_date` | — | From `GET /api/offers`. Match by category_id or subcategory_id to product; take max % among active offers. Applied only on product’s top tier; best of three with product and customer. |
| Order | `subtotal` | decimal | Sum of (unit_price × quantity) before discount. |
| Order | `discount_amount` | decimal | Total discount (sum of line discounts). |
| Order | `discount_percentage` | decimal | Customer’s % at time of order (display only). |
| Order | `total`, `delivery_fee` | decimal | Final total and delivery fee. |
| Order item | `unit_price`, `quantity` | decimal, int | Price per unit and quantity. |
| Order item | `line_total` | decimal | Line total **after** discount. |
| Order item | `discount_amount` | decimal | **New.** Discount applied to this line. |

---

## 5. Edge cases

- **Guest**: Product discount applies only when buying the product’s **top** tier. No discount when buying items inside a box/pack.
- **Customer with no discount**: If `customer.discount_percentage` is null, 0, or missing, treat as 0. Product discount still applies for the product’s top tier only.
- **Product with no discount**: `product.item_discount` is 0 or null → product line discount is 0 for that line; customer % still applies for top tier if signed in.
- **Buying items inside a box or pack**: When the product has box or pack and the customer buys by item or secondary (non–top tier), **neither** product nor customer discount applies — line discount is 0.
- **Single-item-only products**: When the product has no box/pack (`can_sell_item` only), both product and customer discounts apply when buying by item.
- **Rounding**: Backend uses 2 decimal places for all amounts. Format currency the same way (e.g. 2 decimals) for consistency.
- **Excel import**: The “Item Discount” column is interpreted as a **percentage** (0–100). Use values like 10 for 10%, not 0.10.

---

## 6. Summary

- **Checkout**: Use `order.discount_amount` and `order.items[].discount_amount` for “You saved” and totals; no need to recompute on the frontend for **placed** orders.
- **Cart (before submit)**: Compute line discount per line **only when unit_type is the product’s top tier**: product, customer, and offer discount (best of three); for items inside a box/pack, line discount = 0. Then subtotal and total as in section 2.
- **Product pages**: Product, customer, and offer discounts apply **only for the product’s top tier**. For that tier, show the greatest of (product %, customer %, offer %). For items inside a box/pack, show no discount. Use `product.item_discount`, `customer.discount_percentage`, and active offers from `GET /api/offers` matched by product.category_id and product.subcategory_ids.

---

## 7. Special offers (category / subcategory)

### How it works

- **Offers** are promotions attached to **one category** OR **one subcategory** (exactly one). Each offer has: name, description, banner image, discount percentage (0–100), start date, end date.
- **Active** = today is between start_date and end_date (inclusive).
- All products in that category (or in that subcategory) are eligible for the offer discount. If a product matches multiple offers (e.g. one on its category and one on a subcategory), we use the **maximum** discount percentage among those offers.
- At checkout and on product/cart display, we apply the **best of three**: max(product discount, customer discount, offer discount) — and only when the customer is buying the product’s **top tier** (box, or pack if no box, or single item). We do **not** apply any of the three when buying items inside a box or pack.

### APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|--------------|
| GET | `/api/offers` | No (tenant required via X-Tenant-Id) | List **active** offers. Returns `{ data: [...] }`. Each item includes: id, name, description, banner_image, banner_url, discount_percentage, start_date, end_date, category_id, subcategory_id, category (object or null), subcategory (object or null). Use for storefront banners and to compute offer discount per product. Optional query: `?category_id=`, `?subcategory_id=` to filter. |
| GET | `/api/dashboard/offers` | Bearer + role admin,staff | List all offers (paginated). Same shape plus banner_url. Query: `?active=1`, `?category_id=`, `?subcategory_id=`. |
| POST | `/api/dashboard/offers` | Bearer + role admin,staff | Create offer. Body: name (required), description (optional), discount_percentage (required, 0–100), start_date, end_date (required, date), **exactly one of** category_id or subcategory_id. Optional: `banner` (file, image, max 2MB). Responds 201 with created offer. |
| GET | `/api/dashboard/offers/{id}` | Bearer + role admin,staff | Get one offer. |
| PUT/PATCH | `/api/dashboard/offers/{id}` | Bearer + role admin,staff | Update offer. Same fields as create; send only fields to update. Optional `banner` file replaces existing. |
| DELETE | `/api/dashboard/offers/{id}` | Bearer + role admin,staff | Delete offer (and remove banner from storage). 204. |

### Frontend workflows

**Storefront**

1. **Offer banners**: Call `GET /api/offers` (with X-Tenant-Id). Render a carousel or grid of active offers using name, description, banner_url, discount_percentage. Link each banner to the category or subcategory (e.g. `/categories/{id}` or `/categories/{categoryId}/subcategories/{id}`) or to a product list filtered by that category/subcategory.
2. **Product cards / detail**: For each product you already have category_id and subcategory_ids (from product API). Fetch `GET /api/offers` once (or cache). For that product, best offer % = max of offer.discount_percentage where offer.category_id === product.category_id OR offer.subcategory_id is in product.subcategory_ids. Then effective discount = max(product.item_discount, customer.discount_percentage, best_offer_percentage) for the **top tier** only. Show e.g. “Up to 15% off” or “Best offer: 10%”.
3. **Cart preview**: For each line, if unit_type is the product’s top tier, compute product, customer, and offer discount (offer from same matching logic). Line discount = max of the three. Sum for “You save” and total.

**Dashboard (admin/staff)**

1. **List offers**: `GET /api/dashboard/offers`. Table: name, description, discount %, start_date, end_date, category or subcategory name, banner thumb (banner_url). Filters: active, category_id, subcategory_id. Actions: Edit, Delete.
2. **Create offer**: Form with name, description, discount % (0–100), start date, end date, and **either** category (dropdown) **or** subcategory (dropdown). Optional: banner image upload (max 2MB). Submit as multipart if banner present. POST `/api/dashboard/offers`.
3. **Edit offer**: Same form pre-filled. PUT/PATCH `/api/dashboard/offers/{id}`. Optional new banner file replaces old one.
4. **Delete**: DELETE `/api/dashboard/offers/{id}`. Confirm before sending.

### Checkout

- Backend already applies the best of three per line. Order and order items include discount_amount. Frontend only displays it. No extra call needed for placed orders.
