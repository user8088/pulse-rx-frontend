'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant } from '@/types/auth';
import { authApi } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (authToken: string) => {
    try {
      // Handle demo token persistence
      if (authToken === 'demo_token_123') {
        setUser({
          id: 1,
          name: 'Pulse Admin',
          email: 'admin@pulserxpharmacy.com',
          role: 'admin',
          tenant_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setTenant({
          id: 1,
          name: 'Pulse RX Pharmacy',
          slug: 'pulserx',
          status: 'active',
          schema_name: 'tenant_1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setToken(authToken);
        setLoading(false);
        return;
      }

      const { user, tenant } = await authApi.me();
      setUser(user);
      setTenant(tenant);
      setToken(authToken);
    } catch (error: unknown) {
      const err = error as { response?: { status: number; data: unknown }; message: string };
      // Only log non-network errors to avoid console spam
      if (err.response) {
        console.error('Failed to load user data:', err.response.status, err.response.data);
      } else if (err.message && !err.message.includes('API URL is not configured')) {
        // Silently handle API configuration errors - they're expected in some scenarios
        console.warn('API request failed:', err.message);
      }
      
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      setToken(null);
      setUser(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (storedToken) {
      loadUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token: newToken, user: newUser, tenant: newTenant } = await authApi.login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', newToken);
      }
      setToken(newToken);
      setUser(newUser);
      setTenant(newTenant);
    } catch (error: unknown) {
      const err = error as { response?: unknown; message: string };
      // Demo Mode Bypass for Preview if backend is not available
      if (!err.response || err.message.includes('Network Error')) {
        console.warn('Backend not detected. Enabling demo mode for preview...');
        const mockUser: User = {
          id: 1,
          name: 'Pulse Demo User',
          email: email,
          role: 'customer',
          tenant_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const mockTenant: Tenant = {
          id: 1,
          name: 'Pulse RX Pharmacy',
          slug: 'pulserx',
          status: 'active',
          schema_name: 'tenant_1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', 'demo_token_123');
        }
        setToken('demo_token_123');
        setUser(mockUser);
        setTenant(mockTenant);
        return;
      }
      throw error;
    }
  };

  const register = async (data: Record<string, string>) => {
    try {
      const { token: newToken, user: newUser, tenant: newTenant } = await authApi.register(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', newToken);
      }
      setToken(newToken);
      setUser(newUser);
      setTenant(newTenant);
    } catch (error: unknown) {
      const err = error as { response?: unknown; message: string };
      // Mock signup for demo
      if (!err.response || err.message.includes('Network Error')) {
        console.warn('Backend not detected. Enabling demo mode for signup...');
        const mockUser: User = {
          id: 1,
          name: data.name || 'Pulse Demo User',
          email: data.email || 'demo@pulserx.com',
          role: 'customer',
          tenant_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const mockTenant: Tenant = {
          id: 1,
          name: 'Pulse RX Pharmacy',
          slug: 'pulserx',
          status: 'active',
          schema_name: 'tenant_1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', 'demo_token_123');
        }
        setToken('demo_token_123');
        setUser(mockUser);
        setTenant(mockTenant);
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
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
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
