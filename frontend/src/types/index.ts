// TypeScript interfaces for the Medical Debt Collection System

export interface Patient {
  id: string;
  residentFirstName: string;
  residentLastName: string;
  dateOfBirth: string;
  balance: number;
  dueDate: string;
  facilityName: string;
  facilityCode: string;
  payerDesc: string;
  contactFirstName: string;
  contactLastName: string;
  contactNumber: string;
  contactEmail: string;
  status: 'active' | 'pending' | 'resolved' | 'inactive';
  priority: 'high' | 'medium' | 'low';
  lastContact: string;
  nextScheduled: string | null;
  totalCalls: number;
  successfulContacts: number;
  paymentArrangements: number;
  notes: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  totalPatients: number;
  contactedPatients: number;
  successfulContacts: number;
  totalCalls: number;
  successRate: number;
  totalRevenue: number;
  averageCallDuration: number;
  targetSegment: string;
  callSchedule: string;
  priority: 'high' | 'medium' | 'low';
  assignedAgents: string[];
  notes: string;
}

export interface CallLog {
  id: string;
  patientId: string;
  patientName: string;
  campaignId: string;
  campaignName: string;
  callDate: string;
  callTime: string;
  duration: number;
  outcome: 'successful' | 'no_answer' | 'busy' | 'disconnected' | 'callback_requested';
  agentNotes: string;
  followUpRequired: boolean;
  nextCallDate: string | null;
  paymentCommitment: number;
  contactNumber: string;
  callType: 'automated' | 'live_agent' | 'callback';
  recording: string | null;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  totalOutstandingBalance: number;
  totalCollected: number;
  callsToday: number;
  successfulContactsToday: number;
  averageCallDuration: number;
  topPerformingCampaign: string;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'call' | 'payment' | 'note' | 'campaign' | 'upload';
  description: string;
  patientId?: string;
  patientName?: string;
  amount?: number;
  status: 'success' | 'failed' | 'pending';
}

export interface UploadHistory {
  id: string;
  filename: string;
  uploadDate: string;
  status: 'completed' | 'processing' | 'failed';
  recordsCount: number;
  validRecords: number;
  errors: string[];
  fileSize: number;
  uploadedBy: string;
}

export interface ReportData {
  period: string;
  totalCalls: number;
  successfulCalls: number;
  totalRevenue: number;
  averageCallDuration: number;
  costPerCall: number;
  roi: number;
  campaignPerformance: CampaignPerformance[];
  dailyStats: DailyStats[];
  paymentTrends: PaymentTrend[];
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  calls: number;
  contacts: number;
  revenue: number;
  successRate: number;
  avgDuration: number;
  cost: number;
  roi: number;
}

export interface DailyStats {
  date: string;
  calls: number;
  contacts: number;
  revenue: number;
  successRate: number;
}

export interface PaymentTrend {
  month: string;
  collected: number;
  outstanding: number;
  newDebts: number;
  resolved: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  status?: string[];
  priority?: string[];
  facility?: string[];
  payerType?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  balanceRange?: {
    min: number;
    max: number;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchFilters {
  query?: string;
  filters?: FilterOptions;
  sort?: SortOptions;
  page?: number;
  limit?: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface SystemConfig {
  maxCallAttempts: number;
  callRetryInterval: number;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  defaultPaymentPlan: {
    installments: number;
    interestRate: number;
  };
  complianceSettings: {
    recordCalls: boolean;
    tcpaCompliance: boolean;
    optOutHonoring: boolean;
  };
}
