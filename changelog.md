# Changelog

## 2026-04-22 — Improved Pharmacist Review UX

### Frontend changes

- **Red field borders** for changed text/select fields when a pharmacist views a PM revision (`revision_data` keys get `border-2 border-red-300 bg-red-50/40` wrapper + red input border).
- **Red-highlighted checkboxes** for toggled boolean fields (`can_sell_item`, `can_sell_secondary`, `can_sell_box`, `is_narcotic`, `cold_chain_needed`) with red border + background on the label + red-tinted checkbox input.
- **Rich tooltip cards** on every changed field: hover the red info icon to see a two-row before/after diff with friendly field labels.
- **Change summary panel** at the top of the edit form for pharmacists: lists every changed field as `Label: before → after`, plus counts of staged image deletions, new images, and tab changes.
- **`friendlyFieldLabel()`** helper maps internal `revision_data` keys to human-readable labels (e.g. `retail_price_item` → "Price per item").
- **`PriceField`** component now accepts a `changed` prop that tints the input border red when the price was modified.
- PM can edit/stage all product attributes including pricing checkboxes, narcotic, cold chain — no fields are disabled for PM.

### Backend changes required

The frontend now highlights all keys present in `revision_data`. For full coverage, the backend **must** include the following fields in `revision_data` when a PM stages a revision on a published product:

#### 1. Boolean fields — must be tracked in `revision_data`

Currently the backend may only track scalar fields. The frontend now checks for these boolean keys:

| Key | Type | Description |
|---|---|---|
| `can_sell_item` | `boolean` | Sell per item toggle |
| `can_sell_secondary` | `boolean` | Sell per secondary unit toggle |
| `can_sell_box` | `boolean` | Sell per box toggle |
| `is_narcotic` | `boolean` | Narcotic classification |
| `cold_chain_needed` | `boolean` | Cold chain requirement |

**Required backend action:** When a PM updates any of these fields on a published product via `PUT /products/{id}`, the backend must include the key and its **new value** in the `revision_data` JSON column. The `revision_review_status` should be set to `"pending"`.

#### 2. Scalar fields — already tracked (verify)

These fields should already be tracked. Confirm the backend includes them in `revision_data` when changed:

| Key | Type |
|---|---|
| `item_name` | `string` |
| `item_id` | `string` |
| `brand` | `string\|null` |
| `category_id` | `integer\|null` |
| `generic_name` | `string\|null` |
| `availability` | `enum: yes/no/short` |
| `retail_price_unit` | `decimal` |
| `retail_price_item` | `decimal` |
| `retail_price_secondary` | `decimal` |
| `retail_price_box` | `decimal` |
| `secondary_unit_label` | `string` |
| `box_unit_label` | `string` |
| `base_unit_label` | `string\|null` |
| `pack_qty` | `integer\|null` |
| `strip_qty` | `integer\|null` |
| `item_discount` | `decimal` |

#### 3. API response: `revision_data` format

`revision_data` must be a flat JSON object where:
- **Keys** are snake_case column names matching the `products` table.
- **Values** are the **proposed new values** (not the originals).
- The **current (live) value** remains on the product root — the frontend reads both for the before/after diff.

Example:
```json
{
  "revision_data": {
    "retail_price_secondary": "45.00",
    "can_sell_item": true,
    "is_narcotic": false,
    "item_discount": "5.00"
  },
  "revision_review_status": "pending",
  "retail_price_secondary": "40.00",
  "can_sell_item": false,
  "is_narcotic": true,
  "item_discount": "0.00"
}
```

In this example the product root still has the live values, and `revision_data` has the PM's proposed changes.

#### 4. Approve endpoint: apply all `revision_data` fields

`POST /products/{id}/approve` must iterate over **every key** in `revision_data` and apply it to the product, including the boolean fields listed in section 1. After applying:
- Set `revision_data` to `null`.
- Set `revision_review_status` to `"none"`.
- Set `catalog_status` to `"published"` (if not already).

#### 5. Reject endpoint: clear revision

`POST /products/{id}/reject` must:
- Set `revision_data` to `null`.
- Set `revision_review_status` to `"rejected"`.
- Optionally store `catalog_rejection_note`.

#### 6. No new endpoints required

All frontend changes work with the existing API surface. The only requirement is that `revision_data` is populated consistently for all editable fields.
