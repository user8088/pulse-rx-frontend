'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Tenant } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import { customerAuthApi } from '@/lib/api/customerAuth';
import type { CustomerProfile } from '@/lib/api/customerAuth';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  customerProfile: CustomerProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_TOKEN = 'demo_token_123';

function makeDemoUser(overrides?: Partial<User>): User {
  return {
    id: 1,
    name: 'Pulse Demo User',
    email: 'demo@pulserx.com',
    role: 'customer',
    tenant_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

const DEMO_TENANT: Tenant = {
  id: 1,
  name: 'Pulse RX Pharmacy',
  slug: 'pulserx',
  status: 'active',
  schema_name: 'tenant_1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function isNetworkError(err: unknown): boolean {
  const e = err as { response?: unknown; message?: string };
  return !e.response || (!!e.message && e.message.includes('Network Error'));
}

function storeToken(t: string) {
  if (typeof window !== 'undefined') localStorage.setItem('auth_token', t);
}
function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyDemo = useCallback((overrides?: Partial<User>) => {
    setUser(makeDemoUser(overrides));
    setTenant(DEMO_TENANT);
    setToken(DEMO_TOKEN);
    storeToken(DEMO_TOKEN);
  }, []);

  const loadUserData = useCallback(async (authToken: string) => {
    try {
      if (authToken === DEMO_TOKEN) {
        applyDemo({ name: 'Pulse Admin', email: 'admin@pulserxpharmacy.com', role: 'admin' });
        setLoading(false);
        return;
      }

      // Try customer profile first (storefront customer tokens)
      try {
        const profile = await customerAuthApi.getProfile();
        setCustomerProfile(profile);
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: 'customer',
          tenant_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setTenant(DEMO_TENANT);
        setToken(authToken);
        return;
      } catch {
        // Not a customer token, try generic auth
      }

      const { user: u, tenant: t } = await authApi.me();
      setUser(u);
      setTenant(t);
      setToken(authToken);
    } catch (error: unknown) {
      const err = error as { response?: { status: number; data: unknown }; message: string };
      if (err.response) {
        console.error('Failed to load user data:', err.response.status, err.response.data);
      } else if (err.message && !err.message.includes('API URL is not configured')) {
        console.warn('API request failed:', err.message);
      }
      clearToken();
      setToken(null);
      setUser(null);
      setTenant(null);
      setCustomerProfile(null);
    } finally {
      setLoading(false);
    }
  }, [applyDemo]);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (storedToken) {
      loadUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, [loadUserData]);

  const login = async (email: string, password: string) => {
    try {
      const res = await customerAuthApi.login(email, password);
      storeToken(res.token);
      setToken(res.token);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: 'customer',
        tenant_id: res.user.tenant_id,
        created_at: res.user.created_at,
        updated_at: res.user.updated_at,
      });
      setCustomerProfile(res.customer);
      setTenant(DEMO_TENANT);
    } catch (error: unknown) {
      if (isNetworkError(error)) {
        console.warn('Backend not detected. Enabling demo mode for preview...');
        applyDemo({ email });
        return;
      }
      throw error;
    }
  };

  const register = async (data: Record<string, string>) => {
    try {
      const res = await customerAuthApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword || data.password_confirmation || data.password,
        phone: data.phone,
      });
      storeToken(res.token);
      setToken(res.token);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: 'customer',
        tenant_id: res.user.tenant_id,
        created_at: res.user.created_at,
        updated_at: res.user.updated_at,
      });
      setCustomerProfile(res.customer);
      setTenant(DEMO_TENANT);
    } catch (error: unknown) {
      if (isNetworkError(error)) {
        console.warn('Backend not detected. Enabling demo mode for signup...');
        applyDemo({ name: data.name || 'Pulse Demo User', email: data.email || 'demo@pulserx.com' });
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setToken(null);
      setUser(null);
      setTenant(null);
      setCustomerProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        customerProfile,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
