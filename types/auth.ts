export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  tenant_id: number;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  schema_name: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  tenant: Tenant;
}

export interface UserResponse {
  user: User;
  tenant: Tenant;
}
