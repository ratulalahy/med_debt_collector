// Utility functions for the Medical Debt Collection System

// Date formatting utilities (using native JavaScript Date)
export const formatDate = (date: string | Date, formatString: string = 'MM/dd/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    // Simple format mapping
    if (formatString === 'MM/dd/yyyy') {
      return `${month}/${day}/${year}`;
    } else if (formatString === 'MM/dd/yyyy HH:mm') {
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    } else if (formatString === 'HH:mm') {
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    return dateObj.toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MM/dd/yyyy HH:mm');
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

export const getRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days ago`;
    return `In ${Math.abs(diffDays)} days`;
  } catch (error) {
    return 'Invalid Date';
  }
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    return `$${amount.toFixed(2)}`;
  }
};

// Number formatting
export const formatNumber = (num: number, decimals: number = 0): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  } catch (error) {
    return num.toString();
  }
};

export const formatPercentage = (num: number, decimals: number = 1): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num / 100);
  } catch (error) {
    return `${num.toFixed(decimals)}%`;
  }
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid US phone number
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4');
  }
  
  return phone; // Return original if not a standard format
};

// String utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned) && cleaned.length >= 10;
};

export const isValidSSN = (ssn: string): boolean => {
  const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
  return ssnRegex.test(ssn);
};

// Data processing utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = (item[key] as unknown as string) || 'Other';
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterBy = <T>(array: T[], filters: Record<string, any>): T[] => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      
      const itemValue = (item as any)[key];
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      if (typeof value === 'string') {
        return itemValue.toString().toLowerCase().includes(value.toLowerCase());
      }
      
      return itemValue === value;
    });
  });
};

// File utilities
export const getFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

export const isExcelFile = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return ['xlsx', 'xls', 'csv'].includes(extension);
};

// URL utilities
export const generateQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Color utilities
export const getStatusColor = (status?: string): string => {
  if (!status) {
    return '#9e9e9e'; // Default color for undefined/null/empty status
  }

  const colors: Record<string, string> = {
    active: '#4caf50',
    pending: '#ff9800',
    resolved: '#2196f3',
    inactive: '#9e9e9e',
    high: '#f44336',
    medium: '#ff9800',
    low: '#4caf50',
    successful: '#4caf50',
    failed: '#f44336',
    completed: '#4caf50',
    processing: '#ff9800',
    draft: '#9e9e9e',
    paused: '#ff9800'
  };
  
  return colors[status.toLowerCase()] || '#9e9e9e';
};

export const getPriorityColor = (priority?: string): string => {
  if (!priority) {
    return '#9e9e9e'; // Default color for undefined/null/empty priority
  }

  const colors: Record<string, string> = {
    high: '#f44336',
    medium: '#ff9800',
    low: '#4caf50'
  };
  
  return colors[priority.toLowerCase()] || '#9e9e9e';
};

// Local storage utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const getLocalStorage = (key: string, defaultValue: any = null): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage:', error);
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Calculate statistics
export const calculateStats = (values: number[]) => {
  if (values.length === 0) return { sum: 0, average: 0, min: 0, max: 0, count: 0 };
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return { sum, average, min, max, count: values.length };
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const cloned: any = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  return obj;
};

export default {
  formatDate,
  formatDateTime,
  formatTime,
  getRelativeDate,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  capitalizeFirst,
  capitalizeWords,
  truncateText,
  isValidEmail,
  isValidPhoneNumber,
  isValidSSN,
  groupBy,
  sortBy,
  filterBy,
  getFileSize,
  getFileExtension,
  isExcelFile,
  generateQueryString,
  getStatusColor,
  getPriorityColor,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  debounce,
  calculateStats,
  generateId,
  deepClone
};
