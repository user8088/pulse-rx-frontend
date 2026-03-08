import apiClient from "./client";

export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  discount_percentage?: number | null;
}

export interface CustomerLoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    tenant_id: number;
    created_at: string;
    updated_at: string;
  };
  customer: CustomerProfile;
}

export interface CustomerRegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  gender?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export const customerAuthApi = {
  login: async (
    email: string,
    password: string
  ): Promise<CustomerLoginResponse> => {
    const { data } = await apiClient.post<CustomerLoginResponse>(
      "/customer/login",
      { email, password }
    );
    return data;
  },

  register: async (
    payload: CustomerRegisterData
  ): Promise<CustomerLoginResponse> => {
    const { data } = await apiClient.post<CustomerLoginResponse>(
      "/customer/register",
      payload
    );
    return data;
  },

  getProfile: async (): Promise<CustomerProfile> => {
    const { data } = await apiClient.get<CustomerProfile>(
      "/customer/profile"
    );
    return data;
  },

  updateProfile: async (
    payload: Partial<
      Omit<CustomerProfile, "id" | "email" | "discount_percentage">
    >
  ): Promise<CustomerProfile> => {
    const { data } = await apiClient.put<CustomerProfile>(
      "/customer/profile",
      payload
    );
    return data;
  },
};
