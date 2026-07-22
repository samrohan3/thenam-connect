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

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.put('/settings', data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        }
    });
};

// --- User & Profile Hooks ---

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/auth/users');
            return res.data.data;
        }
    });
};

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.put('/auth/profile', data);
            return res.data.data;
        }
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.put('/auth/password', data);
            return res.data.data;
        }
    });
};

// --- Additional Task & Project Hooks ---

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await api.put(`/tasks/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });
};

export const useUpdateTaskStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await api.patch(`/tasks/${id}/status`, { status });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await api.put(`/projects/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });
};

// --- Additional Dashboard Hooks ---

export const useDashboardCharts = () => {
    return useQuery({
        queryKey: ['dashboard-charts'],
        queryFn: async () => {
            const res = await api.get('/dashboard/charts');
            return res.data.data;
        }
    });
};

export const useRecentActivities = () => {
    return useQuery({
        queryKey: ['recent-activities'],
        queryFn: async () => {
            const res = await api.get('/dashboard/recent');
            return res.data.data;
        }
    });
};

// --- Notification Hooks ---

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/notifications');
            return res.data.data;
        }
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await api.patch(`/notifications/${id}/read`);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};

