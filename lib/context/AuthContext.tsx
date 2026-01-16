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
      const { user, tenant } = await authApi.me();
      setUser(user);
      setTenant(tenant);
      setToken(authToken);
    } catch (error: any) {
      // Only log non-network errors to avoid console spam
      if (error?.response) {
        console.error('Failed to load user data:', error.response.status, error.response.data);
      } else if (error?.message && !error.message.includes('API URL is not configured')) {
        // Silently handle API configuration errors - they're expected in some scenarios
        console.warn('API request failed:', error.message);
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
    } catch (error) {
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
