# Frontend integration notes

## Catalog approval workflow (product manager + pharmacist)

### Roles (`user.role`)

| Value | Dashboard login | Typical UI |
|-------|-----------------|------------|
| `admin` | Yes | Full access |
| `staff` | Yes | Operations (imports, orders, categories, customers, offers, …) |
| `product_manager` | Yes | Create/edit **draft** or **rejected** products only; upload **staging** images; edit **draft** detail tabs; submit for review |
| `pharmacist` | Yes | **Read** catalog (all statuses); **approve** / **reject** pending items; **no** product create/update/delete, **no** image uploads |
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

### Detail tabs: live vs draft

- **`detail_sections`** — **published** copy shown on the public product page (after approval).
- **`detail_sections_draft`** — PM (or admin) edits **before** approval; pharmacist should compare draft vs live when reviewing.

**Who writes where (same request field `detail_sections`):**

- **Product manager** on **draft** or **rejected** → saved to **`detail_sections_draft`**.
- **Admin / staff** → saved to **`detail_sections`** (live), subject to workflow rules.

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

**Approve** promotes `detail_sections_draft` → `detail_sections` (if present), replaces live images with promoted staging copies when staging images exist, then sets `catalog_status` to `published`.

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
