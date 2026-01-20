## Backend prompt: make product search extremely fast (Laravel + Postgres)

Goal: change the **list products** endpoint so the frontend can request:

- `GET /api/dashboard/products?page=1&q=mask`
- (also works on store route) `GET /api/products?page=1&q=mask`

…and the backend returns the **same paginated shape** you already use (`data`, `total`, `per_page`, `current_page`, `last_page`, `from`, `to`) but filtered by `q` **server-side**.

This removes the frontend’s “fetch all pages and filter” fallback and makes search fast at scale.

---

### 1) API contract

Add these query params to **List products**:

- `q` (optional string): full-dataset search
- `page` (already supported)
- Optional (recommended): `per_page` (capped), e.g. 15/30/50

Behavior:

- If `q` is empty/missing: return normal paginated list.
- If `q` is present: return paginated list filtered by `q`.
- Keep eager loads: `category`, `images`.

---

### 2) Controller implementation (Laravel)

In your products index handler (typically `ProductController@index`), implement filtering like this:

```php
public function index(Request $request)
{
    $q = trim((string) $request->query('q', ''));
    $perPage = (int) $request->query('per_page', 15);
    $perPage = max(1, min($perPage, 100)); // safety cap

    $query = Product::query()
        ->with(['category', 'images']);

    if ($q !== '') {
        // Normalize whitespace and avoid huge patterns
        $q = preg_replace('/\s+/', ' ', $q);

        // IMPORTANT: use parameter binding; do not string-concatenate into raw SQL.
        $like = '%' . $q . '%';

        $query->where(function ($sub) use ($like) {
            $sub->where('item_id', 'ILIKE', $like)
                ->orWhere('item_name', 'ILIKE', $like)
                ->orWhere('brand', 'ILIKE', $like)
                // Optional: search category name too (requires whereHas join)
                ->orWhereHas('category', function ($cat) use ($like) {
                    $cat->where('category_name', 'ILIKE', $like);
                });
        });
    }

    // Optional: stable ordering (so pagination doesn't "jump")
    $query->orderBy('id', 'desc');

    return $query->paginate($perPage);
}
```

Notes:

- `ILIKE '%term%'` is the common UX expectation (“contains”), but **it needs the right index** (next section) to stay fast.
- If you prefer “starts with” search for maximum speed without trigram, use `ILIKE 'term%'` (prefix) and btree `varchar_pattern_ops` indexes.

---

### 3) Postgres performance (pg_trgm + GIN indexes)

For fast `ILIKE '%term%'` searches, enable **trigram** and add **GIN** trigram indexes.

#### 3.1 Enable extension (once per database)

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

In Laravel migration (requires DB user permission to create extensions):

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    }
    public function down(): void
    {
        // Usually you DO NOT drop extensions in down() in shared DBs.
    }
};
```

If you **cannot** create extensions in your environment (managed DB permissions), skip pg_trgm and use **prefix search** (`term%`) + btree indexes instead (see 3.3).

#### 3.2 Add trigram indexes to products

Migration (run wherever your tenant schemas run migrations):

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Use CONCURRENTLY in production if you have large tables (see note below).
        DB::statement("CREATE INDEX IF NOT EXISTS products_item_id_trgm  ON products USING gin (item_id gin_trgm_ops)");
        DB::statement("CREATE INDEX IF NOT EXISTS products_item_name_trgm ON products USING gin (item_name gin_trgm_ops)");
        DB::statement("CREATE INDEX IF NOT EXISTS products_brand_trgm     ON products USING gin (brand gin_trgm_ops)");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS products_item_id_trgm");
        DB::statement("DROP INDEX IF EXISTS products_item_name_trgm");
        DB::statement("DROP INDEX IF EXISTS products_brand_trgm");
    }
};
```

**Production note**: to avoid blocking writes on huge tables, use `CREATE INDEX CONCURRENTLY ...`.
Laravel migrations run inside a transaction by default; `CONCURRENTLY` is not allowed inside a transaction.
If you need concurrent indexes, create a dedicated migration that disables transactions:

```php
public bool $withinTransaction = false;
```

and then use:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS ...
```

#### 3.3 (Fallback) If pg_trgm not available: prefix search + btree indexes

Change backend to:

- `ILIKE 'term%'` (prefix)

Then add indexes:

```sql
CREATE INDEX IF NOT EXISTS products_item_id_prefix  ON products (item_id varchar_pattern_ops);
CREATE INDEX IF NOT EXISTS products_item_name_prefix ON products (item_name varchar_pattern_ops);
CREATE INDEX IF NOT EXISTS products_brand_prefix     ON products (brand varchar_pattern_ops);
```

This will be very fast, but UX is “starts with”, not “contains”.

---

### 4) Multi-tenancy (schema-per-tenant) considerations

Your app uses `tenant.schema` to set `search_path`. That means:

- The **`pg_trgm` extension** is installed at the **database** level (once).
- The **indexes must exist in each tenant schema’s `products` table**.

So:

- Ensure your tenant migration runner applies the index migration to every tenant schema.
- If you onboard new tenants, make sure their migrations include these indexes.

---

### 5) Verification (quick checklist)

1. **API works**:
   - `GET /api/dashboard/products?q=mask`
   - `GET /api/dashboard/products?q=mask&page=2`
2. **Response shape unchanged** (still paginator JSON).
3. **Explain plan uses index**:
   - Run `EXPLAIN (ANALYZE, BUFFERS)` on a representative query and confirm GIN trigram index usage.
4. **No full table scan** on common searches.

---

### 6) Frontend follow-up (once backend is ready)

After backend supports `q`, the frontend should switch to:

- `GET /products?page=…&q=…` (or dashboard route) and remove the “fetch all pages” fallback.

