import axios, { type AxiosInstance } from 'axios';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-toastify';

const baseURL = import.meta.env.VITE_API_URL;
const BASE_URL = baseURL ? `${baseURL}` : 'http://localhost:3000';

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
    if (error.response && error.response.status === 403) {
      const clearUser = useUserStore.getState().clearUser;
      clearUser();

      // Show notification to user
      toast.error('Your session has expired. Please log in again.');

      // Redirect to home page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
