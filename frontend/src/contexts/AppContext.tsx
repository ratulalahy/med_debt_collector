// Global state context for the Medical Debt Collection System
// This provides app-wide state management

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Patient, Campaign, DashboardStats, ActivityItem } from '../types';

// State interface
interface AppState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  dashboardStats: DashboardStats | null;
  recentActivity: ActivityItem[];
  selectedPatient: Patient | null;
  selectedCampaign: Campaign | null;
  notifications: Notification[];
  filters: {
    patients: any;
    campaigns: any;
  };
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    currency: string;
    dateFormat: string;
  };
}

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  dashboardStats: null,
  recentActivity: [],
  selectedPatient: null,
  selectedCampaign: null,
  notifications: [],
  filters: {
    patients: {},
    campaigns: {}
  },
  preferences: {
    theme: 'light',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  }
};

// Action types
type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_DASHBOARD_STATS'; payload: DashboardStats }
  | { type: 'SET_RECENT_ACTIVITY'; payload: ActivityItem[] }
  | { type: 'SET_SELECTED_PATIENT'; payload: Patient | null }
  | { type: 'SET_SELECTED_CAMPAIGN'; payload: Campaign | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_FILTERS'; payload: { type: 'patients' | 'campaigns'; filters: any } }
  | { type: 'SET_PREFERENCES'; payload: Partial<AppState['preferences']> }
  | { type: 'RESET_STATE' };

// Notification interface
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

// Reducer function
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    
    case 'SET_RECENT_ACTIVITY':
      return { ...state, recentActivity: action.payload };
    
    case 'SET_SELECTED_PATIENT':
      return { ...state, selectedPatient: action.payload };
    
    case 'SET_SELECTED_CAMPAIGN':
      return { ...state, selectedCampaign: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      };
    
    case 'REMOVE_NOTIFICATION':
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { 
          ...state.filters, 
          [action.payload.type]: action.payload.filters 
        } 
      };
    
    case 'SET_PREFERENCES':
      return { 
        ...state, 
        preferences: { ...state.preferences, ...action.payload } 
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: 'SET_PREFERENCES', payload: preferences });
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
  }, [state.preferences]);

  // Check for authentication token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      // TODO: Validate token with backend
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Action creators (helper functions)
export const actions = {
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING' as const, payload: loading }),
  setError: (error: string | null) => ({ type: 'SET_ERROR' as const, payload: error }),
  setUser: (user: any) => ({ type: 'SET_USER' as const, payload: user }),
  setAuthenticated: (authenticated: boolean) => ({ type: 'SET_AUTHENTICATED' as const, payload: authenticated }),
  setDashboardStats: (stats: DashboardStats) => ({ type: 'SET_DASHBOARD_STATS' as const, payload: stats }),
  setRecentActivity: (activity: ActivityItem[]) => ({ type: 'SET_RECENT_ACTIVITY' as const, payload: activity }),
  setSelectedPatient: (patient: Patient | null) => ({ type: 'SET_SELECTED_PATIENT' as const, payload: patient }),
  setSelectedCampaign: (campaign: Campaign | null) => ({ type: 'SET_SELECTED_CAMPAIGN' as const, payload: campaign }),
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => ({
    type: 'ADD_NOTIFICATION' as const,
    payload: {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }
  }),
  removeNotification: (id: string) => ({ type: 'REMOVE_NOTIFICATION' as const, payload: id }),
  setFilters: (type: 'patients' | 'campaigns', filters: any) => ({
    type: 'SET_FILTERS' as const,
    payload: { type, filters }
  }),
  setPreferences: (preferences: Partial<AppState['preferences']>) => ({
    type: 'SET_PREFERENCES' as const,
    payload: preferences
  }),
  resetState: () => ({ type: 'RESET_STATE' as const })
};

// Custom hooks for specific functionality
export const useAuth = () => {
  const { state, dispatch } = useApp();
  
  const login = async (email: string, password: string) => {
    dispatch(actions.setLoading(true));
    try {
      // TODO: Replace with actual API call
      // const response = await authAPI.login(email, password);
      // localStorage.setItem('auth_token', response.data.token);
      // dispatch(actions.setUser(response.data.user));
      dispatch(actions.setAuthenticated(true));
    } catch (error) {
      dispatch(actions.setError('Login failed. Please try again.'));
    } finally {
      dispatch(actions.setLoading(false));
    }
  };
  
  const logout = async () => {
    dispatch(actions.setLoading(true));
    try {
      // TODO: Replace with actual API call
      // await authAPI.logout();
      localStorage.removeItem('auth_token');
      dispatch(actions.setUser(null));
      dispatch(actions.setAuthenticated(false));
      dispatch(actions.resetState());
    } catch (error) {
      dispatch(actions.setError('Logout failed. Please try again.'));
    } finally {
      dispatch(actions.setLoading(false));
    }
  };
  
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout
  };
};

export const useNotifications = () => {
  const { state, dispatch } = useApp();
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    dispatch(actions.addNotification(newNotification));
    
    // Auto-remove notification after duration
    if (notification.autoClose !== false) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        dispatch(actions.removeNotification(newNotification.id));
      }, duration);
    }
  };
  
  const removeNotification = (id: string) => {
    dispatch(actions.removeNotification(id));
  };
  
  return {
    notifications: state.notifications,
    addNotification,
    removeNotification
  };
};

export const useFilters = () => {
  const { state, dispatch } = useApp();
  
  const setPatientFilters = (filters: any) => {
    dispatch(actions.setFilters('patients', filters));
  };
  
  const setCampaignFilters = (filters: any) => {
    dispatch(actions.setFilters('campaigns', filters));
  };
  
  return {
    patientFilters: state.filters.patients,
    campaignFilters: state.filters.campaigns,
    setPatientFilters,
    setCampaignFilters
  };
};

export default AppContext;
