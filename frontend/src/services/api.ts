// API service for the Medical Debt Collection System
// This will be connected to the backend later

import axios from 'axios';
import { 
  Patient, 
  Campaign, 
  CallLog, 
  DashboardStats, 
  UploadHistory, 
  ReportData,
  ApiResponse,
  PaginatedResponse,
  SearchFilters 
} from '../types';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Patient API
export const patientAPI = {
  getAll: async (filters?: SearchFilters): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get('/patients', { params: filters });
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<Patient>> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  
  create: async (patient: Partial<Patient>): Promise<ApiResponse<Patient>> => {
    const response = await api.post('/patients', patient);
    return response.data;
  },
  
  update: async (id: string, patient: Partial<Patient>): Promise<ApiResponse<Patient>> => {
    const response = await api.put(`/patients/${id}`, patient);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
  
  getCallHistory: async (patientId: string): Promise<ApiResponse<CallLog[]>> => {
    const response = await api.get(`/patients/${patientId}/calls`);
    return response.data;
  },
  
  addNote: async (patientId: string, note: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/patients/${patientId}/notes`, { note });
    return response.data;
  }
};

// Campaign API
export const campaignAPI = {
  getAll: async (filters?: SearchFilters): Promise<PaginatedResponse<Campaign>> => {
    const response = await api.get('/campaigns', { params: filters });
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<Campaign>> => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },
  
  create: async (campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> => {
    const response = await api.post('/campaigns', campaign);
    return response.data;
  },
  
  update: async (id: string, campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> => {
    const response = await api.put(`/campaigns/${id}`, campaign);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
  
  start: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/campaigns/${id}/start`);
    return response.data;
  },
  
  pause: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/campaigns/${id}/pause`);
    return response.data;
  },
  
  stop: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/campaigns/${id}/stop`);
    return response.data;
  }
};

// Call Log API
export const callLogAPI = {
  getAll: async (filters?: SearchFilters): Promise<PaginatedResponse<CallLog>> => {
    const response = await api.get('/call-logs', { params: filters });
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<CallLog>> => {
    const response = await api.get(`/call-logs/${id}`);
    return response.data;
  },
  
  create: async (callLog: Partial<CallLog>): Promise<ApiResponse<CallLog>> => {
    const response = await api.post('/call-logs', callLog);
    return response.data;
  },
  
  update: async (id: string, callLog: Partial<CallLog>): Promise<ApiResponse<CallLog>> => {
    const response = await api.put(`/call-logs/${id}`, callLog);
    return response.data;
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getRecentActivity: async (limit: number = 20): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/dashboard/activity?limit=${limit}`);
    return response.data;
  }
};

// Upload API
export const uploadAPI = {
  uploadFile: async (file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<UploadHistory>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
    
    return response.data;
  },
  
  getHistory: async (): Promise<ApiResponse<UploadHistory[]>> => {
    const response = await api.get('/upload/history');
    return response.data;
  },
  
  getUploadById: async (id: string): Promise<ApiResponse<UploadHistory>> => {
    const response = await api.get(`/upload/${id}`);
    return response.data;
  },
  
  validateFile: async (file: File): Promise<ApiResponse<{ valid: boolean; errors: string[] }>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  }
};

// Reports API
export const reportsAPI = {
  getReportData: async (period: string, campaignId?: string): Promise<ApiResponse<ReportData>> => {
    const params = campaignId ? { period, campaignId } : { period };
    const response = await api.get('/reports', { params });
    return response.data;
  },
  
  exportReport: async (format: 'pdf' | 'excel' | 'csv', period: string, campaignId?: string): Promise<Blob> => {
    const params = { format, period, ...(campaignId && { campaignId }) };
    const response = await api.get('/reports/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
  
  getCampaignComparison: async (campaignIds: string[]): Promise<ApiResponse<any>> => {
    const response = await api.post('/reports/compare', { campaignIds });
    return response.data;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/auth/user');
    return response.data;
  },
  
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// System API
export const systemAPI = {
  getConfig: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/system/config');
    return response.data;
  },
  
  updateConfig: async (config: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/system/config', config);
    return response.data;
  },
  
  getHealth: async (): Promise<ApiResponse<{ status: string; services: any[] }>> => {
    const response = await api.get('/system/health');
    return response.data;
  }
};

export default api;
