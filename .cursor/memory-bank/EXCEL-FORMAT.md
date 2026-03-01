# Excel Item List — Product Variations & Images

This document describes how to structure the **Item List** Excel sheet when products have **variations** (e.g. size, strength, volume) that differ in **price** and **images**.

---

## 1. Current vs variation-aware layout

- **Current**: One row = one product (SKU). Each has `Item Id`, `Item Name`, `Retail value`, etc.
- **With variations**: Still **one row per variation** (one row per SKU). Variations are **grouped** and optionally tagged with **variation type** and **value**.

Examples from your data:

| Item Id | Item Name              | Retail value | Notes                          |
|--------|------------------------|--------------|--------------------------------|
| 2112486 | Sevla 400mg            | 49           | Variation: Strength = 400mg    |
| 2112485 | Sevla 800mg            | 69           | Variation: Strength = 800mg    |
| 2115451 | Nestle Fruita Vitals Chaunsa (1 Litre) 12s | 380  | Variation: Volume = 1L   |
| 2115450 | Nestle Fruita Vitals Chaunsa (200ml) 24s  | 79.99 | Variation: Volume = 200ml |

---

## 2. New columns for variations

Add these columns to your Excel sheet. All are **optional**. Use them only when a product has variations.

| Column             | Description | Example values |
|--------------------|-------------|----------------|
| **Product Group Id** | Same value for all variations of one product. Used to group "Sevla 400mg" and "Sevla 800mg" together. | `SEVLA`, `NESTLE_FRUITA_CHAUNSA` |
| **Variation Type**   | What dimension varies: strength, size, volume, pack, etc. | `Strength`, `Size`, `Volume`, `Pack` |
| **Variation Value**  | The specific value for this row. | `400mg`, `1L`, `50ml`, `30 Sachet` |

**Rules:**

- If **Product Group Id** is blank → product is standalone (no variations).
- If you use **Product Group Id**, use **Variation Type** and **Variation Value** for each variation row so the UI can show e.g. "Sevla • 400mg | 800mg".
- **Item Id** stays **unique per row** (per variation). **Retail value**, **Available Qty.**, etc. are **per variation**.

### Example Excel rows

| Product Group Id | Variation Type | Variation Value | Item Id | Item Name | ... | Retail value |
|------------------|----------------|-----------------|---------|-----------|-----|--------------|
| SEVLA            | Strength       | 400mg           | 2112486 | Sevla 400mg | ... | 49           |
| SEVLA            | Strength       | 800mg           | 2112485 | Sevla 800mg | ... | 69           |
|                  |                |                 | 2118298 | Uv-Lite Spf-60 Sunblock... | ... | 2990.05  |

---

## 3. Images per variation

Each variation has its own **Item Id**. Images are stored in object storage as:

```
tenants/{tenant_id}/products/{item_id}/images/{filename}.{ext}
```

So **each variation already has its own folder** (`products/{item_id}/images/`). No change required if you keep using the folder-based flow.

### Option A: Folder-based (recommended)

1. Upload images to `tenants/{tenant_id}/products/{item_id}/images/` (e.g. `1.png`, `2.jpg`).
2. Run `php artisan products:sync-images {tenant_id}`.
3. **No image columns in Excel.** Sync matches by `item_id` and registers images per product (per variation).

### Option B: Image columns in Excel

If you want to **define image object keys in the sheet**, add columns:

| Column   | Description |
|----------|-------------|
| **Image 1** | Full object key, e.g. `tenants/1/products/2112486/images/1.png` |
| **Image 2** | Same format |
| **Image N** | … |

- Use **Image 1**, **Image 2**, … for each variation row.
- Keys must match the path pattern above. Import will create `product_images` records for those keys (and can skip sync for those products if you prefer).

---

## 4. Summary

| Topic | Recommendation |
|-------|----------------|
| **Variations** | One row per variation. Add **Product Group Id**, **Variation Type**, **Variation Value** to group and describe them. |
| **Price** | **Retail value** remains **per row** (per variation). |
| **Images** | Each variation = one `item_id` = one folder. Use **folder-based sync** (Option A), or **Image 1..N** columns (Option B) if you want keys in Excel. |

---

## 5. Backend support

- **Products** table has `product_group_id`, `variation_type`, `variation_value` (all nullable).
- **Import** maps these columns from the Excel when present.
- **API** returns them on product resources so the frontend can group and display variations (e.g. "Sevla" with 400mg / 800mg) and show the correct images per variation.
