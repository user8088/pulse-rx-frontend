# Dynamic Product Details (Excel/CSV from S3)

This feature lets each product page render a dynamic details tab panel from a file stored in object storage, instead of hardcoded tabs.

## What is now supported

- Per-product details file path:
  - `tenants/{tenant_id}/products/{item_id}/descriptions/product_details.xlsx`
  - `tenants/{tenant_id}/products/{item_id}/descriptions/product_details.xls`
  - `tenants/{tenant_id}/products/{item_id}/descriptions/product_details.csv`
- File priority when multiple formats exist for the same product:
  1. `product_details.xlsx`
  2. `product_details.xls`
  3. `product_details.csv`
- Dynamic columns:
  - Row 1 = tab headers
  - Row 2 = tab content
  - Any number of columns is supported.
  - Example:
    - Product A can have `Description`, `Usage`, `Ingredients`
    - Product B can have only `Description`, `Usage`

## Backend behavior

### Sync sources

Product details are synced from S3 by:

1. Automatic sync after product import (`POST /api/products/import` and dashboard equivalent).
2. Manual command:
   - `php artisan products:sync-details`
   - `php artisan products:sync-details {tenant_id}`

### Parsing rules

- Reads active sheet (or CSV equivalent).
- Uses row 1 as headers, row 2 as values.
- Trims header and value text.
- Skips blank header columns.
- Skips columns where row-2 content is blank.
- Generates stable `key` from header (`slug`), with collision handling:
  - `Description`, `Description` => `description`, `description-2`
- Maintains tab order by original column index (`sort_order`).

### Storage in DB (tenant schema)

`products` table now stores:

- `detail_sections` (json, nullable)
- `details_object_key` (string, nullable)
- `details_synced_at` (timestamp, nullable)

If a product previously had detail data but the file no longer exists in S3, backend clears stale detail fields for that product on sync.

## API contract for frontend

## 1) Product detail endpoint (used by product page)

- `GET /api/products/{product}`
- Tenant context is the same as existing product APIs (`X-Tenant-Id` for guest flows or authenticated tenant user).

### Response fields added/available

- `detail_sections`: array of dynamic tab sections
- `details_synced_at`: timestamp when this product detail file was last parsed

Example shape:

```json
{
  "id": 101,
  "item_id": "2112486",
  "item_name": "Example Product",
  "detail_sections": [
    {
      "key": "description",
      "label": "Description",
      "content": "This is a sample description.",
      "sort_order": 0
    },
    {
      "key": "usage",
      "label": "Usage",
      "content": "Take once daily after meal.",
      "sort_order": 1
    },
    {
      "key": "ingredients",
      "label": "Ingredients",
      "content": "Vitamin C, Zinc",
      "sort_order": 2
    }
  ],
  "details_synced_at": "2026-03-31T12:00:00.000000Z"
}
```

## 2) Product list endpoint (card/list pages)

- `GET /api/products`
- For payload efficiency, list response does not include:
  - `detail_sections`
  - `details_synced_at`
- Fetch product details page data from `GET /api/products/{id}`.

## Frontend implementation instructions (important)

The product details panel in your screenshot must be fully dynamic.

Do not hardcode `Description`, `Usage`, `Ingredients`, `Reviews`. Render tabs from API data.

### Rendering rules

1. Read `detail_sections` from `GET /api/products/{id}`.
2. If array exists, sort by `sort_order` ascending.
3. Render each tab:
   - tab id/key = `section.key`
   - tab label = `section.label`
   - tab body = `section.content`
4. Preserve line breaks in content:
   - Use CSS `white-space: pre-wrap`.
5. If `detail_sections` is missing, null, or empty:
   - Show current empty placeholder (e.g. `No description added yet`) OR hide the panel.

### React-style pseudocode

```tsx
const sections = [...(product.detail_sections ?? [])]
  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

if (!sections.length) {
  return <EmptyState text="No description added yet" />;
}

return (
  <Tabs defaultValue={sections[0].key}>
    <TabsList>
      {sections.map((s) => (
        <TabsTrigger key={s.key} value={s.key}>
          {s.label}
        </TabsTrigger>
      ))}
    </TabsList>

    {sections.map((s) => (
      <TabsContent key={s.key} value={s.key}>
        <div style={{ whiteSpace: 'pre-wrap' }}>{s.content}</div>
      </TabsContent>
    ))}
  </Tabs>
);
```

## Content authoring guide (Ops/Admin)

For each tenant product:

1. Prepare a file with:
   - Row 1 headers (tab names), e.g. `Description | Usage | Ingredients`
   - Row 2 values (tab content)
2. Upload to:
   - `tenants/{tenant_id}/products/{item_id}/descriptions/product_details.xlsx` (recommended)
3. Trigger sync:
   - by running product import, or
   - by command `php artisan products:sync-details {tenant_id}`
4. Verify from API:
   - `GET /api/products/{id}` returns `detail_sections`

## Notes

- `details_object_key` is internal and not exposed in product JSON.
- If duplicate headers are used, backend auto-deduplicates keys with suffixes (`-2`, `-3`, ...).
- Keep row-2 content plain text unless and until rich text support is explicitly added.
