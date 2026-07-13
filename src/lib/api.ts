import axios from 'axios';

// Get token from localStorage if exists
const getToken = () => localStorage.getItem('token');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (e.g., redirect to login or clear token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // In a real app, you might want to redirect to login page here, 
      // but usually the auth store handles this gracefully
    }
    return Promise.reject(error);
  }
);

export default api;
