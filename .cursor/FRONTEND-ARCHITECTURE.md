# Frontend Architecture Guide
### Multi-Repository Setup with Single Backend

**Backend:** Single Laravel API (pulse-rx-backend)  
**Frontend:** Multiple separate repositories/apps  
**Deployment:** Vercel (recommended)

---

## 1. Architecture Overview

### 1.1 Repository Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    REPOSITORY STRUCTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Backend (Single Repo)                                      │
│  └── pulse-rx-backend/                                      │
│      ├── Laravel API                                        │
│      ├── PostgreSQL (multi-tenant)                          │
│      └── Handles all business logic                          │
│                                                              │
│  Frontend Apps (Separate Repos)                             │
│  ├── pulse-rx-admin/                                        │
│  │   └── Next.js admin dashboard                            │
│  ├── pulse-rx-storefront/                                   │
│  │   └── Next.js public storefront                          │
│  └── pulse-rx-platform-admin/                               │
│      └── Next.js platform admin (optional)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Why Separate Frontend Repos?

- **Independent Deployment:** Each app can be deployed separately
- **Different Teams:** Different teams can work on different apps
- **Different Domains:** Admin and storefront can have different domains
- **Scalability:** Scale each app independently
- **Technology Flexibility:** Use different frameworks if needed (though Next.js recommended)

---

## 2. Backend API Structure

### 2.1 Base URL

All frontend apps connect to the same backend:

```
Production: https://api.pulserx.app/api
Development: https://pulse-rx-backend-dev-aiqyjn.laravel.cloud/api
```

### 2.2 Authentication

**All authenticated requests require:**
- Laravel Sanctum token
- Token in `Authorization: Bearer {token}` header

**Login Endpoint:**
```
POST /api/login
Body: { email, password }
Response: { token, user, tenant }
```

### 2.3 Tenant Resolution

**Important:** The backend automatically resolves the tenant from the authenticated user's `tenant_id`. Frontend apps don't need to pass `tenant_id` in requests.

**How it works:**
1. User logs in → Backend returns token + user (with `tenant_id`)
2. Frontend stores token
3. All subsequent requests include token
4. Backend middleware resolves tenant from user's `tenant_id`
5. Backend sets PostgreSQL `search_path` to tenant's schema
6. All queries automatically scoped to that tenant

---

## 3. Frontend App Types

### 3.1 Admin Dashboard App

**Repository:** `pulse-rx-admin`  
**Purpose:** Store owners manage their business  
**URL:** `admin.pulserx.app` or `pulserx.app/admin`

**Features:**
- Product management
- Inventory management
- Order management
- Customer management
- Store settings
- Reports & analytics

**Authentication:** Required (Laravel Sanctum)

**Example Routes:**
```
/admin/login
/admin/dashboard
/admin/products
/admin/orders
/admin/inventory
/admin/settings
```

### 3.2 Public Storefront App

**Repository:** `pulse-rx-storefront`  
**Purpose:** Customer-facing store  
**URL:** `{tenant-slug}.pulserx.app` or custom domain

**Features:**
- Product catalog
- Shopping cart
- Checkout
- Customer account (optional)
- Search & filters

**Authentication:** Optional (guest checkout supported)

**Example Routes:**
```
/ (homepage)
/products
/products/[id]
/cart
/checkout
/account (if authenticated)
```

### 3.3 Platform Admin App (Optional)

**Repository:** `pulse-rx-platform-admin`  
**Purpose:** Platform owners manage all tenants  
**URL:** `platform.pulserx.app`

**Features:**
- Tenant management
- Subscription management
- System monitoring
- Theme management

**Authentication:** Required (platform admin role)

---

## 4. API Integration Patterns

### 4.1 API Client Setup

**Create a shared API client in each frontend app:**

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://pulse-rx-backend-dev-aiqyjn.laravel.cloud/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 4.2 Authentication API

```typescript
// lib/api/auth.ts
import apiClient from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/login', { email, password });
    return response.data; // { token, user, tenant }
  },

  logout: async () => {
    await apiClient.post('/logout');
    localStorage.removeItem('auth_token');
  },

  me: async () => {
    const response = await apiClient.get('/user');
    return response.data; // { user, tenant }
  },
};
```

### 4.3 Tenant-Scoped API Calls

**Important:** All API calls are automatically tenant-scoped. Never pass `tenant_id` in requests.

```typescript
// lib/api/products.ts
import apiClient from './client';

export const productsApi = {
  // Get all products (automatically scoped to user's tenant)
  getAll: async () => {
    const response = await apiClient.get('/products');
    return response.data;
  },

  // Create product (automatically scoped to user's tenant)
  create: async (data: CreateProductDto) => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  // Update product (automatically scoped to user's tenant)
  update: async (id: number, data: UpdateProductDto) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },
};
```

---

## 5. State Management

### 5.1 Authentication Context

**Each frontend app needs its own auth context:**

```typescript
// lib/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token from storage
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token and load user data
      loadUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = async (token: string) => {
    try {
      const { user, tenant } = await authApi.me();
      setUser(user);
      setTenant(tenant);
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { token, user, tenant } = await authApi.login(email, password);
    localStorage.setItem('auth_token', token);
    setToken(token);
    setUser(user);
    setTenant(tenant);
  };

  const logout = async () => {
    await authApi.logout();
    setToken(null);
    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      tenant,
      token,
      isAuthenticated: !!user,
      login,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 5.2 Protected Routes

```typescript
// components/auth/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 6. Storefront-Specific Considerations

### 6.1 Tenant Resolution for Storefront

**For subdomain-based storefronts** (`{tenant-slug}.pulserx.app`):

```typescript
// middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  // Skip for platform domains
  if (['www', 'admin', 'platform'].includes(subdomain)) {
    return NextResponse.next();
  }

  // Extract tenant slug from subdomain
  const tenantSlug = subdomain;

  // Add tenant context to request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**For public storefront API calls** (no auth required):

```typescript
// lib/api/store.ts
import apiClient from './client';

export const storeApi = {
  // Get tenant by slug (public, no auth)
  getTenantBySlug: async (slug: string) => {
    const response = await apiClient.get(`/store/tenant/${slug}`);
    return response.data;
  },

  // Get products for tenant (public, no auth)
  getProducts: async (slug: string) => {
    const response = await apiClient.get(`/store/${slug}/products`);
    return response.data;
  },
};
```

### 6.2 Custom Domain Support

**If tenant has custom domain** (`mystore.com`):

1. Backend resolves tenant from domain
2. Frontend receives domain in request
3. Frontend calls backend to resolve tenant:

```typescript
// app/layout.tsx (storefront)
import { headers } from 'next/headers';

export default async function StoreLayout({ children }) {
  const headersList = headers();
  const hostname = headersList.get('host') || '';

  // Check if custom domain
  if (!hostname.includes('pulserx.app')) {
    // Resolve tenant from backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/store/resolve-domain?domain=${hostname}`
    );
    const { tenant, theme } = await response.json();
    // Use tenant and theme
  }

  return <>{children}</>;
}
```

---

## 7. Environment Variables

### 7.1 Each Frontend App Needs

```env
# .env.local (for each frontend app)

# Backend API URL
NEXT_PUBLIC_API_URL=https://api.pulserx.app/api

# App-specific config
NEXT_PUBLIC_APP_NAME=Pulse RX Admin
NEXT_PUBLIC_APP_TYPE=admin  # or 'storefront' or 'platform-admin'
```

### 7.2 Vercel Deployment

**For each frontend app on Vercel:**

1. Add environment variables in Vercel dashboard
2. Set `NEXT_PUBLIC_API_URL` to backend URL
3. Deploy each app separately
4. Configure domains per app

---

## 8. Data Fetching Patterns

### 8.1 Server Components (Next.js 13+)

```typescript
// app/products/page.tsx
import { productsApi } from '@/lib/api/products';
import { cookies } from 'next/headers';

export default async function ProductsPage() {
  const token = cookies().get('auth_token')?.value;
  
  // Fetch on server (token from cookie)
  const products = await productsApi.getAll(token);

  return (
    <div>
      <h1>Products</h1>
      <ProductsList products={products} />
    </div>
  );
}
```

### 8.2 Client Components with React Query

```typescript
// components/ProductsList.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';

export function ProductsList() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 9. Error Handling

### 9.1 API Error Handling

```typescript
// utils/errors.ts
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Authentication required. Please log in.';
    }
    if (error.response?.status === 403) {
      return 'Access denied. You do not have permission.';
    }
    if (error.response?.status === 404) {
      return 'Resource not found.';
    }
    return error.response?.data?.message || 'An error occurred';
  }
  
  return 'An unexpected error occurred';
}
```

### 9.2 Error Boundaries

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 10. TypeScript Types

### 10.1 Shared Types

**Each frontend app should define types matching backend responses:**

```typescript
// types/auth.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  tenant_id: number;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
}

export interface AuthResponse {
  token: string;
  user: User;
  tenant: Tenant;
}
```

```typescript
// types/product.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}
```

---

## 11. Deployment Strategy

### 11.1 Separate Deployments

**Each frontend app deploys independently:**

1. **Admin Dashboard:**
   - Repo: `pulse-rx-admin`
   - Vercel Project: `pulse-rx-admin`
   - Domain: `admin.pulserx.app`

2. **Storefront:**
   - Repo: `pulse-rx-storefront`
   - Vercel Project: `pulse-rx-storefront`
   - Domain: `*.pulserx.app` (wildcard for tenant subdomains)

3. **Platform Admin (optional):**
   - Repo: `pulse-rx-platform-admin`
   - Vercel Project: `pulse-rx-platform-admin`
   - Domain: `platform.pulserx.app`

### 11.2 Backend Deployment

**Single backend deployment:**
- Repo: `pulse-rx-backend`
- Server: Your hosting (Laravel Forge, AWS, etc.)
- Domain: `api.pulserx.app`

---

## 12. Key Principles

### 12.1 Backend Handles Tenant Isolation

✅ **Backend automatically:**
- Resolves tenant from authenticated user
- Sets PostgreSQL schema per request
- Scopes all queries to tenant
- Validates tenant status

❌ **Frontend should NOT:**
- Pass `tenant_id` in API requests
- Manage tenant isolation logic
- Store tenant data in multiple places

### 12.2 Authentication is Critical

✅ **Always:**
- Include token in all authenticated requests
- Handle 401 errors (redirect to login)
- Store token securely (httpOnly cookie in production)
- Verify token on app load

### 12.3 API Calls are Tenant-Scoped

✅ **Remember:**
- All API calls automatically scoped to user's tenant
- No need to pass tenant context
- Backend middleware handles everything

---

## 13. Example: Complete Feature Implementation

### 13.1 Products Feature (Admin App)

**1. Types:**
```typescript
// types/product.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
```

**2. API:**
```typescript
// lib/api/products.ts
export const productsApi = {
  getAll: () => apiClient.get<Product[]>('/products'),
  create: (data: CreateProductDto) => apiClient.post<Product>('/products', data),
  update: (id: number, data: UpdateProductDto) => 
    apiClient.put<Product>(`/products/${id}`, data),
};
```

**3. Component:**
```typescript
// app/products/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <ProductsList />
    </ProtectedRoute>
  );
}

function ProductsList() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  return (
    <div>
      <h1>Products</h1>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

---

## 14. Summary

### Architecture Summary

1. **Single Backend:** One Laravel API serves all frontend apps
2. **Multiple Frontends:** Separate repos for admin, storefront, platform-admin
3. **Tenant Isolation:** Backend handles all tenant scoping automatically
4. **Authentication:** Laravel Sanctum tokens, shared across apps
5. **Deployment:** Each app deploys independently to Vercel

### Key Takeaways

- ✅ Backend handles tenant isolation - frontend doesn't need to
- ✅ All API calls are automatically tenant-scoped
- ✅ Each frontend app is independent and can be deployed separately
- ✅ Authentication token is shared (user can access admin and storefront)
- ✅ No need to pass `tenant_id` in API requests

---

## 15. Getting Started

### For Each Frontend App:

1. **Create Next.js app:**
   ```bash
   npx create-next-app@latest pulse-rx-admin
   ```

2. **Install dependencies:**
   ```bash
   npm install axios @tanstack/react-query
   ```

3. **Set up API client:**
   - Create `lib/api/client.ts`
   - Create `lib/api/auth.ts`
   - Create API modules for each resource

4. **Set up authentication:**
   - Create `lib/context/AuthContext.tsx`
   - Create `components/auth/ProtectedRoute.tsx`
   - Wrap app with `AuthProvider`

5. **Configure environment:**
   - Add `NEXT_PUBLIC_API_URL` to `.env.local`
   - Point to backend API URL

6. **Deploy to Vercel:**
   - Connect repo to Vercel
   - Add environment variables
   - Deploy

---

**Remember: The backend handles all tenant isolation. Your frontend apps just need to authenticate users and make API calls with proper tokens.**
