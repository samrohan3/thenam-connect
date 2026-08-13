import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  avatar?: string;
  department?: string;
  phone?: string;
}
interface AuthState {
  user: User | null;
  token: string | null;
  activeRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setActiveRole: (role: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  activeRole: typeof window !== 'undefined' ? localStorage.getItem('activeRole') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', credentials);
      const { data } = response.data;
      const token = data.token;
      
      localStorage.setItem('token', token);
      
      let activeRole = data.role;
      if (data.roles && data.roles.length === 1) {
        activeRole = data.roles[0];
        localStorage.setItem('activeRole', activeRole);
      } else if (data.roles && data.roles.length > 1) {
        // We do not set activeRole yet, the user will select it
        activeRole = null;
        localStorage.removeItem('activeRole');
      } else {
        localStorage.setItem('activeRole', activeRole);
      }

      set({ 
        user: data, 
        token, 
        activeRole,
        isAuthenticated: true, 
        isLoading: false 
      });
      return data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { data } = response.data;
      const token = data.token;
      
      localStorage.setItem('token', token);
      
      set({ 
        user: data, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeRole');
    set({ 
      user: null, 
      token: null, 
      activeRole: null,
      isAuthenticated: false 
    });
  },

  setActiveRole: (role: string) => {
    localStorage.setItem('activeRole', role);
    set((state) => ({
      activeRole: role,
      user: state.user ? { ...state.user, role } : null
    }));
  },

  checkAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await api.get('/auth/profile');
      const data = response.data.data;
      
      const storedActiveRole = typeof window !== 'undefined' ? localStorage.getItem('activeRole') : null;
      const activeRole = storedActiveRole || data.role;
      if (!storedActiveRole && data.role) {
         localStorage.setItem('activeRole', data.role);
      }

      set({ 
        user: { ...data, role: activeRole }, 
        activeRole,
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('activeRole');
      set({ 
        user: null, 
        token: null, 
        activeRole: null,
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  }
}));
