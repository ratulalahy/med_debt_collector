// Mock data for the Medical Debt Collection System

export const mockPatients = [
  {
    id: '600999',
    residentFirstName: 'John',
    residentLastName: 'Doe',
    dateOfBirth: '1986-03-25',
    balance: 150.75,
    dueDate: '2025-05-31',
    facilityName: 'Highland Manor of Elko Rehabilitation- SNF',
    facilityCode: '27',
    payerDesc: 'Medicaid Co-Insurance',
    contactFirstName: 'Jane',
    contactLastName: 'Doe',
    contactNumber: '+15554181944',
    contactEmail: 'jane.doe@email.com',
    status: 'active',
    priority: 'high',
    lastContact: '2025-01-08',
    nextScheduled: '2025-01-10',
    totalCalls: 5,
    successfulContacts: 3,
    paymentArrangements: 1,
    notes: 'Responsive to calls, payment plan established'
  },
  {
    id: '601000',
    residentFirstName: 'Mary',
    residentLastName: 'Smith',
    dateOfBirth: '1975-06-15',
    balance: 320.50,
    dueDate: '2025-06-30',
    facilityName: 'Highland Manor of Elko Rehabilitation- SNF',
    facilityCode: '27',
    payerDesc: 'NEVADA MEDICAID',
    contactFirstName: 'Robert',
    contactLastName: 'Smith',
    contactNumber: '+15554181945',
    contactEmail: 'robert.smith@email.com',
    status: 'active',
    priority: 'medium',
    lastContact: '2025-01-07',
    nextScheduled: '2025-01-12',
    totalCalls: 3,
    successfulContacts: 2,
    paymentArrangements: 0,
    notes: 'Requested payment plan options'
  },
  {
    id: '601001',
    residentFirstName: 'James',
    residentLastName: 'Brown',
    dateOfBirth: '1990-12-01',
    balance: 85.25,
    dueDate: '2025-07-15',
    facilityName: 'Highland Manor of Elko Rehabilitation- SNF',
    facilityCode: '27',
    payerDesc: 'Medicaid Co-Insurance',
    contactFirstName: 'Sarah',
    contactLastName: 'Brown',
    contactNumber: '+15554181946',
    contactEmail: 'sarah.brown@email.com',
    status: 'pending',
    priority: 'low',
    lastContact: '2025-01-05',
    nextScheduled: '2025-01-15',
    totalCalls: 2,
    successfulContacts: 1,
    paymentArrangements: 0,
    notes: 'Initial contact made, follow-up scheduled'
  },
  {
    id: '601002',
    residentFirstName: 'Lisa',
    residentLastName: 'Johnson',
    dateOfBirth: '1982-09-20',
    balance: 275.00,
    dueDate: '2025-08-01',
    facilityName: 'Highland Manor of Elko Rehabilitation- SNF',
    facilityCode: '27',
    payerDesc: 'Private Insurance',
    contactFirstName: 'Michael',
    contactLastName: 'Johnson',
    contactNumber: '+15554181947',
    contactEmail: 'michael.johnson@email.com',
    status: 'resolved',
    priority: 'low',
    lastContact: '2025-01-03',
    nextScheduled: null,
    totalCalls: 4,
    successfulContacts: 4,
    paymentArrangements: 1,
    notes: 'Payment completed successfully'
  },
  {
    id: '601003',
    residentFirstName: 'David',
    residentLastName: 'Wilson',
    dateOfBirth: '1978-04-12',
    balance: 450.75,
    dueDate: '2025-04-30',
    facilityName: 'Highland Manor of Elko Rehabilitation- SNF',
    facilityCode: '27',
    payerDesc: 'Medicare',
    contactFirstName: 'Linda',
    contactLastName: 'Wilson',
    contactNumber: '+15554181948',
    contactEmail: 'linda.wilson@email.com',
    status: 'active',
    priority: 'high',
    lastContact: '2025-01-09',
    nextScheduled: '2025-01-11',
    totalCalls: 7,
    successfulContacts: 5,
    paymentArrangements: 2,
    notes: 'Multiple payment arrangements, good communication'
  }
];

export const mockCampaigns = [
  {
    id: 'camp-001',
    name: 'January 2025 Collection Drive',
    description: 'Monthly collection campaign for overdue accounts',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    totalPatients: 150,
    callsCompleted: 89,
    callsScheduled: 61,
    successRate: 68.5,
    collectionRate: 42.3,
    totalRecovered: 12450.75,
    averageCallDuration: 185, // seconds
    priority: 'high',
    agentType: 'debt_collection',
    createdBy: 'admin',
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'camp-002',
    name: 'Payment Reminder Campaign',
    description: 'Gentle reminders for upcoming due dates',
    status: 'scheduled',
    startDate: '2025-01-15',
    endDate: '2025-01-25',
    totalPatients: 85,
    callsCompleted: 0,
    callsScheduled: 85,
    successRate: 0,
    collectionRate: 0,
    totalRecovered: 0,
    averageCallDuration: 0,
    priority: 'medium',
    agentType: 'payment_reminder',
    createdBy: 'admin',
    createdAt: '2025-01-08T10:00:00Z'
  },
  {
    id: 'camp-003',
    name: 'Follow-up Campaign',
    description: 'Follow-up calls for partial payments',
    status: 'completed',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    totalPatients: 120,
    callsCompleted: 120,
    callsScheduled: 0,
    successRate: 75.2,
    collectionRate: 55.8,
    totalRecovered: 18750.25,
    averageCallDuration: 210,
    priority: 'medium',
    agentType: 'follow_up',
    createdBy: 'admin',
    createdAt: '2024-12-01T09:00:00Z'
  }
];

export const mockCallLogs = [
  {
    id: 'call-001',
    patientId: '600999',
    patientName: 'John Doe',
    contactNumber: '+15554181944',
    callDate: '2025-01-09T10:30:00Z',
    duration: 185,
    outcome: 'payment_arranged',
    status: 'completed',
    agentType: 'debt_collection',
    campaignId: 'camp-001',
    notes: 'Patient agreed to payment plan of $50/month',
    transcript: 'Hello, this is calling regarding your medical debt...',
    cost: 0.12,
    satisfaction: 4.2
  },
  {
    id: 'call-002',
    patientId: '601000',
    patientName: 'Mary Smith',
    contactNumber: '+15554181945',
    callDate: '2025-01-09T11:15:00Z',
    duration: 95,
    outcome: 'no_answer',
    status: 'completed',
    agentType: 'debt_collection',
    campaignId: 'camp-001',
    notes: 'Voicemail left, will retry tomorrow',
    transcript: 'This call went to voicemail...',
    cost: 0.08,
    satisfaction: null
  },
  {
    id: 'call-003',
    patientId: '601001',
    patientName: 'James Brown',
    contactNumber: '+15554181946',
    callDate: '2025-01-09T14:45:00Z',
    duration: 240,
    outcome: 'information_requested',
    status: 'completed',
    agentType: 'customer_service',
    campaignId: 'camp-001',
    notes: 'Patient requested payment options information',
    transcript: 'Patient inquired about available payment methods...',
    cost: 0.15,
    satisfaction: 4.5
  },
  {
    id: 'call-004',
    patientId: '601002',
    patientName: 'Lisa Johnson',
    contactNumber: '+15554181947',
    callDate: '2025-01-09T16:20:00Z',
    duration: 320,
    outcome: 'payment_completed',
    status: 'completed',
    agentType: 'debt_collection',
    campaignId: 'camp-001',
    notes: 'Full payment received via credit card',
    transcript: 'Payment processed successfully...',
    cost: 0.18,
    satisfaction: 4.8
  }
];

export const mockReports = {
  dailyStats: {
    date: '2025-01-09',
    totalCalls: 456,
    successfulCalls: 312,
    paymentArrangements: 89,
    totalRecovered: 2450.75,
    averageDuration: 185,
    topPerformingCampaign: 'January 2025 Collection Drive',
    callsByHour: [
      { hour: '8:00', calls: 15 },
      { hour: '9:00', calls: 28 },
      { hour: '10:00', calls: 45 },
      { hour: '11:00', calls: 52 },
      { hour: '12:00', calls: 38 },
      { hour: '13:00', calls: 41 },
      { hour: '14:00', calls: 48 },
      { hour: '15:00', calls: 56 },
      { hour: '16:00', calls: 63 },
      { hour: '17:00', calls: 47 },
      { hour: '18:00', calls: 23 }
    ]
  },
  weeklyStats: {
    week: 'Jan 6-12, 2025',
    totalCalls: 2840,
    successfulCalls: 1952,
    paymentArrangements: 568,
    totalRecovered: 15420.50,
    callsByDay: [
      { day: 'Mon', calls: 420, success: 290 },
      { day: 'Tue', calls: 456, success: 312 },
      { day: 'Wed', calls: 398, success: 275 },
      { day: 'Thu', calls: 445, success: 301 },
      { day: 'Fri', calls: 412, success: 285 },
      { day: 'Sat', calls: 385, success: 260 },
      { day: 'Sun', calls: 324, success: 229 }
    ]
  },
  monthlyStats: {
    month: 'January 2025',
    totalCalls: 8520,
    successfulCalls: 5856,
    paymentArrangements: 1704,
    totalRecovered: 48750.25,
    callsByWeek: [
      { week: 'Week 1', calls: 2180, success: 1526 },
      { week: 'Week 2', calls: 2840, success: 1952 },
      { week: 'Week 3', calls: 2250, success: 1575 },
      { week: 'Week 4', calls: 1250, success: 803 }
    ]
  }
};

export const mockDashboardStats = {
  totalOutstanding: 2547890.75,
  activePatients: 1234,
  callsToday: 456,
  collectionRate: 68.5,
  successfulContacts: 312,
  paymentArrangements: 89,
  totalRecoveredToday: 2450.75,
  averageCallDuration: 185,
  topPerformingAgent: 'debt_collection',
  recentActivity: [
    {
      time: '10:30 AM',
      action: 'Call completed',
      patient: 'John Doe',
      outcome: 'Payment arranged',
      status: 'success',
      amount: '$50.00'
    },
    {
      time: '10:15 AM',
      action: 'Call attempted',
      patient: 'Jane Smith',
      outcome: 'No answer',
      status: 'warning',
      amount: null
    },
    {
      time: '9:45 AM',
      action: 'Payment received',
      patient: 'Bob Johnson',
      outcome: 'Full payment',
      status: 'success',
      amount: '$150.00'
    },
    {
      time: '9:30 AM',
      action: 'Call completed',
      patient: 'Mary Wilson',
      outcome: 'Information requested',
      status: 'info',
      amount: null
    },
    {
      time: '9:15 AM',
      action: 'Campaign started',
      patient: 'Payment Reminder Campaign',
      outcome: '85 patients scheduled',
      status: 'info',
      amount: null
    }
  ]
};

export const mockUploadHistory = [
  {
    id: 'upload-001',
    fileName: 'patient_data_jan_2025.xlsx',
    uploadDate: '2025-01-08T09:00:00Z',
    fileSize: 245760,
    totalRecords: 150,
    validRecords: 147,
    errorRecords: 3,
    duplicates: 2,
    status: 'processed',
    processedBy: 'admin',
    errors: [
      { row: 45, field: 'contact_number', message: 'Invalid phone number format' },
      { row: 67, field: 'date_of_birth', message: 'Invalid date format' },
      { row: 89, field: 'balance', message: 'Invalid amount format' }
    ]
  },
  {
    id: 'upload-002',
    fileName: 'december_collections.csv',
    uploadDate: '2025-01-01T10:30:00Z',
    fileSize: 189440,
    totalRecords: 120,
    validRecords: 118,
    errorRecords: 2,
    duplicates: 1,
    status: 'processed',
    processedBy: 'admin',
    errors: [
      { row: 23, field: 'resident_id', message: 'Duplicate resident ID' },
      { row: 56, field: 'due_date', message: 'Date in past' }
    ]
  }
];

// Helper functions for mock data
export const getPatientById = (id: string) => {
  return mockPatients.find(patient => patient.id === id);
};

export const getCampaignById = (id: string) => {
  return mockCampaigns.find(campaign => campaign.id === id);
};

export const getCallLogsByPatientId = (patientId: string) => {
  return mockCallLogs.filter(call => call.patientId === patientId);
};

export const getCallLogsByCampaignId = (campaignId: string) => {
  return mockCallLogs.filter(call => call.campaignId === campaignId);
};

export const searchPatients = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return mockPatients.filter(patient => 
    patient.residentFirstName.toLowerCase().includes(lowercaseQuery) ||
    patient.residentLastName.toLowerCase().includes(lowercaseQuery) ||
    patient.contactFirstName.toLowerCase().includes(lowercaseQuery) ||
    patient.contactLastName.toLowerCase().includes(lowercaseQuery) ||
    patient.id.includes(query)
  );
};

export const filterPatientsByStatus = (status: string) => {
  return mockPatients.filter(patient => patient.status === status);
};

export const filterPatientsByPriority = (priority: string) => {
  return mockPatients.filter(patient => patient.priority === priority);
};

export const getTodaysCallStats = () => {
  const today = new Date().toISOString().split('T')[0];
  const todaysCalls = mockCallLogs.filter(call => 
    call.callDate.split('T')[0] === today
  );
  
  return {
    totalCalls: todaysCalls.length,
    successfulCalls: todaysCalls.filter(call => call.outcome !== 'no_answer').length,
    paymentArrangements: todaysCalls.filter(call => 
      call.outcome === 'payment_arranged' || call.outcome === 'payment_completed'
    ).length,
    totalCost: todaysCalls.reduce((sum, call) => sum + call.cost, 0),
    averageDuration: todaysCalls.reduce((sum, call) => sum + call.duration, 0) / todaysCalls.length || 0
  };
};
