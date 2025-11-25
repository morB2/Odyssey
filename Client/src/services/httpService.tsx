import axios, { type AxiosInstance } from 'axios';
import { useUserStore } from '../store/userStore';
// import { useNavigate } from 'react-router-dom';
const baseURL = import.meta.env.VITE_API_URL;
const BASE_URL = baseURL ? `${baseURL}` : 'http://localhost:3000';
// const navigate = useNavigate();
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
      // navigate('/401');
    }
    return Promise.reject(error);
  }
);

export default api;
