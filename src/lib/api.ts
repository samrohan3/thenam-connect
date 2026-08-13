import axios from 'axios';

// Get token from localStorage if exists
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
    const activeRole = typeof window !== 'undefined' ? localStorage.getItem('activeRole') : null;
    
    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (activeRole) {
        config.headers['X-Active-Role'] = activeRole;
      }
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (error.config && !error.config.url?.includes('/auth/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
