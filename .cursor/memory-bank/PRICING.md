# Pulse RX -- Pricing & Sellable-Unit Model

## 1. Overview

Pulse RX uses a **three-tier customer-facing pricing model** per product:

| Tier | Column | Purpose |
|------|--------|---------|
| **Box** | `retail_price_box` | Full box selling price (e.g. a carton of 24 packs) |
| **Secondary** | `retail_price_secondary` | Single secondary-unit selling price (e.g. 1 strip of tablets, 1 pack of chips, 1 sachet) |
| **Item** | `retail_price_item` | Price per single item (e.g. 1 tablet, 1 capsule) |

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
| `retail_price_item` | `decimal(10,2)` | `0.00` | Yes | Price per single item |

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
| `can_sell_item` | `boolean` | `false` | Whether customers can buy per single item |

These flags are the **source of truth** for which purchasing options are
available to the customer.

### 2.4 Tier labels

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `secondary_unit_label` | `string(50)` | `"Pack"` | Admin-defined label for the secondary/middle tier |
| `box_unit_label` | `string(50)` | `"Box"` | Admin-defined label for the top tier (pharmacy may use `"Pack"`) |
| `base_unit_label` | `string(50)` | `null` | Label for the smallest unit (e.g. `"Tablet"`, `"Capsule"`). Displayed as `"Unit"` when null. |

These are set per product. The frontend reads them to build the
Healthwire-style "Select Pack Size" UI (e.g. "1 Pack = 10 Strips",
"1 Strip = 10 Tablets").

### 2.5 Computed: `packaging_display`

Every product API response includes a computed `packaging_display` attribute
(via Eloquent `$appends`). It contains **only the sellable tiers** so the
frontend can render the "Select Pack Size" control by iterating over
`packaging_display.options`.

```jsonc
{
  "packaging_display": {
    "base_unit": "Tablet",          // from base_unit_label (or "Unit" if null)
    "options": [
      {
        "tier": "box",              // identifier for cart/order
        "label": "Pack",            // from box_unit_label
        "description": "1 Pack = 10 Strips",  // auto-formatted from pack_qty + labels
        "price": "135.00"           // from retail_price_box
      },
      {
        "tier": "secondary",
        "label": "Strip",           // from secondary_unit_label
        "description": "1 Strip = 10 Tablets", // auto-formatted from strip_qty + labels
        "price": "13.50"            // from retail_price_secondary
      },
      {
        "tier": "item",
        "label": "Tablet",          // from base_unit_label (or "Unit")
        "description": "1 Tablet",  // "1 {base_unit_label}" or "1 Item"
        "price": "1.35"             // from retail_price_item
      }
    ]
  }
}
```

- Options are ordered: box first, then secondary, then item (smallest sellable unit last).
- `options` array is **empty** if none of `can_sell_box`, `can_sell_secondary`, or `can_sell_item` is true.
- If `pack_qty` or `strip_qty` is null, the description shows just the label
  (e.g. `"1 Strip"` instead of `"1 Strip = 10 Tablets"`).

---

## 3. Business rules

### 3.1 How selling works

A product can be sold in one, two, or all three tiers:

| Product | `can_sell_item` | `can_sell_secondary` | `can_sell_box` | `secondary_unit_label` | `box_unit_label` | `base_unit_label` | Notes |
|---------|:-:|:-:|:-:|--------|--------|--------|-------|
| Arinac Forte 100 Tabs | true | true | true | Strip | Pack | Tablet | 1 Pack = 10 Strips, 1 Strip = 10 Tablets, or per tablet |
| Lays Classic | false | true | true | Pack | Box | Pack | Customer picks 1 pack or full box |
| Cough Syrup 100ml | false | true | false | Bottle | Box | *null* | Sold per bottle only |
| Surgical Masks (50ct) | false | false | true | -- | Box | *null* | Sold per box only |

### 3.2 Unit price is internal

`retail_price_unit` is the supplier/cost price received from the vendor.
It exists for the admin's reference (e.g. margin calculations) but is
never exposed as a customer purchasing option. There is no `can_sell_unit`
flag -- unit price is never sellable on its own.

### 3.3 Price-flag consistency (strict)

The backend **rejects** (HTTP 422) any create or update request where a
sellable flag is `true` but its price is `0` or missing:

```
can_sell_item     = true  -->  retail_price_item     must be > 0
can_sell_secondary= true  -->  retail_price_secondary must be > 0
can_sell_box      = true  -->  retail_price_box       must be > 0
```

Setting a flag to `false` does **not** require clearing the price; the
price may remain for record-keeping.

### 3.4 Defaults for new products

| Field | Default |
|-------|---------|
| `can_sell_item` | `false` |
| `can_sell_secondary` | `false` |
| `can_sell_box` | `false` |
| `secondary_unit_label` | `"Pack"` |
| All prices | `0.00` |

New products start with all customer-facing flags off. The admin must
explicitly enable at least one tier and set its price to make the product
purchasable.

### 3.5 Excel import and smart auto-marking

The `POST /products/import` endpoint maps these Excel columns:

| Excel Column | Database Field |
|--------------|----------------|
| Retail Price (Item) | `retail_price_item` |
| Retail Price (Strip) | `retail_price_secondary` |
| Retail Price (Box) | `retail_price_box` |

**Smart auto-marking:** The import automatically sets `can_sell_item`,
`can_sell_secondary`, and `can_sell_box` based on which price columns have
values > 0. For example:

- Row with only `Retail Price (Item)` = 5.00 → `can_sell_item` = true, others false
- Row with Item + Strip + Box prices → all three flags true

The frontend should treat these flags as read-only for imported data, or
sync with the backend after import.

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
  "retail_price_item": 1.35,            // required > 0 when can_sell_item is true
  "retail_price_secondary": 50.00,      // required > 0 when can_sell_secondary is true
  "retail_price_box": 550.00,           // required > 0 when can_sell_box is true
  "can_sell_item": true,                // optional, boolean (default false)
  "can_sell_secondary": true,           // optional, boolean (default false)
  "can_sell_box": true,                 // optional, boolean (default false)
  "secondary_unit_label": "Strip",      // optional, string (default "Pack")
  "box_unit_label": "Pack",             // optional, string (default "Box")
  "base_unit_label": "Tablet"           // nullable, string (e.g. "Tablet", "Capsule")
}
```

### 4.3 Update product -- partial update

The backend merges incoming values with the product's current state before
validating. Examples:

- `{"can_sell_item": true, "retail_price_item": 5}` -- enable per-item selling
- `{"can_sell_secondary": true, "retail_price_secondary": 200}` -- enable secondary selling
- `{"can_sell_box": false}` -- disable box selling (price kept as-is)
- `{"secondary_unit_label": "Sachet"}` -- rename the secondary tier
- `{"box_unit_label": "Pack"}` -- rename the top tier (pharmacy convention)
- `{"base_unit_label": "Tablet"}` -- set base unit label for packaging display
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
  "retail_price_item": "1.35",
  "retail_price_secondary": "50.00",
  "retail_price_box": "550.00",
  "pack_qty": 20,
  "strip_qty": 10,
  "can_sell_item": true,
  "can_sell_secondary": true,
  "can_sell_box": true,
  "secondary_unit_label": "Strip",
  "box_unit_label": "Pack",
  "base_unit_label": "Tablet",
  "packaging_display": {
    "base_unit": "Tablet",
    "options": [
      {
        "tier": "box",
        "label": "Pack",
        "description": "1 Pack = 20 Strips",
        "price": "550.00"
      },
      {
        "tier": "secondary",
        "label": "Strip",
        "description": "1 Strip = 10 Tablets",
        "price": "50.00"
      },
      {
        "tier": "item",
        "label": "Tablet",
        "description": "1 Tablet",
        "price": "1.35"
      }
    ]
  },
  // ...rest of product fields...
}
```

---

## 5. Frontend integration guide

### 5.1 Automatic marking behavior (import)

The backend **auto-sets** `can_sell_item`, `can_sell_secondary`, and
`can_sell_box` during Excel import based on which price columns have
values > 0. The frontend should treat these flags as **read-only** for
imported data, or sync with the backend after import. Do not override
import-derived flags without user confirmation.

### 5.2 Display logic (packaging_display)

Use the computed `packaging_display.options` array. It now includes an
`item` tier when `can_sell_item` is true. Each option has: `tier`,
`label`, `description`, `price`. Options are ordered: box → secondary →
item (smallest unit last).

### 5.3 Customer-facing product page (Healthwire-style)

Use the computed `packaging_display` attribute directly. It contains only
the sellable tiers, so the frontend logic is minimal:

```
for option in product.packaging_display.options:
    show radio: option.description   option.price
```

Use a radio group or segmented control so the customer selects exactly
one option per line item. When the customer selects an option, store
`option.tier` and `option.price` for the cart payload.

**Select Pack Size UI:** Iterate over `packaging_display.options` (box,
secondary, item). For the item tier, the description may be `"1 Item"`
or `"1 {base_unit_label}"` (e.g. "1 Tablet").

Example rendered UI (Healthwire-style):

```
Select Pack Size
○ 1 PACK = 10 STRIPS     Rs. 550.00
● 1 STRIP = 10 TABLETS   Rs. 50.00
○ 1 TABLET               Rs. 1.35
[Add To Cart]
```

### 5.4 Dashboard / admin UI

Provide:
- A text input for `secondary_unit_label` (e.g. "Pack", "Strip", "Piece")
- A text input for `box_unit_label` (e.g. "Box", "Pack", "Carton")
- A text input for `base_unit_label` (e.g. "Tablet", "Capsule", "Bottle")
- Toggle switches for `can_sell_item`, `can_sell_secondary`, and `can_sell_box`
- Price inputs for `retail_price_item`, `retail_price_secondary`, and `retail_price_box`
- Number inputs for `pack_qty` and `strip_qty`
- A separate read-only or editable field for `retail_price_unit` (supplier price)

Grey out the price field when its flag is off. If the admin submits with
a flag on but price empty/zero, the backend returns 422 with a clear error.

When manually creating or editing products, the frontend can either (a) let
the user toggle flags and enforce price > 0, or (b) offer an **"Auto-detect
from prices"** action that mirrors import logic (set flags from which prices
are filled).

`packaging_display` is computed automatically from these fields -- no admin
input needed for it.

### 5.5 Cart / order integration (future)

When orders are implemented, each `order_item` should capture:

| Field | Type | Description |
|-------|------|-------------|
| `unit_type` | `enum(item,secondary,box)` | Which tier the customer selected |
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

The migration adds `retail_price_item` (decimal, default 0) and
`can_sell_item` (boolean, default false) to the products table.

Frontend teams should:
1. Read `packaging_display.options` including the `item` tier when present.
2. Add support for `retail_price_item` and `can_sell_item` in create/update flows.
3. Treat `can_sell_*` as read-only for imported data or sync after import.
