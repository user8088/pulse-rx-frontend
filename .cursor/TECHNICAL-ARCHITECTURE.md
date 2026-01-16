# Pulse RX Backend - Technical Architecture
### Multi-Tenancy Implementation Documentation

**Last Updated:** January 2026  
**Status:** ✅ Core infrastructure implemented and operational

---

## 1. Implementation Status

✅ **Core multi-tenancy infrastructure is implemented and operational.**

The following components have been built and tested:

---

## 2. Key Components

### 2.1 Models

#### Tenant Model (`app/Models/Tenant.php`)

- Manages tenant metadata (name, slug, schema_name, status, trial_ends_at)
- Stored in `public` schema
- Key methods:
  - `isActive()` - Checks if tenant status is 'active'
  - `isTrialExpired()` - Validates trial expiration

**Schema:**
```php
- id (bigint)
- name (string)
- slug (string, unique)
- schema_name (string, unique)
- status (string, default: 'active')
- trial_ends_at (timestamp, nullable)
- timestamps
```

#### User Model (`app/Models/User.php`)

- Updated with `tenant_id` foreign key
- `tenant()` relationship method
- Each user belongs to exactly one tenant

**Key additions:**
```php
- tenant_id (foreign key to tenants.id)
- tenant() relationship method
```

---

### 2.2 Services

#### SchemaManager (`app/Services/Tenant/SchemaManager.php`)

Handles all PostgreSQL schema operations.

**Methods:**
- `createSchema(string $schemaName): void` - Creates a new PostgreSQL schema
- `dropSchema(string $schemaName): void` - Drops a schema (with CASCADE)
- `schemaExists(string $schemaName): bool` - Checks if schema exists
- `setSearchPath(string $schemaName): void` - Sets PostgreSQL search_path
- `resetSearchPath(): void` - Resets search_path to public

**Usage:**
```php
$schemaManager = app(SchemaManager::class);
$schemaManager->createSchema('tenant_pharmacy_123');
$schemaManager->setSearchPath('tenant_pharmacy_123');
```

#### TenantResolver (`app/Services/Tenant/TenantResolver.php`)

Resolves the active tenant from the authenticated user.

**Methods:**
- `resolveFromUser(): Tenant` - Resolves tenant from authenticated user

**Behavior:**
- Gets authenticated user from `Auth::user()`
- Loads tenant from `user.tenant_id`
- Validates tenant exists
- Validates tenant is active
- Throws exceptions for invalid/inactive tenants

**Exceptions:**
- `AccessDeniedHttpException` - User not authenticated or tenant inactive
- `NotFoundHttpException` - Tenant not found

#### TenantCreator (`app/Services/Tenant/TenantCreator.php`)

Creates new tenants with isolated PostgreSQL schemas.

**Methods:**
- `create(array $data): Tenant` - Creates tenant with schema

**Process:**
1. Generates unique schema name: `tenant_{slug}_{timestamp}`
2. Creates tenant record in `public` schema
3. Creates PostgreSQL schema
4. Runs tenant migrations on new schema
5. All wrapped in database transaction

**Usage:**
```php
$tenantCreator = app(TenantCreator::class);

$tenant = $tenantCreator->create([
    'name' => 'Pharmacy ABC',
]);
// Creates schema: tenant_pharmacy_abc_1736966400
// Runs tenant migrations automatically
```

---

### 2.3 Middleware

#### ResolveTenant (`app/Http/Middleware/ResolveTenant.php`)

Resolves tenant from authenticated user and binds it to the application container.

**Responsibilities:**
- Gets authenticated user
- Resolves tenant using `TenantResolver`
- Validates tenant is active
- Binds tenant to container as `'tenant'`
- Must run before any database queries

**Registration:**
- Alias: `tenant.resolve`
- Registered in `bootstrap/app.php`

#### SetTenantSchema (`app/Http/Middleware/SetTenantSchema.php`)

Sets PostgreSQL `search_path` to tenant's schema.

**Responsibilities:**
- Gets resolved tenant from container
- Executes: `SET search_path TO {tenant.schema_name}, public`
- Must run after `ResolveTenant` middleware

**Registration:**
- Alias: `tenant.schema`
- Registered in `bootstrap/app.php`

**Middleware Registration:**
```php
// bootstrap/app.php
$middleware->alias([
    'tenant.resolve' => \App\Http\Middleware\ResolveTenant::class,
    'tenant.schema' => \App\Http\Middleware\SetTenantSchema::class,
]);
```

---

### 2.4 Console Commands

#### RunTenantMigrations (`app/Console/Commands/RunTenantMigrations.php`)

Runs migrations for all tenants or a specific tenant.

**Command:**
```bash
php artisan tenants:migrate [tenant_id]
```

**Functionality:**
- Iterates all active tenants (or specific tenant if ID provided)
- Sets search_path to tenant schema
- Runs migrations from `database/migrations/tenant/`
- Resets search_path after completion
- Handles errors gracefully

**Usage:**
```bash
# Run migrations for all active tenants
php artisan tenants:migrate

# Run migrations for specific tenant
php artisan tenants:migrate 1
```

---

### 2.5 Helpers

#### TenantHelper (`app/Helpers/TenantHelper.php`)

Static helper methods for accessing tenant context throughout the application.

**Methods:**
- `TenantHelper::current(): ?Tenant` - Get current tenant instance
- `TenantHelper::id(): ?int` - Get current tenant ID
- `TenantHelper::schema(): ?string` - Get current tenant schema name

**Usage:**
```php
$tenant = TenantHelper::current();
$tenantId = TenantHelper::id();
$schemaName = TenantHelper::schema();

// Or via container
$tenant = app('tenant');
```

---

## 3. Usage Guide

### 3.1 Creating a Tenant

```php
use App\Services\Tenant\TenantCreator;

$tenantCreator = app(TenantCreator::class);

$tenant = $tenantCreator->create([
    'name' => 'Pharmacy ABC',
]);
// Creates schema: tenant_pharmacy_abc_{timestamp}
// Runs tenant migrations automatically
// Sets default 14-day trial period
```

### 3.2 Applying Middleware to Routes

```php
// routes/api.php
Route::middleware(['tenant.resolve', 'tenant.schema'])->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    // All queries in these routes use tenant schema
    // No tenant_id filtering needed in models
});
```

### 3.3 Accessing Tenant Context

```php
// In controllers, services, or anywhere in the app
use App\Helpers\TenantHelper;

$tenant = TenantHelper::current();
$tenantId = TenantHelper::id();
$schemaName = TenantHelper::schema();

// Or via container
$tenant = app('tenant');
```

### 3.4 Running Tenant Migrations

```bash
# Run migrations for all active tenants
php artisan tenants:migrate

# Run migrations for specific tenant
php artisan tenants:migrate 1
```

---

## 4. Migration Structure

### 4.1 Global Migrations

**Location:** `database/migrations/global/`

**Purpose:** Platform-level tables (users, tenants, plans, subscriptions)

**Loading:**
- Automatically loaded by `AppServiceProvider::boot()`
- Uses `loadMigrationsFrom()` method

**Running:**
```bash
php artisan migrate
```

**Current Migrations:**
- `create_tenants_table.php`
- `add_tenant_id_to_users_table.php`
- `create_users_table.php` (moved from root)
- Other platform-level migrations

### 4.2 Tenant Migrations

**Location:** `database/migrations/tenant/`

**Purpose:** Business-level tables (products, inventory, orders, customers)

**Running:**
```bash
php artisan tenants:migrate
```

**Execution:**
- Command iterates all active tenants
- Sets search_path to each tenant's schema
- Runs migrations from tenant directory
- Resets search_path after completion

**Note:** All tenant migrations are executed within each tenant's isolated schema context.

---

## 5. Request Flow

### 5.1 Complete Request Lifecycle

```
1. Request arrives
   ↓
2. Authentication middleware (Laravel Sanctum)
   - Validates API token
   - Sets authenticated user
   ↓
3. ResolveTenant middleware (tenant.resolve)
   - Gets authenticated user
   - Loads tenant from user.tenant_id
   - Validates tenant exists
   - Validates tenant is active
   - Binds tenant to container as 'tenant'
   ↓
4. SetTenantSchema middleware (tenant.schema)
   - Gets tenant from container
   - Executes: SET search_path TO {tenant.schema_name}, public
   ↓
5. Controller/Service
   - All Eloquent queries automatically use tenant schema
   - No tenant_id filtering needed in models
   - Complete data isolation per tenant
```

### 5.2 Error Handling

**Invalid User:**
- `AccessDeniedHttpException` - User not authenticated

**Missing Tenant:**
- `NotFoundHttpException` - User has no tenant_id or tenant not found

**Inactive Tenant:**
- `AccessDeniedHttpException` - Tenant status is not 'active'

---

## 6. Database Schema Structure

### 6.1 Public Schema Tables

```
public
├── users
│   ├── id
│   ├── name
│   ├── email
│   ├── password
│   ├── tenant_id (FK → tenants.id)
│   ├── role
│   └── timestamps
│
└── tenants
    ├── id
    ├── name
    ├── slug (unique)
    ├── schema_name (unique)
    ├── status (active/suspended)
    ├── trial_ends_at
    └── timestamps
```

### 6.2 Tenant Schema Structure

Each tenant gets its own schema with isolated tables:

```
tenant_pharmacy_abc_123
├── products (future)
├── inventory (future)
├── orders (future)
├── customers (future)
└── settings (future)
```

**Schema Naming Convention:**
- Format: `tenant_{slug}_{timestamp}`
- Example: `tenant_pharmacy_abc_1736966400`
- Must be unique and PostgreSQL-safe (lowercase, alphanumeric + underscores)

---

## 7. Testing

### 7.1 Test Location

Feature tests: `tests/Feature/TenantResolutionTest.php`

### 7.2 Test Coverage

✅ **Implemented Tests:**
- Tenant resolution from authenticated user
- Tenant binding to container
- Access denial for inactive tenants

### 7.3 Running Tests

```bash
php artisan test tests/Feature/TenantResolutionTest.php
```

### 7.4 Test Setup

Tests use:
- `RefreshDatabase` trait for database isolation
- Mocked `SchemaManager` to avoid real PostgreSQL calls
- Factory-created tenants and users

---

## 8. Important Notes

### 8.1 Critical Requirements

⚠️ **Must Follow:**
- Middleware must run before any model queries
- Always use `TenantHelper` or `app('tenant')` to access tenant context
- Never hardcode tenant IDs or schema names
- Tenant migrations must be in `database/migrations/tenant/` directory
- Schema names follow pattern: `tenant_{slug}_{timestamp}`
- All tenant-specific models must be in tenant schemas (not public)

### 8.2 What Works

✅ **Implemented Features:**
- Automatic tenant resolution from authenticated users
- Schema isolation for all tenant-specific data
- Tenant creation with automatic schema setup
- Migration management across all tenants
- Helper methods for easy tenant context access
- Middleware-based tenant context switching
- Transaction-safe tenant creation

### 8.3 Future Enhancements

🔮 **Planned Features:**
- Subdomain-based tenant resolution (`{tenant}.pulserx.app`)
- Subscription and plan models integration
- Trial expiration enforcement middleware
- Domain mapping for custom domains
- Tenant suspension/reactivation workflows

---

## 9. Code Examples

### 9.1 Creating a Tenant Programmatically

```php
use App\Services\Tenant\TenantCreator;

$tenantCreator = app(TenantCreator::class);

try {
    $tenant = $tenantCreator->create([
        'name' => 'My Pharmacy',
    ]);
    
    // Tenant created with:
    // - Schema: tenant_my_pharmacy_{timestamp}
    // - Status: active
    // - Trial: 14 days from now
    // - Migrations: already run
    
} catch (\Exception $e) {
    // Handle creation failure
}
```

### 9.2 Using Tenant Context in Controllers

```php
use App\Helpers\TenantHelper;
use App\Http\Controllers\Controller;

class ProductController extends Controller
{
    public function index()
    {
        $tenant = TenantHelper::current();
        
        // All queries automatically use tenant schema
        // No need to filter by tenant_id
        $products = Product::all(); // Queries tenant schema
        
        return response()->json([
            'tenant' => $tenant->name,
            'products' => $products,
        ]);
    }
}
```

### 9.3 Using Tenant Context in Services

```php
use App\Helpers\TenantHelper;

class InventoryService
{
    public function getStock()
    {
        $tenantId = TenantHelper::id();
        $schema = TenantHelper::schema();
        
        // All queries use tenant schema automatically
        return Inventory::where('quantity', '>', 0)->get();
    }
}
```

### 9.4 Route Protection

```php
// routes/api.php
use Illuminate\Support\Facades\Route;

// Public routes (no tenant required)
Route::post('/login', [AuthController::class, 'login']);

// Tenant-protected routes
Route::middleware(['auth:sanctum', 'tenant.resolve', 'tenant.schema'])->group(function () {
    Route::apiResource('products', ProductController::class);
    Route::apiResource('orders', OrderController::class);
});
```

---

## 10. Troubleshooting

### 10.1 Common Issues

**Issue: "Tenant not found"**
- Check user has `tenant_id` set
- Verify tenant exists in `tenants` table
- Ensure tenant status is 'active'

**Issue: "Schema does not exist"**
- Run tenant migrations: `php artisan tenants:migrate`
- Verify schema was created during tenant creation
- Check PostgreSQL connection settings

**Issue: "Queries hitting wrong schema"**
- Verify middleware order: `tenant.resolve` before `tenant.schema`
- Check middleware is applied to routes
- Verify `search_path` is set correctly

**Issue: "Migration errors"**
- Ensure migrations are in correct directory (`global/` vs `tenant/`)
- Check PostgreSQL user has CREATE SCHEMA permissions
- Verify database connection is PostgreSQL (not SQLite)

---

## 11. Security Considerations

### 11.1 Data Isolation

- ✅ Complete schema-level isolation
- ✅ No cross-tenant data access possible
- ✅ Middleware enforces tenant context before queries

### 11.2 Access Control

- ✅ Tenant resolution requires authentication
- ✅ Inactive tenants are blocked
- ✅ User must belong to tenant to access data

### 11.3 Best Practices

- Never bypass middleware for tenant-specific routes
- Always use `TenantHelper` instead of direct container access
- Validate tenant status in critical operations
- Use transactions for tenant creation

---

## 12. Performance Considerations

### 12.1 Schema Switching

- PostgreSQL `search_path` is connection-level
- Switching is fast (microseconds)
- No performance impact on queries

### 12.2 Migration Execution

- Tenant migrations run sequentially per tenant
- Consider batching for large tenant counts
- Use `--force` flag in production

### 12.3 Query Performance

- All queries automatically use correct schema
- No additional WHERE clauses needed
- Standard PostgreSQL indexing applies

---

## 13. Maintenance

### 13.1 Adding New Tenant Tables

1. Create migration in `database/migrations/tenant/`
2. Run: `php artisan tenants:migrate`
3. All tenants get the new table automatically

### 13.2 Updating Tenant Schema

1. Create migration in `database/migrations/tenant/`
2. Run: `php artisan tenants:migrate`
3. Changes apply to all active tenants

### 13.3 Creating New Tenants

1. Use `TenantCreator::create()`
2. Schema and migrations handled automatically
3. Default 14-day trial period set

---

## 14. References

- **Architecture Overview:** `.cursor/memory-bank/ARCHITECTURE.md`
- **Test Suite:** `tests/Feature/TenantResolutionTest.php`
- **Laravel Documentation:** https://laravel.com/docs
- **PostgreSQL Schemas:** https://www.postgresql.org/docs/current/ddl-schemas.html
