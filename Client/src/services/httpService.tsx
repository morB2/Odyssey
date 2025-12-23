import axios, { type AxiosInstance } from 'axios';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL;
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 403) {
        // Log the error for debugging
        console.error('403 Error:', {
          url: error.config?.url,
          message: error.response?.data?.message,
          data: error.response?.data
        });

        // Only logout if it's an authentication error (invalid/expired token)
        const errorMessage = error.response?.data?.message || '';
        if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
          const clearUser = useUserStore.getState().clearUser;
          clearUser();

          // Show notification to user
          toast.error('Your session has expired. Please log in again.');

          // Redirect to home page
          window.location.href = '/';
        } else {
          // For other 403 errors (like authorization), just show a message
          toast.error('You do not have permission to access this resource.');
        }
      } else if (error.response.status === 429) {
        toast.error('Too many requests. Please try again later.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
