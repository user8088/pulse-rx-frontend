import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseURL } from './baseUrl';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
const RETRYABLE_ERROR_CODES = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ERR_NETWORK', 'ERR_HTTP2_PROTOCOL_ERROR'];

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 15000, // 15 seconds
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

// Handle errors with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;

    // Check if we should retry
    const shouldRetry =
      config &&
      (config._retryCount ?? 0) < MAX_RETRIES &&
      (shouldRetryBasedOnStatus(error) || shouldRetryBasedOnCode(error));

    if (shouldRetry) {
      config._retryCount = (config._retryCount ?? 0) + 1;

      console.warn(
        `API request failed (${error.message}). Retrying (${config._retryCount}/${MAX_RETRIES})...`,
        `URL: ${config.url}`
      );

      // Exponential backoff delay
      const delay = RETRY_DELAY * Math.pow(2, (config._retryCount ?? 1) - 1);

      await new Promise((resolve) => setTimeout(resolve, delay));

      return apiClient.request(config);
    }

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

// Helper functions to determine if retry is appropriate
function shouldRetryBasedOnStatus(error: AxiosError): boolean {
  const status = error.response?.status;
  return status !== undefined && RETRYABLE_STATUS_CODES.includes(status);
}

function shouldRetryBasedOnCode(error: AxiosError): boolean {
  const code = error.code;
  return code !== null && RETRYABLE_ERROR_CODES.includes(code);
}

export default apiClient;
