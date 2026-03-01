import axios from 'axios';
import { getApiBaseURL } from './baseUrl';

const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000, // 10 seconds
});

// Add token and tenant ID to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Skip request if baseURL is invalid (production without proper env var)
    if (!config.baseURL) {
      return Promise.reject(
        new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.')
      );
    }
    
    // Always include the Tenant ID header for backend schema resolution
    // This is required even for dashboard users when calling public list routes
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || '2';
    config.headers['X-Tenant-Id'] = tenantId;
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (API unreachable)
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.error('API server is unreachable. Check your NEXT_PUBLIC_API_URL configuration.');
      }
      return Promise.reject(error);
    }
    
    // Handle 401 errors (token expired)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // Optional: redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle 404 errors
    if (error.response?.status === 404) {
      console.warn(`API endpoint not found: ${error.config?.url}`);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
