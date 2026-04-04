# Frontend integration notes

## Catalog approval workflow (product manager + pharmacist)

### Roles (`user.role`)

| Value | Dashboard login | Typical UI |
|-------|-----------------|------------|
| `admin` | Yes | Full access |
| `staff` | Yes | Operations (imports, orders, categories, customers, offers, …) |
| `product_manager` | Yes | Create products; edit **all** statuses; on **published** products, detail tabs and images go to **draft/staging** until submitted and approved; submit for review |
| `pharmacist` | Yes | Edit **all** products (live detail tabs and live images on published items); **draft** or **reject** published items; **approve** / **reject** first-publish and revision queues; **no** product **create** (403), **no** **delete** |
| `customer` | Store login | Unchanged |

`POST /api/dashboard/login` accepts all dashboard roles above (not only admin/staff).

### Product lifecycle (`catalog_status`)

| Status | Storefront (`GET /api/products*`) | Meaning |
|--------|-----------------------------------|---------|
| `published` | Visible | Live catalog |
| `draft` | Hidden | PM work in progress |
| `pending_review` | Hidden | Awaiting pharmacist/admin/staff approval |
| `rejected` | Hidden | Sent back; PM edits and resubmits |

Existing/imported products default to `published` so current stores stay live.

### Published revisions (`revision_review_status`)

After first publish, PM edits to **published** products are held in **`detail_sections_draft`** and **staging** images until the PM calls **`submit-for-review`**. The listing stays **`catalog_status: published`**; **`revision_review_status`** becomes **`pending`** until a pharmacist approves (promotes draft → live) or rejects (keeps site on current live content; draft/staging remain for edits).

| `revision_review_status` | Meaning |
|--------------------------|---------|
| `none` | No revision in queue (or cleared after approve) |
| `pending` | Pharmacist should review staged draft + staging images |
| `rejected` | Pharmacist rejected this revision; PM can change draft and resubmit |

**List filter (dashboard):** `GET /api/dashboard/products?revision_review_status=pending`

### Detail tabs: live vs draft

- **`detail_sections`** — **published** copy shown on the public product page (after approval).
- **`detail_sections_draft`** — Staging copy for PM (and for **published** PM edits until approved); compare to live when reviewing.

**Who writes where (same request field `detail_sections`):**

- **Product manager** on **draft**, **rejected**, or **published** → saved to **`detail_sections_draft`** (published stays live until approve).
- **Admin / staff / pharmacist** → saved to **`detail_sections`** (live).

### Images (`product_images`)

- **`is_staging: false`** — live images used on the storefront (`tenants/.../products/{item_id}/images/...`).
- **`is_staging: true`** — staging uploads (`tenants/.../products/{item_id}/staging/images/...`) until **approve** copies them to live and clears staging rows.

Upload routing:

- **Product manager** → always staging.
- **Admin/staff** → staging if product is **not** `published`; if **published**, uploads go to **live** paths (quick fix path).

Public `GET /api/products` and `GET /api/products/{id}` only return **published** products and **non-staging** images.

### List filters (dashboard only)

```
GET /api/dashboard/products?catalog_status=draft
GET /api/dashboard/products?catalog_status=pending_review,rejected
GET /api/dashboard/products?revision_review_status=pending
```

Comma-separated or single value; must be valid status names.

### Workflow endpoints (authenticated)

| Method | Path | Roles |
|--------|------|--------|
| `POST` | `/api/products/{id}/submit-for-review` | admin, staff, product_manager |
| `POST` | `/api/products/{id}/approve` | admin, staff, pharmacist |
| `POST` | `/api/products/{id}/reject` | admin, staff, pharmacist |

Dashboard prefix equivalents:

- `/api/dashboard/products/{id}/submit-for-review`
- `/api/dashboard/products/{id}/approve`
- `/api/dashboard/products/{id}/reject`

**Reject body (optional):**

```json
{ "catalog_rejection_note": "Reason for rejection" }
```

**Approve** — If **`catalog_status` is `pending_review`** (first publication): promotes `detail_sections_draft` → `detail_sections` (if present), promotes staging images to live, sets **`catalog_status`** to **`published`**, clears **`revision_review_status`**.

If **`catalog_status` is already `published`** and **`revision_review_status` is `pending`**: promotes draft + staging to live only; product stays published; **`revision_review_status`** → **`none`**.

**Reject** — First-publish queue: **`catalog_status`** → **`rejected`**. Published revision queue: **`revision_review_status`** → **`rejected`**; live storefront unchanged.

### Routes split summary

- **Admin/staff only:** `POST /products/import`, categories/customers/orders CRUD (as before), dashboard imports, etc.
- **Admin/staff/product_manager:** `POST|PATCH|DELETE /api/products*`, image uploads, submit-for-review.
- **Admin/staff/pharmacist:** approve/reject.

### UI suggestions

- **Product manager:** show products filtered to `draft` + `rejected`; editor reads/writes `detail_sections` in API body (mapped server-side to draft); show staging image previews via `object_key` + `NEXT_PUBLIC_BUCKET_URL` (see `FRONTEND_OBJECT_STORAGE.md`).
- **Pharmacist:** default list filter `catalog_status=pending_review`; review screen shows `detail_sections` (current live) vs `detail_sections_draft` + staging vs live images.
- **Admin:** unrestricted catalog edits; can use import.

### Migrations

Tenant migration adds `catalog_*` columns, `detail_sections_draft`, and `product_images.is_staging`. Run:

```bash
php artisan tenants:migrate
```
