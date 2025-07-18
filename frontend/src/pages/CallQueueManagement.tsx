// Call Queue Management Page
// Shows list of patients being called, waiting to be called, with detailed history

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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  LinearProgress,
  Alert,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ExpandMore,
  Phone,
  PhoneCallback,
  Schedule,
  Person,
  History,
  AttachMoney,
  Edit,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  FilterList,
  Search,
  CallMade,
  CallReceived,
  Voicemail,
  Timer,
  PriorityHigh,
  CheckCircle,
  Cancel,
  Warning,
  Info,
} from '@mui/icons-material';
import { formatCurrency, formatDate, formatDateTime, getPriorityColor, getStatusColor } from '../utils';

// Mock data for call queue
const mockCallQueue = [
  {
    id: 'CQ001',
    patientId: '600999',
    patientName: 'John Doe',
    phoneNumber: '+15554181944',
    balance: 150.75,
    priority: 'high',
    status: 'calling',
    queuePosition: 1,
    estimatedCallTime: '2025-01-09T14:30:00Z',
    lastCallAttempt: '2025-01-09T14:15:00Z',
    attempts: 3,
    maxAttempts: 5,
    assignedAgent: 'AI Agent 001',
    callHistory: [
      {
        id: 'CH001',
        date: '2025-01-09T14:15:00Z',
        duration: 180,
        outcome: 'no_answer',
        notes: 'Phone rang but no answer',
        agent: 'AI Agent 001',
        type: 'automated'
      },
      {
        id: 'CH002',
        date: '2025-01-08T16:20:00Z',
        duration: 240,
        outcome: 'successful',
        notes: 'Patient agreed to payment plan',
        agent: 'AI Agent 001',
        type: 'automated',
        paymentCommitment: 50.00
      }
    ],
    patientDetails: {
      dateOfBirth: '1986-03-25',
      facilityName: 'Highland Manor of Elko',
      payerDesc: 'Medicaid Co-Insurance',
      contactEmail: 'jane.doe@email.com',
      dueDate: '2025-05-31'
    }
  },
  {
    id: 'CQ002',
    patientId: '601000',
    patientName: 'Mary Smith',
    phoneNumber: '+15554181945',
    balance: 320.50,
    priority: 'medium',
    status: 'queued',
    queuePosition: 2,
    estimatedCallTime: '2025-01-09T14:45:00Z',
    lastCallAttempt: '2025-01-07T10:30:00Z',
    attempts: 2,
    maxAttempts: 5,
    assignedAgent: 'AI Agent 002',
    callHistory: [
      {
        id: 'CH003',
        date: '2025-01-07T10:30:00Z',
        duration: 150,
        outcome: 'busy',
        notes: 'Line was busy',
        agent: 'AI Agent 002',
        type: 'automated'
      }
    ],
    patientDetails: {
      dateOfBirth: '1975-06-15',
      facilityName: 'Highland Manor of Elko',
      payerDesc: 'NEVADA MEDICAID',
      contactEmail: 'robert.smith@email.com',
      dueDate: '2025-06-30'
    }
  },
  {
    id: 'CQ003',
    patientId: '601001',
    patientName: 'James Brown',
    phoneNumber: '+15554181946',
    balance: 85.25,
    priority: 'low',
    status: 'scheduled',
    queuePosition: 3,
    estimatedCallTime: '2025-01-09T15:00:00Z',
    lastCallAttempt: '2025-01-05T09:15:00Z',
    attempts: 1,
    maxAttempts: 5,
    assignedAgent: 'AI Agent 001',
    callHistory: [
      {
        id: 'CH004',
        date: '2025-01-05T09:15:00Z',
        duration: 300,
        outcome: 'callback_requested',
        notes: 'Patient requested callback after 2 PM',
        agent: 'AI Agent 001',
        type: 'automated'
      }
    ],
    patientDetails: {
      dateOfBirth: '1990-12-01',
      facilityName: 'Highland Manor of Elko',
      payerDesc: 'Medicaid Co-Insurance',
      contactEmail: 'sarah.brown@email.com',
      dueDate: '2025-07-15'
    }
  },
  {
    id: 'CQ004',
    patientId: '601002',
    patientName: 'Lisa Johnson',
    phoneNumber: '+15554181947',
    balance: 275.00,
    priority: 'high',
    status: 'completed',
    queuePosition: null,
    estimatedCallTime: null,
    lastCallAttempt: '2025-01-09T13:45:00Z',
    attempts: 4,
    maxAttempts: 5,
    assignedAgent: 'AI Agent 002',
    callHistory: [
      {
        id: 'CH005',
        date: '2025-01-09T13:45:00Z',
        duration: 420,
        outcome: 'successful',
        notes: 'Payment arrangement made - $100/month for 3 months',
        agent: 'AI Agent 002',
        type: 'automated',
        paymentCommitment: 100.00
      }
    ],
    patientDetails: {
      dateOfBirth: '1982-09-20',
      facilityName: 'Highland Manor of Elko',
      payerDesc: 'Private Insurance',
      contactEmail: 'michael.johnson@email.com',
      dueDate: '2025-08-01'
    }
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

const CallQueueManagement: React.FC = () => {
  const [callQueue, setCallQueue] = useState(mockCallQueue);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('queuePosition');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Debug: Check if utility functions are available
  useEffect(() => {
    console.log('CallQueueManagement component mounted');
    console.log('formatDateTime:', typeof formatDateTime);
    console.log('formatCurrency:', typeof formatCurrency);
    console.log('getStatusColor:', typeof getStatusColor);
    console.log('getPriorityColor:', typeof getPriorityColor);
    console.log('callQueue length:', callQueue.length);
  }, []);

  // Filter and sort queue - simplified version for debugging
  const filteredQueue = React.useMemo(() => {
    try {
      console.log('Filtering queue, original length:', callQueue.length);
      return callQueue.filter(item => {
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
        const matchesSearch = searchTerm === '' || 
          item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phoneNumber.includes(searchTerm);
        return matchesStatus && matchesPriority && matchesSearch;
      });
    } catch (error) {
      console.error('Error filtering queue:', error);
      return [];
    }
  }, [callQueue, filterStatus, filterPriority, searchTerm]);

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  const handleStatusChange = (queueId: string, newStatus: string) => {
    setCallQueue(prev => 
      prev.map(item => 
        item.id === queueId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handlePriorityChange = (queueId: string, newPriority: string) => {
    setCallQueue(prev => 
      prev.map(item => 
        item.id === queueId ? { ...item, priority: newPriority } : item
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calling': return <Phone sx={{ color: 'warning.main' }} />;
      case 'queued': return <Schedule sx={{ color: 'info.main' }} />;
      case 'scheduled': return <Timer sx={{ color: 'primary.main' }} />;
      case 'completed': return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'failed': return <Cancel sx={{ color: 'error.main' }} />;
      default: return <Info sx={{ color: 'grey.500' }} />;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'successful': return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'no_answer': return <PhoneCallback sx={{ color: 'warning.main' }} />;
      case 'busy': return <Phone sx={{ color: 'error.main' }} />;
      case 'callback_requested': return <CallReceived sx={{ color: 'info.main' }} />;
      case 'disconnected': return <Cancel sx={{ color: 'error.main' }} />;
      default: return <Info sx={{ color: 'grey.500' }} />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Call Queue Management
      </Typography>
      
      {/* Debug Info */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Debug: Queue items: {callQueue.length}, Filtered: {filteredQueue.length}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {callQueue.filter(q => q.status === 'calling').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Currently Calling
                  </Typography>
                </Box>
                <Phone sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {callQueue.filter(q => q.status === 'queued').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Queue
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
                  <Typography variant="h6" color="primary.main">
                    {callQueue.filter(q => q.status === 'scheduled').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled
                  </Typography>
                </Box>
                <Timer sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {callQueue.filter(q => q.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Today
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search patients..."
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
                  <MenuItem value="calling">Calling</MenuItem>
                  <MenuItem value="queued">Queued</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
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
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="queuePosition">Queue Position</MenuItem>
                  <MenuItem value="patientName">Patient Name</MenuItem>
                  <MenuItem value="balance">Balance</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="estimatedCallTime">Call Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                sx={{ minWidth: 'auto', p: 1 }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
                fullWidth
              >
                Refresh Queue
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Call Queue Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Attempts</TableCell>
                  <TableCell>Est. Call Time</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQueue.map((item, index) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handlePatientClick(item)}
                  >
                    <TableCell>
                      <Badge
                        badgeContent={item.queuePosition || ''}
                        color={item.status === 'calling' ? 'warning' : 'primary'}
                      >
                        {getStatusIcon(item.status)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {item.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.phoneNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(item.status) || '#9e9e9e',
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={item.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(item.priority) || '#9e9e9e',
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(item.balance)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {item.attempts}/{item.maxAttempts}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(item.attempts / item.maxAttempts) * 100}
                          sx={{ width: 50, height: 4 }}
                        />
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {item.estimatedCallTime 
                          ? formatDateTime(item.estimatedCallTime)
                          : 'N/A'
                        }
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.assignedAgent}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {item.status === 'queued' && (
                          <Tooltip title="Start Call">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(item.id, 'calling');
                              }}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {item.status === 'calling' && (
                          <Tooltip title="Pause Call">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(item.id, 'queued');
                              }}
                            >
                              <Pause />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePatientClick(item);
                            }}
                          >
                            <Person />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredQueue.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No patients found matching your criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedPatient?.patientName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Patient ID: {selectedPatient?.patientId}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Overview" />
              <Tab label="Call History" />
              <Tab label="Patient Details" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Queue Status</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {getStatusIcon(selectedPatient?.status)}
                      <Typography variant="body1" textTransform="capitalize">
                        {selectedPatient?.status}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Queue Position: {selectedPatient?.queuePosition || 'Not in queue'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Call Time: {selectedPatient?.estimatedCallTime 
                        ? formatDateTime(selectedPatient.estimatedCallTime)
                        : 'N/A'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Call Progress</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedPatient?.attempts / selectedPatient?.maxAttempts) * 100}
                        sx={{ flexGrow: 1, height: 8 }}
                      />
                      <Typography variant="body2">
                        {selectedPatient?.attempts}/{selectedPatient?.maxAttempts}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Attempt: {selectedPatient?.lastCallAttempt 
                        ? formatDateTime(selectedPatient.lastCallAttempt)
                        : 'Never'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Account Summary</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Outstanding Balance
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {formatCurrency(selectedPatient?.balance || 0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Priority Level
                        </Typography>
                        <Chip
                          label={selectedPatient?.priority}
                          size="small"
                          sx={{
                            backgroundColor: getPriorityColor(selectedPatient?.priority) || '#9e9e9e',
                            color: 'white',
                            textTransform: 'capitalize'
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <List>
              {selectedPatient?.callHistory?.map((call: any, index: number) => (
                <React.Fragment key={call.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      {getOutcomeIcon(call.outcome)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="bold">
                            {call.outcome.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(call.date)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Duration: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Agent: {call.agent} ({call.type})
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {call.notes}
                          </Typography>
                          {call.paymentCommitment && (
                            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                              Payment Commitment: {formatCurrency(call.paymentCommitment)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < selectedPatient.callHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1">{selectedPatient?.patientName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1">
                      {selectedPatient?.patientDetails?.dateOfBirth 
                        ? formatDate(selectedPatient.patientDetails.dateOfBirth)
                        : 'N/A'
                      }
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                    <Typography variant="body1">{selectedPatient?.phoneNumber}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedPatient?.patientDetails?.contactEmail}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Account Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Facility</Typography>
                    <Typography variant="body1">{selectedPatient?.patientDetails?.facilityName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Payer</Typography>
                    <Typography variant="body1">{selectedPatient?.patientDetails?.payerDesc}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Due Date</Typography>
                    <Typography variant="body1">
                      {selectedPatient?.patientDetails?.dueDate 
                        ? formatDate(selectedPatient.patientDetails.dueDate)
                        : 'N/A'
                      }
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Outstanding Balance</Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatCurrency(selectedPatient?.balance || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Edit />}>
            Edit Patient
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CallQueueManagement;
