import axios from 'axios';

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
    if (error.response?.status === 422) {
      // Laravel validation errors
      const firstError = Object.values(error.response.data.errors || {})[0];
      return Array.isArray(firstError) ? firstError[0] : (error.response.data.message || 'Validation error');
    }
    return error.response?.data?.message || 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
