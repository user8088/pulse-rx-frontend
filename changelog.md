# Changelog

## 2026-04-12 — Approve / publish authorization (“This action is unauthorized”)

### Symptom

Bulk or single **Publish** / **Approve** returns **Published 0 of N** with **Example: This action is unauthorized.** (or Laravel’s **403** with the same text). The Next.js app calls the API with the same **Bearer** token as other dashboard actions; **this is not a frontend routing bug** if both `POST /products/{id}/approve` and the optional `POST /dashboard/products/{id}/approve` fallback return 403.

### Frontend behavior

- Server actions use **`postCatalogWorkflow`** in `app/dashboard/(app)/inventory/actions.ts`: tries **`POST /products/{id}/approve`** first, then **`POST /dashboard/products/{id}/approve`** only on 403/404/405 from the first call.
- **Bulk approve** runs the same approve request once per selected id. Each call must be authorized by the backend.

### Backend changes required (Laravel / API)

1. **`ProductPolicy` (or gate) for `approve` / `update` / `review`**

   - Ensure **`pharmacist`** (and **`admin`** / **`staff`** if they should publish) is **explicitly allowed** to run the action that handles **`POST /products/{id}/approve`**.
   - Laravel often uses `$this->authorize('approve', $product)` or `Gate::authorize('approve', $product)`. If **`approve`** is missing from the policy or defaults to `false`, the API returns **403** with *This action is unauthorized.*

2. **Route middleware**

   - Confirm the route group for **`/api/.../products/{product}/approve`** (or your prefix) uses middleware that attaches the authenticated user and **does not** restrict roles to `admin` only.

3. **Same user as list**

   - If **`GET /dashboard/products`** works but **approve** returns 403, the policy for **read** vs **approve** is inconsistent — grant **`approve`** to the same roles that should publish catalog items.

4. **`reject` and `submit-for-review`**

   - Apply the same role checks for **`POST /products/{id}/reject`** and **`POST /products/{id}/submit-for-review`** so PM/pharmacist flows match product rules.

5. **Bulk / sequential calls**

   - No special “bulk” endpoint is required; the frontend sends **N separate approve requests**. Each must pass authorization.

### Quick policy sketch (illustrative only)

```php
// In ProductPolicy
public function approve(User $user, Product $product): bool
{
    return in_array($user->role, ['pharmacist', 'admin', 'staff'], true);
}
```

Register the policy and ensure the controller calls `authorize('approve', $product)` (or equivalent) and that **`pharmacist`** is included in your role enum / checks.

---

## 2026-04-12 — Product Manager: inventory API & Excel import (fixes 403 Forbidden)

### What was wrong

The inventory page loads data with **`GET /dashboard/products`** (see `app/dashboard/(app)/inventory/page.tsx`). Excel import uses **`POST /products/import`**. If the backend only allows **admin** / **staff** (or **pharmacist**) on those routes, **`product_manager` gets HTTP 403**. The UI then shows an empty list (0 products) and/or a red banner such as **Forbidden** (from the API JSON `message` or from a failed import redirect).

The frontend already allows PMs to use the import button (`canImportProducts`); listing and importing must succeed on the API side.

### Frontend changes

| Change | File |
|--------|------|
| `getProducts` distinguishes **403** from other failures; dedicated banner explains PM needs API access to `GET /dashboard/products` | `app/dashboard/(app)/inventory/page.tsx` |
| Import action: on **403**, redirect with a clear message pointing to this changelog | `app/dashboard/(app)/inventory/actions.ts` |

### Backend changes required

#### 1. `GET /dashboard/products` — allow `product_manager`

- Authorize **`product_manager`** the same way as other roles that may view the dashboard catalog (e.g. **admin**, **staff**), or define a scoped policy that still returns every row the PM is allowed to see (drafts, pending review, published, etc.).
- **Do not** return 403 for this role if they are expected to manage the catalog; otherwise the inventory screen stays empty.

#### 2. `POST /products/import` — allow `product_manager`

- Authorize **`product_manager`** to upload the Excel file.
- **Default new/updated rows to draft workflow**, consistent with manual PM creates:
  - Set **`catalog_status`** to **`draft`** (or **`pending_review`** if your workflow treats bulk upload as “submit for review” in one step — align with product rules).
  - Products must **not** appear on the public storefront until a **pharmacist** approves (same as manually created PM products).

#### 3. Optional: related read endpoints

- If **`GET /categories`** (or any endpoint the inventory page calls for filters) returns **403** for PM, allow read access for building filters and forms.

#### 4. Policy summary

| Endpoint | Role `product_manager` |
|----------|------------------------|
| `GET /dashboard/products` | Allowed (list + filters) |
| `POST /products/import` | Allowed; rows draft / pending per workflow |
| `POST /products` (create) | Already expected for PM — keep `draft` until approval |

---

## 2026-04-12 — PM Staging UX + Pharmacist Diff Review Panel

### Frontend Changes

| Change | File |
|--------|------|
| PM image deletion no longer closes the edit panel — uses `useTransition` + inline result | `ProductTableRow.tsx` |
| Images staged for deletion show red dashed border, grayscale, diagonal strikethrough, "Pending deletion" badge | `ProductTableRow.tsx` |
| New `RevisionDiffPanel` component — shows pharmacist a table of field changes (live vs proposed), staged deletions, new staging images, and draft tabs | `ProductTableRow.tsx` |
| PM edit panel shows violet "Staging mode" banner explaining all edits are staged | `ProductTableRow.tsx` |
| Inline success/error toast inside edit panel (no page-level redirect) | `ProductTableRow.tsx` |
| `stageImageDeletionInline` action returns `{ ok, error }` instead of redirecting | `actions.ts` |
| `ProductImage` type now includes `is_staging_deletion` boolean | `types/product.ts` |
| `Product` type now includes `revision_data` for field-level diff | `types/product.ts` |

### Backend Changes Required

#### 1. `revision_data` field on product response

When the backend stages PM edits (via `PUT /products/{id}`), store the changed fields in a `revision_data` JSON column. Return this column in the product API response so the frontend can display a diff.

**Example response:**
```json
{
  "id": 42,
  "item_name": "Paracetamol 500mg",
  "retail_price_secondary": "120.00",
  "revision_data": {
    "retail_price_secondary": "135.00",
    "brand": "New Brand Name"
  }
}
```

#### 2. `is_staging_deletion` on product images

Add `is_staging_deletion` boolean to the `product_images` table/response. When a PM calls `POST /products/{id}/images/{imageId}/stage-deletion`, set `is_staging_deletion = true`. On approve, hard-delete the image. On reject, clear the flag.

---

## 2026-04-12 — Product Manager Workflow Fixes

### Frontend Changes

| Change | File |
|--------|------|
| PM sees **Save & Submit for Review** instead of Save Product | `ProductTableRow.tsx` |
| PM image delete calls `stage-deletion` endpoint instead of hard DELETE | `ProductTableRow.tsx` |
| PM can keep editing after submitting (removed `rev !== "pending"` guard) | `ProductTableRow.tsx` |
| New `updateProductAndSubmit` action (PUT + submit-for-review in sequence) | `actions.ts` |
| New `stageImageDeletion` action (POST to stage-deletion endpoint) | `actions.ts` |
| Extracted `buildUpdateBody` + `sendProductUpdate` helpers for reuse | `actions.ts` |

### Backend Changes Required

#### 1. New endpoint: `POST /products/{id}/images/{imageId}/stage-deletion`

When a Product Manager "deletes" an image it should NOT be hard-deleted. Instead it should be staged for pharmacist review (same pattern as tab/detail draft edits).

**Expected behavior:**
- Mark the image with `staged_for_deletion = true` (or add it to a `revision_images_to_delete` JSON column on the product).
- The image stays visible in the gallery with a "Pending deletion" indicator.
- When a pharmacist approves the revision (`POST /products/{id}/approve`), the image is actually deleted from storage.
- When a pharmacist rejects, the deletion flag is cleared.

**Request:** `POST /api/dashboard/products/{productId}/images/{imageId}/stage-deletion`
**Auth:** `product_manager`, `admin`, or `staff`.
**Response:** `200 OK` with the updated image object.

**Alternative (simpler) approach:**
- Add `is_staging_deletion` boolean to the `product_images` table.
- The existing `DELETE /products/{id}/images/{imageId}` can check the caller's role:
  - pharmacist/admin/staff → hard delete immediately.
  - product_manager → set `is_staging_deletion = true`.
- The approve endpoint then also processes any images flagged for staged deletion.

#### 2. `POST /products/{id}/submit-for-review` — allow re-submission

**Current behavior (broken):** once `revision_review_status = "pending"`, the PM cannot submit again. The endpoint rejects with "Already pending review".

**Required behavior:** a PM should be able to make further edits and re-submit even while a pending review exists. Each re-submission overwrites the staged draft with the latest changes.

**Changes needed:**
- Remove or relax the guard that prevents submission when `revision_review_status = "pending"`.
- Allow `PUT /products/{id}` followed by `POST /products/{id}/submit-for-review` to succeed even with an existing pending revision.
- The latest draft simply replaces the previous pending draft.

#### 3. `PUT /products/{id}` — verify PM edits always stage when pending

When a PM calls `PUT /products/{id}` on a published product, the backend already stages changes as a draft revision. Verify this works correctly when `revision_review_status` is already `"pending"` — the PUT should update the draft, not fail.

---

## 2026-04-12 — Storefront Data-Fetching Optimization

### Changes

| Change | File |
|--------|------|
| Added `getCachedCategories` using React `cache()` for server-side dedup | `lib/api/categories.ts` |
| Added `getCachedOffers` using React `cache()` for server-side dedup | `lib/api/offers.ts` |
| Layout prefetches categories + offers + subcategories in parallel | `app/(storefront)/layout.tsx` |
| Page reuses cached categories (zero extra API call) | `app/(storefront)/page.tsx` |
| CityProvider accepts `initialCity` prop from server cookie | `lib/context/CityContext.tsx` |
| Boosted staleTime to 5 min, gcTime to 10 min, disabled refetchOnWindowFocus | `components/StoreProviders.tsx` |

### Result

- Eliminated duplicate `/api/categories` call (layout + page used different `per_page`).
- Offers prefetched server-side — no client-side fetch on first paint.
- City query key mismatch fixed — hydrated product data no longer triggers refetch.
- Total API calls on home page first load reduced from ~29 to ~10.
