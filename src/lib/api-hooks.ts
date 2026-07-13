import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// --- Finance Hooks ---

export const useFinanceSummary = () => {
  return useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      const res = await api.get('/finance/summary');
      return res.data.data;
    }
  });
};

export const useTransactions = (params?: { venture?: string, type?: string }) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const res = await api.get('/finance/transactions', { params });
      return res.data.data;
    }
  });
};

export const useAddRevenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/finance/money-in', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    }
  });
};

export const useRecordExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/finance/money-out', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    }
  });
};

export const useTransferFunds = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (data: any) => {
        const res = await api.post('/finance/transfer', data);
        return res.data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      }
    });
};

// --- Dashboard Hooks ---

export const useDashboardStats = () => {
    return useQuery({
      queryKey: ['dashboard-stats'],
      queryFn: async () => {
        const res = await api.get('/dashboard/stats');
        return res.data.data;
      }
    });
};

// --- Venture Hooks ---

export const useVentures = () => {
    return useQuery({
        queryKey: ['ventures'],
        queryFn: async () => {
            const res = await api.get('/ventures');
            return res.data.data;
        }
    });
};

export const useCreateVenture = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/ventures', data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ventures'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });
};

// --- Employee Hooks ---

export const useEmployees = (params?: { venture?: string }) => {
    return useQuery({
        queryKey: ['employees', params],
        queryFn: async () => {
            const res = await api.get('/employees', { params });
            return res.data.data;
        }
    });
};

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/employees', data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });
};

// --- Project Hooks ---

export const useProjects = (params?: { venture?: string }) => {
    return useQuery({
        queryKey: ['projects', params],
        queryFn: async () => {
            const res = await api.get('/projects', { params });
            return res.data.data;
        }
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/projects', data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });
};

// --- Task Hooks ---

export const useTasks = (params?: { venture?: string, project?: string }) => {
    return useQuery({
        queryKey: ['tasks', params],
        queryFn: async () => {
            const res = await api.get('/tasks', { params });
            return res.data.data;
        }
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/tasks', data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });
};

// --- Reward Hooks ---

export const useRewards = (params?: { employee?: string }) => {
    return useQuery({
        queryKey: ['rewards', params],
        queryFn: async () => {
            const res = await api.get('/rewards', { params });
            return res.data.data;
        }
    });
};

// --- Setting Hooks ---

export const useSettings = () => {
    return useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            return res.data.data;
        }
    });
};
