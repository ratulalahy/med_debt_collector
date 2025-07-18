// Incoming Calls Management Page
// Tracks incoming calls, customer preferences, callbacks, schedules, and important alerts

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Alert,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  TextareaAutosize,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Phone,
  PhoneCallback,
  Schedule,
  Person,
  Warning,
  CheckCircle,
  Cancel,
  Info,
  CalendarToday,
  Sms,
  VoiceChat,
  Block,
  PriorityHigh,
  Payment,
  SupportAgent,
  NoteAdd,
  Edit,
  Refresh,
  FilterList,
  Search,
  ExpandMore,
  CallReceived,
  CallMissed,
  AccessTime,
  MonetizationOn,
  RecordVoiceOver,
  Message,
} from '@mui/icons-material';
import { formatCurrency, formatDate, formatDateTime, getPriorityColor, getStatusColor } from '../utils';

// Type definitions
interface Alert {
  id: string;
  type: string;
  message: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate: string | null;
}

interface AgentNote {
  id: string;
  timestamp: string;
  agent: string;
  note: string;
  category: 'urgent' | 'positive' | 'warning';
}

interface ScheduledCallback {
  id: string;
  scheduledTime: string;
  reason: string;
  status: string;
}

interface CustomerPreferences {
  preferredContactMethod: string;
  callbackRequested: boolean;
  callbackTime: string | null;
  noCallTimes: string[];
  wantsAgentCall: boolean;
  paymentPlan: boolean;
}

interface IncomingCall {
  id: string;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  callTime: string;
  duration: number;
  callType: string;
  status: string;
  outcome: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  balance: number;
  callNote: string;
  customerPreferences: CustomerPreferences;
  agentNotes: AgentNote[];
  alerts: Alert[];
  scheduledCallbacks: ScheduledCallback[];
}

// Mock data for incoming calls with comprehensive tracking
const mockIncomingCalls: IncomingCall[] = [
  {
    id: 'IC001',
    patientId: '600999',
    patientName: 'John Doe',
    phoneNumber: '+15554181944',
    callTime: '2025-01-09T14:30:00Z',
    duration: 180,
    callType: 'incoming',
    status: 'completed',
    outcome: 'payment_promise',
    priority: 'high',
    balance: 150.75,
    callNote: 'Customer promised to pay $50 by Friday. Prefers SMS reminders.',
    customerPreferences: {
      preferredContactMethod: 'SMS',
      callbackRequested: true,
      callbackTime: '2025-01-12T10:00:00Z',
      noCallTimes: ['morning'],
      wantsAgentCall: false,
      paymentPlan: true
    },
    agentNotes: [
      {
        id: 'N001',
        timestamp: '2025-01-09T14:35:00Z',
        agent: 'AI Agent 001',
        note: 'Customer was cooperative and agreed to payment plan',
        category: 'positive'
      }
    ],
    alerts: [
      {
        id: 'A001',
        type: 'payment_promise',
        message: 'Payment promised for 2025-01-12',
        priority: 'medium',
        dueDate: '2025-01-12T23:59:59Z'
      }
    ],
    scheduledCallbacks: [
      {
        id: 'CB001',
        scheduledTime: '2025-01-12T10:00:00Z',
        reason: 'Follow up on payment promise',
        status: 'scheduled'
      }
    ]
  },
  {
    id: 'IC002',
    patientId: '601000',
    patientName: 'Mary Smith',
    phoneNumber: '+15554181945',
    callTime: '2025-01-09T13:15:00Z',
    duration: 90,
    callType: 'incoming',
    status: 'completed',
    outcome: 'angry_customer',
    priority: 'high',
    balance: 320.50,
    callNote: 'Customer was very upset. Demands to speak to human agent only. Threatened legal action.',
    customerPreferences: {
      preferredContactMethod: 'phone',
      callbackRequested: true,
      callbackTime: '2025-01-10T14:00:00Z',
      noCallTimes: ['evening'],
      wantsAgentCall: true,
      paymentPlan: false
    },
    agentNotes: [
      {
        id: 'N002',
        timestamp: '2025-01-09T13:20:00Z',
        agent: 'AI Agent 002',
        note: 'Customer extremely hostile. Escalate to human agent immediately.',
        category: 'urgent'
      }
    ],
    alerts: [
      {
        id: 'A002',
        type: 'angry_customer',
        message: 'Customer hostile - HUMAN AGENT ONLY',
        priority: 'urgent',
        dueDate: null
      },
      {
        id: 'A003',
        type: 'legal_threat',
        message: 'Customer mentioned legal action',
        priority: 'high',
        dueDate: null
      }
    ],
    scheduledCallbacks: [
      {
        id: 'CB002',
        scheduledTime: '2025-01-10T14:00:00Z',
        reason: 'Escalation to human agent required',
        status: 'scheduled'
      }
    ]
  },
  {
    id: 'IC003',
    patientId: '601001',
    patientName: 'James Brown',
    phoneNumber: '+15554181946',
    callTime: '2025-01-09T11:45:00Z',
    duration: 240,
    callType: 'incoming',
    status: 'completed',
    outcome: 'payment_made',
    priority: 'low',
    balance: 85.25,
    callNote: 'Customer paid full amount over phone. Very satisfied with service.',
    customerPreferences: {
      preferredContactMethod: 'email',
      callbackRequested: false,
      callbackTime: null,
      noCallTimes: [],
      wantsAgentCall: false,
      paymentPlan: false
    },
    agentNotes: [
      {
        id: 'N003',
        timestamp: '2025-01-09T11:50:00Z',
        agent: 'AI Agent 001',
        note: 'Payment successful. Customer very pleased with AI service.',
        category: 'positive'
      }
    ],
    alerts: [
      {
        id: 'A004',
        type: 'payment_received',
        message: 'Full payment received - case closed',
        priority: 'low',
        dueDate: null
      }
    ],
    scheduledCallbacks: []
  },
  {
    id: 'IC004',
    patientId: '601002',
    patientName: 'Sarah Wilson',
    phoneNumber: '+15554181948',
    callTime: '2025-01-09T09:30:00Z',
    duration: 45,
    callType: 'incoming',
    status: 'completed',
    outcome: 'no_contact_request',
    priority: 'medium',
    balance: 200.00,
    callNote: 'Customer requests NO further calls or SMS. Prefers email only. Disputes the charge.',
    customerPreferences: {
      preferredContactMethod: 'email',
      callbackRequested: false,
      callbackTime: null,
      noCallTimes: ['all'],
      wantsAgentCall: false,
      paymentPlan: false
    },
    agentNotes: [
      {
        id: 'N004',
        timestamp: '2025-01-09T09:35:00Z',
        agent: 'AI Agent 002',
        note: 'Customer disputes charge. Added to no-contact list for calls/SMS.',
        category: 'warning'
      }
    ],
    alerts: [
      {
        id: 'A005',
        type: 'no_contact',
        message: 'NO CALLS/SMS - Email only contact',
        priority: 'high',
        dueDate: null
      },
      {
        id: 'A006',
        type: 'dispute',
        message: 'Customer disputes the charge',
        priority: 'medium',
        dueDate: null
      }
    ],
    scheduledCallbacks: []
  }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IncomingCalls: React.FC = () => {
  const [incomingCalls, setIncomingCalls] = useState(mockIncomingCalls);
  const [selectedCall, setSelectedCall] = useState<IncomingCall | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  const filteredCalls = React.useMemo(() => {
    return incomingCalls.filter(call => {
      const matchesStatus = filterStatus === 'all' || call.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || call.priority === filterPriority;
      const matchesOutcome = filterOutcome === 'all' || call.outcome === filterOutcome;
      const matchesSearch = searchTerm === '' || 
        call.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.phoneNumber.includes(searchTerm) ||
        call.callNote.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesPriority && matchesOutcome && matchesSearch;
    });
  }, [incomingCalls, filterStatus, filterPriority, filterOutcome, searchTerm]);

  const handleCallClick = (call: any) => {
    setSelectedCall(call);
    setDetailsOpen(true);
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'payment_promise': return <MonetizationOn sx={{ color: 'success.main' }} />;
      case 'payment_made': return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'angry_customer': return <Warning sx={{ color: 'error.main' }} />;
      case 'no_contact_request': return <Block sx={{ color: 'error.main' }} />;
      case 'callback_requested': return <PhoneCallback sx={{ color: 'info.main' }} />;
      case 'agent_requested': return <SupportAgent sx={{ color: 'warning.main' }} />;
      default: return <Info sx={{ color: 'grey.500' }} />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'payment_promise': return '#4caf50';
      case 'payment_made': return '#2e7d32';
      case 'angry_customer': return '#f44336';
      case 'no_contact_request': return '#d32f2f';
      case 'callback_requested': return '#2196f3';
      case 'agent_requested': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getAlertSeverity = (type: string) => {
    switch (type) {
      case 'angry_customer':
      case 'legal_threat':
      case 'no_contact':
        return 'error';
      case 'payment_promise':
      case 'dispute':
        return 'warning';
      case 'payment_received':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Incoming Calls Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track incoming calls, customer preferences, callback requests, and important alerts
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {incomingCalls.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Calls Today
                  </Typography>
                </Box>
                <CallReceived sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {incomingCalls.filter(c => c.alerts.some(a => a.priority === 'urgent')).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Urgent Alerts
                  </Typography>
                </Box>
                <PriorityHigh sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {incomingCalls.filter(c => c.scheduledCallbacks.length > 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled Callbacks
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {incomingCalls.filter(c => c.outcome === 'payment_made' || c.outcome === 'payment_promise').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment Related
                  </Typography>
                </Box>
                <Payment sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Urgent Alerts Section */}
      {incomingCalls.some(call => call.alerts.some((alert: Alert) => alert.priority === 'urgent' || alert.priority === 'high')) && (
        <Card sx={{ mb: 3, border: '2px solid', borderColor: 'error.main' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PriorityHigh />
              Urgent Alerts & Important Notes
            </Typography>
            <Grid container spacing={2}>
              {incomingCalls
                .filter(call => call.alerts.some((alert: Alert) => alert.priority === 'urgent' || alert.priority === 'high'))
                .map(call => (
                  <Grid item xs={12} md={6} key={call.id}>
                    <Alert 
                      severity={getAlertSeverity(call.alerts[0]?.type)} 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleCallClick(call)}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {call.patientName} - {call.phoneNumber}
                      </Typography>
                      {call.alerts
                        .filter((alert: Alert) => alert.priority === 'urgent' || alert.priority === 'high')
                        .map((alert: Alert) => (
                          <Typography key={alert.id} variant="body2">
                            {alert.message}
                          </Typography>
                        ))}
                    </Alert>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search calls..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="follow_up">Follow Up</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="all">All Priority</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Outcome</InputLabel>
                <Select
                  value={filterOutcome}
                  onChange={(e) => setFilterOutcome(e.target.value)}
                  label="Outcome"
                >
                  <MenuItem value="all">All Outcomes</MenuItem>
                  <MenuItem value="payment_promise">Payment Promise</MenuItem>
                  <MenuItem value="payment_made">Payment Made</MenuItem>
                  <MenuItem value="angry_customer">Angry Customer</MenuItem>
                  <MenuItem value="no_contact_request">No Contact Request</MenuItem>
                  <MenuItem value="callback_requested">Callback Requested</MenuItem>
                  <MenuItem value="agent_requested">Agent Requested</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Incoming Calls Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Outcome</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Alerts</TableCell>
                  <TableCell>Callbacks</TableCell>
                  <TableCell>Preferences</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCalls.map((call) => (
                  <TableRow
                    key={call.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleCallClick(call)}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {formatDateTime(call.callTime)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {call.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {call.phoneNumber}
                        </Typography>
                        <Typography variant="caption" display="block" color="primary.main">
                          {formatCurrency(call.balance)}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {Math.floor(call.duration / 60)}m {call.duration % 60}s
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getOutcomeIcon(call.outcome)}
                        <Chip
                          label={call.outcome.replace('_', ' ')}
                          size="small"
                          sx={{
                            backgroundColor: getOutcomeColor(call.outcome),
                            color: 'white',
                            textTransform: 'capitalize'
                          }}
                        />
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={call.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(call.priority),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Badge badgeContent={call.alerts.length} color="error">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {call.alerts.slice(0, 2).map((alert: Alert) => (
                            <Chip
                              key={alert.id}
                              label={alert.type.replace('_', ' ')}
                              size="small"
                              color={alert.priority === 'urgent' ? 'error' : 'warning'}
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                        </Box>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {call.scheduledCallbacks.map(callback => (
                          <Typography key={callback.id} variant="caption" color="info.main">
                            {formatDateTime(callback.scheduledTime)}
                          </Typography>
                        ))}
                        {call.scheduledCallbacks.length === 0 && (
                          <Typography variant="caption" color="text.secondary">
                            None
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {call.customerPreferences.preferredContactMethod === 'SMS' && (
                          <Tooltip title="Prefers SMS">
                            <Sms sx={{ fontSize: 16, color: 'info.main' }} />
                          </Tooltip>
                        )}
                        {call.customerPreferences.wantsAgentCall && (
                          <Tooltip title="Wants Human Agent">
                            <SupportAgent sx={{ fontSize: 16, color: 'warning.main' }} />
                          </Tooltip>
                        )}
                        {call.customerPreferences.noCallTimes.includes('all') && (
                          <Tooltip title="No Calls Allowed">
                            <Block sx={{ fontSize: 16, color: 'error.main' }} />
                          </Tooltip>
                        )}
                        {call.customerPreferences.paymentPlan && (
                          <Tooltip title="Payment Plan">
                            <Payment sx={{ fontSize: 16, color: 'success.main' }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCallClick(call);
                            }}
                          >
                            <Person />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Add Note">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCall(call);
                              setNoteDialogOpen(true);
                            }}
                          >
                            <NoteAdd />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredCalls.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No incoming calls found matching your criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Call Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <CallReceived />
            </Avatar>
            <Box>
              <Typography variant="h6">Incoming Call Details</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCall?.patientName} - {selectedCall?.callTime ? formatDateTime(selectedCall.callTime) : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Call Summary" />
              <Tab label="Customer Preferences" />
              <Tab label="Alerts & Notes" />
              <Tab label="Scheduled Callbacks" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Call Information</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Call Time</Typography>
                        <Typography variant="body1">{selectedCall?.callTime ? formatDateTime(selectedCall.callTime) : 'N/A'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">
                          {Math.floor((selectedCall?.duration || 0) / 60)}:{((selectedCall?.duration || 0) % 60).toString().padStart(2, '0')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Outcome</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {selectedCall?.outcome && getOutcomeIcon(selectedCall.outcome)}
                          <Typography variant="body1" textTransform="capitalize">
                            {selectedCall?.outcome?.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Patient Information</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Name</Typography>
                        <Typography variant="body1">{selectedCall?.patientName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1">{selectedCall?.phoneNumber}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Balance</Typography>
                        <Typography variant="h6" color="primary.main">
                          {formatCurrency(selectedCall?.balance || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Call Notes</Typography>
                    <Typography variant="body1">
                      {selectedCall?.callNote}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Contact Preferences</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControlLabel
                        control={<Switch checked={selectedCall?.customerPreferences?.preferredContactMethod === 'SMS'} />}
                        label="Prefers SMS"
                        disabled
                      />
                      <FormControlLabel
                        control={<Switch checked={selectedCall?.customerPreferences?.wantsAgentCall} />}
                        label="Wants Human Agent"
                        disabled
                      />
                      <FormControlLabel
                        control={<Switch checked={selectedCall?.customerPreferences?.paymentPlan} />}
                        label="Interested in Payment Plan"
                        disabled
                      />
                      <FormControlLabel
                        control={<Switch checked={selectedCall?.customerPreferences?.callbackRequested} />}
                        label="Callback Requested"
                        disabled
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Communication Restrictions</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Preferred Contact Method</Typography>
                        <Typography variant="body1" textTransform="capitalize">
                          {selectedCall?.customerPreferences?.preferredContactMethod || 'Not specified'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">No Call Times</Typography>
                        <Typography variant="body1">
                          {selectedCall?.customerPreferences?.noCallTimes?.join(', ') || 'None specified'}
                        </Typography>
                      </Box>
                      {selectedCall?.customerPreferences?.callbackTime && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Preferred Callback Time</Typography>
                          <Typography variant="body1">
                            {formatDateTime(selectedCall.customerPreferences.callbackTime)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Active Alerts</Typography>
                {selectedCall?.alerts?.map((alert: any) => (
                  <Alert key={alert.id} severity={getAlertSeverity(alert.type)} sx={{ mb: 2 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {alert.type.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      {alert.message}
                    </Typography>
                    {alert.dueDate && (
                      <Typography variant="caption" color="text.secondary">
                        Due: {formatDateTime(alert.dueDate)}
                      </Typography>
                    )}
                  </Alert>
                ))}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Agent Notes</Typography>
                <List>
                  {selectedCall?.agentNotes?.map((note: any) => (
                    <ListItem key={note.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {note.category === 'urgent' ? (
                          <Warning sx={{ color: 'error.main' }} />
                        ) : note.category === 'positive' ? (
                          <CheckCircle sx={{ color: 'success.main' }} />
                        ) : (
                          <Info sx={{ color: 'info.main' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={note.note}
                        secondary={`${note.agent} - ${formatDateTime(note.timestamp)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Scheduled Callbacks</Typography>
                {selectedCall?.scheduledCallbacks && selectedCall.scheduledCallbacks.length > 0 ? (
                  <List>
                    {selectedCall.scheduledCallbacks.map((callback) => (
                      <ListItem key={callback.id}>
                        <ListItemIcon>
                          <Schedule sx={{ color: 'info.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={formatDateTime(callback.scheduledTime)}
                          secondary={callback.reason}
                        />
                        <Chip
                          label={callback.status}
                          size="small"
                          color={callback.status === 'scheduled' ? 'primary' : 'default'}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No scheduled callbacks
                  </Typography>
                )}
              </Grid>
            </Grid>
          </TabPanel>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<NoteAdd />}>
            Add Note
          </Button>
          <Button variant="contained" startIcon={<Schedule />}>
            Schedule Callback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Agent Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            // Add note logic here
            setNoteDialogOpen(false);
            setNewNote('');
          }}>
            Add Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncomingCalls;
