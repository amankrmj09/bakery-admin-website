import axios from 'axios';

import { toast } from 'sonner';

// Uses the URL from the .env file (VITE_API_BASE_URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response || error.code === 'ERR_NETWORK') {
      toast.error('Backend API is not responding. Please try again later.');
    } else if (error.response.status >= 500) {
      toast.error('Server error occurred. Please try again later.');
    } else if (error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
