# Pulse RX -- Pricing & Sellable-Unit Model

## 1. Overview

Pulse RX uses a **two-tier customer-facing pricing model** per product:

| Tier | Column | Purpose |
|------|--------|---------|
| **Secondary** | `retail_price_secondary` | Single-item selling price (e.g. 1 pack of chips, 1 strip of tablets, 1 sachet) |
| **Box** | `retail_price_box` | Full box selling price (e.g. a carton of 24 packs) |

There is also a **unit price** (`retail_price_unit`) which is an internal
supplier/cost reference price. It is **not shown to customers** and has no
sellable flag.

The admin names the secondary tier per product using `secondary_unit_label`
(e.g. "Pack", "Strip", "Piece", "Sachet"). This gives full flexibility --
a pharmacy can call it "Strip" for tablets while a grocery store calls
it "Pack" for chips.

---

## 2. Database fields

All fields live on the **`products`** table inside each tenant schema.

### 2.1 Price columns

| Column | Type | Default | Customer-facing | Description |
|--------|------|---------|:-:|-------------|
| `retail_price_unit` | `decimal(10,2)` | `0.00` | No | Supplier / cost reference price |
| `retail_price_secondary` | `decimal(10,2)` | `0.00` | Yes | Price for one secondary unit |
| `retail_price_box` | `decimal(10,2)` | `0.00` | Yes | Price for one full box |

### 2.2 Packaging info (informational)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `pack_qty` | `integer` | `null` | How many secondary units fit in one box |
| `strip_qty` | `integer` | `null` | How many individual items in one secondary unit |

These help the customer understand what they are buying but are not used for price calculation.

### 2.3 Sellable flags

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `can_sell_secondary` | `boolean` | `false` | Whether customers can buy the secondary unit |
| `can_sell_box` | `boolean` | `false` | Whether customers can buy the full box |

These flags are the **source of truth** for which purchasing options are
available to the customer.

### 2.4 Secondary unit label

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `secondary_unit_label` | `string(50)` | `"Pack"` | Admin-defined label for the secondary tier |

This is set per product. The frontend reads it to label the option button
(e.g. "Per Strip", "Per Pack", "Per Sachet").

---

## 3. Business rules

### 3.1 How selling works

A product can be sold in one or both tiers:

| Product | `can_sell_secondary` | `can_sell_box` | `secondary_unit_label` | Notes |
|---------|:-:|:-:|--------|-------|
| Lays Classic | true | true | Pack | Customer picks 1 pack or full box |
| Paracetamol 500mg | true | true | Strip | Customer picks 1 strip or full box |
| Cough Syrup 100ml | true | false | Bottle | Sold per bottle only |
| Surgical Masks (50ct) | false | true | -- | Sold per box only |

### 3.2 Unit price is internal

`retail_price_unit` is the supplier/cost price received from the vendor.
It exists for the admin's reference (e.g. margin calculations) but is
never exposed as a customer purchasing option. There is no `can_sell_unit`
flag -- unit price is never sellable on its own.

### 3.3 Price-flag consistency (strict)

The backend **rejects** (HTTP 422) any create or update request where a
sellable flag is `true` but its price is `0` or missing:

```
can_sell_secondary = true  -->  retail_price_secondary must be > 0
can_sell_box       = true  -->  retail_price_box       must be > 0
```

Setting a flag to `false` does **not** require clearing the price; the
price may remain for record-keeping.

### 3.4 Defaults for new products

| Field | Default |
|-------|---------|
| `can_sell_secondary` | `false` |
| `can_sell_box` | `false` |
| `secondary_unit_label` | `"Pack"` |
| All prices | `0.00` |

New products start with both customer-facing flags off. The admin must
explicitly enable at least one tier and set its price to make the product
purchasable.

### 3.5 Excel import behavior

The `POST /products/import` endpoint maps the Excel column
`Retail Price (Strip)` to `retail_price_secondary` in the database.
It does **not** set `can_sell_*` flags or `secondary_unit_label`; DB defaults
apply. Admins configure selling options via the dashboard after import.

---

## 4. API reference

### 4.1 Affected endpoints

All existing product endpoints include the pricing and sellable fields:

- `GET  /products` and `GET  /dashboard/products`
- `GET  /products/{product}` and `GET  /dashboard/products/{product}`
- `POST /products` and `POST /dashboard/products`
- `PUT|PATCH /products/{product}` and `PUT|PATCH /dashboard/products/{product}`

No new routes were added.

### 4.2 Create product -- request body

```jsonc
{
  // ...existing fields...
  "retail_price_unit": 30.00,           // optional, supplier/internal price
  "retail_price_secondary": 50.00,      // required > 0 when can_sell_secondary is true
  "retail_price_box": 550.00,           // required > 0 when can_sell_box is true
  "can_sell_secondary": true,           // optional, boolean (default false)
  "can_sell_box": true,                 // optional, boolean (default false)
  "secondary_unit_label": "Strip"       // optional, string (default "Pack")
}
```

### 4.3 Update product -- partial update

The backend merges incoming values with the product's current state before
validating. Examples:

- `{"can_sell_secondary": true, "retail_price_secondary": 200}` -- enable secondary selling
- `{"can_sell_box": false}` -- disable box selling (price kept as-is)
- `{"secondary_unit_label": "Sachet"}` -- rename the secondary tier
- `{"retail_price_secondary": 0}` while `can_sell_secondary` is `true` -- **rejected 422**

### 4.4 Validation error example (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "retail_price_secondary": [
      "A secondary price greater than 0 is required when can_sell_secondary is enabled."
    ]
  }
}
```

### 4.5 Product response shape

```jsonc
{
  "id": 101,
  "item_id": "2112486",
  "item_name": "Paracetamol 500mg",
  "retail_price_unit": "30.00",
  "retail_price_secondary": "50.00",
  "retail_price_box": "550.00",
  "pack_qty": 20,
  "strip_qty": 10,
  "can_sell_secondary": true,
  "can_sell_box": true,
  "secondary_unit_label": "Strip",
  // ...rest of product fields...
}
```

---

## 5. Frontend integration guide

### 5.1 Customer-facing product page

Read the two boolean flags and only render options where the flag is `true`:

```
if product.can_sell_secondary:
    show option labeled product.secondary_unit_label with retail_price_secondary
if product.can_sell_box:
    show option labeled "Box" with retail_price_box
```

Use a radio group or segmented control so the customer selects exactly
one option per line item.

### 5.2 Dashboard / admin UI

Provide:
- A text input for `secondary_unit_label` (e.g. "Pack", "Strip", "Piece")
- Toggle switches for `can_sell_secondary` and `can_sell_box`
- Price inputs for `retail_price_secondary` and `retail_price_box`
- A separate read-only or editable field for `retail_price_unit` (supplier price)

Grey out the price field when its flag is off. If the admin submits with
a flag on but price empty/zero, the backend returns 422 with a clear error.

### 5.3 Cart / order integration (future)

When orders are implemented, each `order_item` should capture:

| Field | Type | Description |
|-------|------|-------------|
| `unit_type` | `enum(secondary,box)` | Which tier the customer selected |
| `unit_label` | `string` | Snapshot of `secondary_unit_label` at time of sale |
| `unit_price` | `decimal(10,2)` | Snapshot of the price at time of sale |
| `quantity` | `integer` | How many of that tier |

This decouples the order from future price or label changes.

---

## 6. Migration & rollout

After deploying the code changes:

```bash
php artisan tenants:migrate
```

This renames `retail_price_strip` to `retail_price_secondary`,
renames `can_sell_strip` to `can_sell_secondary`, drops `can_sell_unit`,
and adds `secondary_unit_label` (default "Pack") across all tenant schemas.

**No data loss occurs.** Existing price values are preserved under the
new column name.

Frontend teams should:
1. Replace all references to `retail_price_strip` / `can_sell_strip` with the new names.
2. Read `secondary_unit_label` to label the secondary option dynamically.
3. Stop showing `retail_price_unit` as a customer purchasing option.
