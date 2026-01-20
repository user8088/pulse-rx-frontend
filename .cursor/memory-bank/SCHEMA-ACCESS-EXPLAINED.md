# Schema Access in Multi-Tenant System

## How Different Users Access Different Schemas

### Key Concept: Runtime Schema Switching

**One Database Connection + Dynamic Schema Context = Multi-Tenancy**

---

## 1. Environment Variables (.env)

### Shared Configuration

The `.env` file is **shared by all tenants**. It defines:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pulse_rx_db    # ONE database for ALL tenants
DB_USERNAME=postgres
DB_PASSWORD=secret
```

**Important:** 
- ✅ One database connection
- ✅ One set of credentials
- ✅ All tenants use the same connection
- ❌ No per-tenant .env files needed

---

## 2. How Schema Access Works

### PostgreSQL `search_path` Mechanism

PostgreSQL uses `search_path` to determine which schema to query:

```sql
-- Default (public schema)
SET search_path TO public;
SELECT * FROM users;  -- Queries public.users

-- Tenant schema
SET search_path TO tenant_pharmacy_123;
SELECT * FROM products;  -- Queries tenant_pharmacy_123.products
```

### The Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST ARRIVES                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Authentication (Laravel Sanctum)                         │
│     - Validates API token                                    │
│     - Sets authenticated user                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  2. ResolveTenant Middleware                                 │
│     - Gets user.tenant_id                                    │
│     - Loads Tenant model from public.tenants                 │
│     - Validates tenant is active                             │
│     - Binds tenant to container: app('tenant')               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  3. SetTenantSchema Middleware                               │
│     - Gets tenant from container                            │
│     - Executes: SET search_path TO {tenant.schema_name}      │
│     - Example: SET search_path TO tenant_pharmacy_123        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Controller/Service                                       │
│     - All Eloquent queries automatically use tenant schema   │
│     - Product::all() → queries tenant_pharmacy_123.products │
│     - No tenant_id filtering needed!                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Example: Two Users, Two Schemas

### Scenario

**User A** (admin@pharmacy1.com) belongs to **Tenant 1** (Pharmacy ABC)
- Tenant schema: `tenant_pharmacy_abc_123`

**User B** (admin@pharmacy2.com) belongs to **Tenant 2** (Pharmacy XYZ)
- Tenant schema: `tenant_pharmacy_xyz_456`

### Request from User A

```
1. User A authenticates → Gets token
2. Request with token arrives
3. ResolveTenant middleware:
   - user.tenant_id = 1
   - Loads Tenant(id=1, schema_name='tenant_pharmacy_abc_123')
4. SetTenantSchema middleware:
   - Executes: SET search_path TO tenant_pharmacy_abc_123
5. Product::all() queries tenant_pharmacy_abc_123.products ✅
```

### Request from User B (Same Time, Different Connection)

```
1. User B authenticates → Gets token
2. Request with token arrives (different HTTP connection)
3. ResolveTenant middleware:
   - user.tenant_id = 2
   - Loads Tenant(id=2, schema_name='tenant_pharmacy_xyz_456')
4. SetTenantSchema middleware:
   - Executes: SET search_path TO tenant_pharmacy_xyz_456
5. Product::all() queries tenant_pharmacy_xyz_456.products ✅
```

**Key Point:** Each HTTP request has its own database connection context, so `search_path` is isolated per request.

---

## 4. Database Connection Pooling

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database: pulse_rx_db               │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  public  │  │ tenant_  │  │ tenant_  │                  │
│  │          │  │ pharmacy │  │ pharmacy │                  │
│  │ - users  │  │ _abc_123 │  │ _xyz_456 │                  │
│  │ - tenants│  │          │  │          │                  │
│  │          │  │ - products│ │ - products│                 │
│  │          │  │ - orders  │ │ - orders  │                 │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
         ▲                ▲                ▲
         │                │                │
         └────────────────┴────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                  │
    ┌────▼────┐                       ┌────▼────┐
    │ Request │                       │ Request │
    │  User A │                       │  User B │
    │         │                       │         │
    │ search_ │                       │ search_ │
    │ path =  │                       │ path =  │
    │ tenant_ │                       │ tenant_ │
    │ abc_123 │                       │ xyz_456 │
    └─────────┘                       └─────────┘
```

**Important:**
- Each HTTP request gets its own database connection (or from pool)
- `search_path` is **connection-scoped**, not global
- User A's connection has `search_path = tenant_abc_123`
- User B's connection has `search_path = tenant_xyz_456`
- They don't interfere with each other!

---

## 5. Code Example

### What Happens Behind the Scenes

```php
// User A logs in and makes request
// Middleware runs:

// 1. ResolveTenant middleware
$user = Auth::user(); // user.tenant_id = 1
$tenant = Tenant::find(1); // schema_name = 'tenant_pharmacy_abc_123'
app()->instance('tenant', $tenant);

// 2. SetTenantSchema middleware
DB::statement("SET search_path TO tenant_pharmacy_abc_123, public");

// 3. Controller code
$products = Product::all(); 
// This query becomes:
// SELECT * FROM tenant_pharmacy_abc_123.products
// NOT: SELECT * FROM public.products
```

### The Magic

**You write:**
```php
Product::all()
```

**PostgreSQL executes:**
```sql
SELECT * FROM tenant_pharmacy_abc_123.products
```

**No tenant_id filtering needed!** The schema isolation handles it automatically.

---

## 6. Why This Works

### PostgreSQL Connection Isolation

1. **Each HTTP request = New connection (or pooled)**
   - Laravel manages connection pooling
   - Each request gets isolated connection context

2. **`search_path` is connection-scoped**
   - Setting it for one connection doesn't affect others
   - Each user's request has its own connection

3. **Middleware runs before any queries**
   - Schema is set before controller code executes
   - All subsequent queries use the correct schema

---

## 7. Accessing Public Schema

### When You Need Platform Data

Even when tenant schema is active, you can still access public schema:

```php
// Tenant schema is active (tenant_pharmacy_abc_123)
$products = Product::all(); // Uses tenant schema

// But you can still access public schema explicitly:
$allTenants = DB::table('public.tenants')->get();
// Or
$allTenants = Tenant::all(); // Model always uses public schema
```

**Note:** Models in the `public` schema (like `Tenant`, `User`) always query `public` schema regardless of `search_path`.

---

## 8. Summary

### Environment Variables
- ✅ **Shared** - One `.env` file for all tenants
- ✅ **One database connection** - All tenants use same DB
- ✅ **Same credentials** - No per-tenant config needed

### Schema Access
- ✅ **Runtime switching** - Schema changes per request
- ✅ **User-based** - Schema determined by `user.tenant_id`
- ✅ **Automatic** - Middleware handles it
- ✅ **Isolated** - Each request has its own connection context

### The Result
- ✅ **Complete data isolation** - Tenants can't see each other's data
- ✅ **No code changes needed** - Models work automatically
- ✅ **Scalable** - Add tenants without code changes
- ✅ **Secure** - Schema-level isolation enforced by database

---

## 9. Common Questions

**Q: Do I need different .env files for each tenant?**
A: No! One `.env` file, one database connection, multiple schemas.

**Q: How do users get different schemas?**
A: Middleware reads `user.tenant_id`, loads tenant, sets `search_path` to tenant's schema.

**Q: Can users see each other's data?**
A: No! Each user's queries run in their tenant's isolated schema.

**Q: What if two users from different tenants make requests at the same time?**
A: Each request gets its own connection with its own `search_path`. They're completely isolated.

**Q: How do I access public schema when tenant schema is active?**
A: Use fully qualified table names (`public.tenants`) or models that explicitly use public schema.
