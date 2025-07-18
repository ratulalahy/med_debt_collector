// Calendar & Scheduling Management Page
// Comprehensive scheduling system for appointments, follow-ups, tasks, and deadlines

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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  CalendarToday,
  Schedule,
  Event,
  Person,
  Phone,
  Payment,
  Warning,
  CheckCircle,
  Cancel,
  Info,
  Add,
  Edit,
  Delete,
  Refresh,
  FilterList,
  Search,
  ExpandMore,
  Today,
  ViewWeek,
  ViewDay,
  ViewModule,
  Alarm,
  Assignment,
  PhoneCallback,
  MonetizationOn,
  Gavel,
  NotificationImportant,
  AccessTime,
  PriorityHigh,
  PlayArrow,
  Pause,
  Done,
  Undo,
  Business,
  Campaign,
  Analytics,
  QuestionAnswer,
} from '@mui/icons-material';
import { formatCurrency, formatDate, formatDateTime, getPriorityColor, getStatusColor } from '../utils';
import VisualCalendar from '../components/VisualCalendar';

// Mock data for calendar events and tasks
const mockCalendarEvents = [
  {
    id: 'CAL001',
    title: 'Follow-up Call - John Doe',
    type: 'follow_up_call',
    date: '2025-01-09',
    time: '14:30',
    duration: 30,
    status: 'scheduled',
    priority: 'high',
    patientId: '600999',
    patientName: 'John Doe',
    phoneNumber: '+15554181944',
    balance: 150.75,
    description: 'Follow up on payment promise made yesterday',
    createdBy: 'AI Agent 001',
    assignedTo: 'AI Agent 001',
    isRecurring: false,
    reminderSet: true,
    reminderTime: 15, // minutes before
    category: 'customer_contact',
    outcome: null,
    notes: '',
    relatedCallId: 'IC001'
  },
  {
    id: 'CAL002',
    title: 'Payment Due - Mary Smith',
    type: 'payment_due',
    date: '2025-01-10',
    time: '09:00',
    duration: 0,
    status: 'pending',
    priority: 'urgent',
    patientId: '601000',
    patientName: 'Mary Smith',
    phoneNumber: '+15554181945',
    balance: 320.50,
    description: 'Payment due date - escalate if not received',
    createdBy: 'System',
    assignedTo: 'Human Agent',
    isRecurring: false,
    reminderSet: true,
    reminderTime: 60,
    category: 'payment_deadline',
    outcome: null,
    notes: 'Customer was hostile in last call - handle with care',
    relatedCallId: 'IC002'
  },
  {
    id: 'CAL003',
    title: 'Weekly Team Meeting',
    type: 'team_meeting',
    date: '2025-01-10',
    time: '10:00',
    duration: 60,
    status: 'scheduled',
    priority: 'medium',
    patientId: null,
    patientName: null,
    phoneNumber: null,
    balance: null,
    description: 'Weekly debt collection team standup and strategy review',
    createdBy: 'Admin',
    assignedTo: 'All Agents',
    isRecurring: true,
    recurringPattern: 'weekly',
    reminderSet: true,
    reminderTime: 30,
    category: 'internal_meeting',
    outcome: null,
    notes: 'Discuss difficult cases and new strategies',
    relatedCallId: null
  },
  {
    id: 'CAL004',
    title: 'Legal Review - James Brown Case',
    type: 'legal_review',
    date: '2025-01-11',
    time: '15:00',
    duration: 45,
    status: 'scheduled',
    priority: 'high',
    patientId: '601001',
    patientName: 'James Brown',
    phoneNumber: '+15554181946',
    balance: 85.25,
    description: 'Review case for potential legal action',
    createdBy: 'Supervisor',
    assignedTo: 'Legal Team',
    isRecurring: false,
    reminderSet: true,
    reminderTime: 120,
    category: 'legal_action',
    outcome: null,
    notes: 'Multiple failed payment attempts - consider legal options',
    relatedCallId: null
  },
  {
    id: 'CAL005',
    title: 'Campaign Review - Q1 Strategy',
    type: 'campaign_review',
    date: '2025-01-12',
    time: '11:00',
    duration: 90,
    status: 'scheduled',
    priority: 'medium',
    patientId: null,
    patientName: null,
    phoneNumber: null,
    balance: null,
    description: 'Review Q1 campaign performance and plan Q2',
    createdBy: 'Manager',
    assignedTo: 'Campaign Team',
    isRecurring: false,
    reminderSet: true,
    reminderTime: 60,
    category: 'strategy_planning',
    outcome: null,
    notes: 'Analyze conversion rates and optimize messaging',
    relatedCallId: null
  },
  {
    id: 'CAL006',
    title: 'Patient Callback - Sarah Wilson',
    type: 'callback_appointment',
    date: '2025-01-12',
    time: '14:00',
    duration: 20,
    status: 'confirmed',
    priority: 'medium',
    patientId: '601002',
    patientName: 'Sarah Wilson',
    phoneNumber: '+15554181948',
    balance: 200.00,
    description: 'Patient requested callback to discuss payment options',
    createdBy: 'AI Agent 002',
    assignedTo: 'Human Agent',
    isRecurring: false,
    reminderSet: true,
    reminderTime: 30,
    category: 'customer_contact',
    outcome: null,
    notes: 'Patient prefers email communication but agreed to this call',
    relatedCallId: 'IC004'
  }
];

const mockTasks = [
  {
    id: 'TASK001',
    title: 'Update payment plan templates',
    type: 'administrative',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2025-01-11',
    assignedTo: 'Admin',
    createdBy: 'Manager',
    description: 'Update payment plan templates to include new terms',
    estimatedHours: 2,
    actualHours: 1.5,
    category: 'process_improvement',
    tags: ['templates', 'payment_plans'],
    progress: 75
  },
  {
    id: 'TASK002',
    title: 'Review escalation procedures',
    type: 'policy_review',
    priority: 'high',
    status: 'pending',
    dueDate: '2025-01-10',
    assignedTo: 'Supervisor',
    createdBy: 'Manager',
    description: 'Review and update escalation procedures for difficult customers',
    estimatedHours: 4,
    actualHours: 0,
    category: 'policy_update',
    tags: ['escalation', 'procedures'],
    progress: 0
  },
  {
    id: 'TASK003',
    title: 'AI Agent performance analysis',
    type: 'analysis',
    priority: 'medium',
    status: 'completed',
    dueDate: '2025-01-09',
    assignedTo: 'Analytics Team',
    createdBy: 'Manager',
    description: 'Analyze AI agent performance vs human agents',
    estimatedHours: 6,
    actualHours: 5.5,
    category: 'performance_analysis',
    tags: ['ai_agents', 'performance', 'analytics'],
    progress: 100
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

const CalendarScheduling: React.FC = () => {
  const [calendarEvents, setCalendarEvents] = useState(mockCalendarEvents);
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('month'); // month, week, day, list
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter events and tasks
  const filteredEvents = React.useMemo(() => {
    return calendarEvents.filter(event => {
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || event.priority === filterPriority;
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.patientName && event.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesStatus && matchesPriority && matchesSearch;
    });
  }, [calendarEvents, filterCategory, filterStatus, filterPriority, searchTerm]);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, filterStatus, filterPriority, searchTerm]);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'follow_up_call': return <PhoneCallback sx={{ color: 'info.main' }} />;
      case 'payment_due': return <MonetizationOn sx={{ color: 'warning.main' }} />;
      case 'team_meeting': return <Business sx={{ color: 'primary.main' }} />;
      case 'legal_review': return <Gavel sx={{ color: 'error.main' }} />;
      case 'campaign_review': return <Campaign sx={{ color: 'secondary.main' }} />;
      case 'callback_appointment': return <Phone sx={{ color: 'success.main' }} />;
      default: return <Event sx={{ color: 'grey.500' }} />;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'administrative': return <Assignment sx={{ color: 'primary.main' }} />;
      case 'policy_review': return <Gavel sx={{ color: 'warning.main' }} />;
      case 'analysis': return <Analytics sx={{ color: 'info.main' }} />;
      default: return <Assignment sx={{ color: 'grey.500' }} />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'follow_up_call': return '#2196f3';
      case 'payment_due': return '#ff9800';
      case 'team_meeting': return '#1976d2';
      case 'legal_review': return '#f44336';
      case 'campaign_review': return '#9c27b0';
      case 'callback_appointment': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  // Get today's events
  const todaysEvents = calendarEvents.filter(event => 
    event.date === new Date().toISOString().split('T')[0]
  );

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => 
    new Date(task.dueDate) < new Date() && task.status !== 'completed'
  );

  // Get upcoming deadlines (next 3 days)
  const upcomingDeadlines = calendarEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= threeDaysFromNow && 
           (event.type === 'payment_due' || event.type === 'legal_review');
  });

  const speedDialActions = [
    {
      icon: <Phone />,
      name: 'Schedule Call',
      action: () => {
        setNewEventDialogOpen(true);
      }
    },
    {
      icon: <Assignment />,
      name: 'Add Task',
      action: () => {
        setNewTaskDialogOpen(true);
      }
    },
    {
      icon: <Event />,
      name: 'New Event',
      action: () => {
        setNewEventDialogOpen(true);
      }
    },
    {
      icon: <MonetizationOn />,
      name: 'Payment Reminder',
      action: () => {
        setNewEventDialogOpen(true);
      }
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Calendar & Scheduling
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage appointments, follow-ups, tasks, and deadlines
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {todaysEvents.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Events
                  </Typography>
                </Box>
                <Today sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="error.main">
                    {overdueTasks.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Tasks
                  </Typography>
                </Box>
                <NotificationImportant sx={{ fontSize: 40, color: 'error.main' }} />
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
                    {upcomingDeadlines.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Deadlines
                  </Typography>
                </Box>
                <AccessTime sx={{ fontSize: 40, color: 'warning.main' }} />
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
                    {calendarEvents.filter(e => e.type === 'follow_up_call' && e.status === 'scheduled').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled Calls
                  </Typography>
                </Box>
                <Phone sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Urgent Alerts */}
      {(overdueTasks.length > 0 || upcomingDeadlines.length > 0) && (
        <Card sx={{ mb: 3, border: '2px solid', borderColor: 'warning.main' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationImportant />
              Urgent Items Requiring Attention
            </Typography>
            <Grid container spacing={2}>
              {overdueTasks.map(task => (
                <Grid item xs={12} md={6} key={task.id}>
                  <Alert 
                    severity="error" 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleTaskClick(task)}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      OVERDUE: {task.title}
                    </Typography>
                    <Typography variant="body2">
                      Due: {formatDate(task.dueDate)}
                    </Typography>
                  </Alert>
                </Grid>
              ))}
              {upcomingDeadlines.map(event => (
                <Grid item xs={12} md={6} key={event.id}>
                  <Alert 
                    severity="warning" 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleEventClick(event)}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      DEADLINE: {event.title}
                    </Typography>
                    <Typography variant="body2">
                      Due: {formatDateTime(`${event.date}T${event.time}`)}
                    </Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Visual Calendar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday />
            Calendar View
          </Typography>
          <VisualCalendar 
            events={calendarEvents.map(event => ({
              id: event.id,
              title: event.title,
              date: event.date,
              time: event.time,
              duration: event.duration,
              type: event.type,
              priority: event.priority as 'urgent' | 'high' | 'medium' | 'low',
              patientName: event.patientName || '',
              balance: event.balance || undefined
            }))}
            onEventClick={handleEventClick}
            onDateClick={(date: string) => {
              // Handle date click - could open new event dialog for that date
              console.log('Date clicked:', date);
            }}
          />
        </CardContent>
      </Card>

      {/* View Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>View</InputLabel>
                <Select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  label="View"
                >
                  <MenuItem value="month">Month View</MenuItem>
                  <MenuItem value="week">Week View</MenuItem>
                  <MenuItem value="day">Day View</MenuItem>
                  <MenuItem value="list">List View</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Search..."
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
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="customer_contact">Customer Contact</MenuItem>
                  <MenuItem value="payment_deadline">Payment Deadline</MenuItem>
                  <MenuItem value="internal_meeting">Internal Meeting</MenuItem>
                  <MenuItem value="legal_action">Legal Action</MenuItem>
                  <MenuItem value="strategy_planning">Strategy Planning</MenuItem>
                </Select>
              </FormControl>
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
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
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

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Calendar Events" icon={<CalendarToday />} />
            <Tab label="Tasks & To-Do" icon={<Assignment />} />
            <Tab label="Today's Schedule" icon={<Today />} />
            <Tab label="Upcoming Deadlines" icon={<AccessTime />} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Patient/Contact</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleEventClick(event)}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {formatDate(event.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.time} ({event.duration}min)
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getEventTypeIcon(event.type)}
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.description.substring(0, 50)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={event.type.replace('_', ' ')}
                        size="small"
                        sx={{
                          backgroundColor: getEventTypeColor(event.type),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={event.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(event.priority),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={event.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(event.status),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      {event.patientName ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {event.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.phoneNumber}
                          </Typography>
                          {event.balance && (
                            <Typography variant="caption" display="block" color="primary.main">
                              {formatCurrency(event.balance)}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Internal Event
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {event.assignedTo}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Event">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        {event.status === 'scheduled' && (
                          <Tooltip title="Mark Complete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Mark as completed logic
                              }}
                            >
                              <Done />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleTaskClick(task)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTaskTypeIcon(task.type)}
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {task.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {task.description.substring(0, 50)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={task.type.replace('_', ' ')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={task.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(task.priority),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={task.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(task.status),
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'error.main' : 'text.primary'}
                      >
                        {formatDate(task.dueDate)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: '100px' }}>
                          <Box
                            sx={{
                              width: '100%',
                              height: 6,
                              backgroundColor: 'grey.300',
                              borderRadius: 3,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${task.progress}%`,
                                height: '100%',
                                backgroundColor: task.progress === 100 ? 'success.main' : 'primary.main',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="caption">
                          {task.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {task.assignedTo}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Task">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskClick(task);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        {task.status !== 'completed' && (
                          <Tooltip title="Mark Complete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Mark as completed logic
                              }}
                            >
                              <Done />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Today's Schedule - {formatDate(new Date().toISOString())}</Typography>
          <List>
            {todaysEvents.length > 0 ? (
              todaysEvents
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((event) => (
                  <React.Fragment key={event.id}>
                    <ListItem 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleEventClick(event)}
                    >
                      <ListItemIcon>
                        {getEventTypeIcon(event.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight="bold">
                              {event.time} - {event.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                label={event.priority}
                                size="small"
                                sx={{
                                  backgroundColor: getPriorityColor(event.priority),
                                  color: 'white'
                                }}
                              />
                              <Chip
                                label={event.status}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(event.status),
                                  color: 'white'
                                }}
                              />
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {event.description}
                            </Typography>
                            {event.patientName && (
                              <Typography variant="body2" color="primary.main">
                                Patient: {event.patientName} - {formatCurrency(event.balance || 0)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No events scheduled for today
              </Typography>
            )}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Upcoming Deadlines & Critical Dates</Typography>
          <List>
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => (
                  <React.Fragment key={event.id}>
                    <ListItem 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleEventClick(event)}
                    >
                      <ListItemIcon>
                        <AccessTime sx={{ color: 'warning.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight="bold">
                              {formatDateTime(`${event.date}T${event.time}`)} - {event.title}
                            </Typography>
                            <Chip
                              label={event.priority}
                              size="small"
                              sx={{
                                backgroundColor: getPriorityColor(event.priority),
                                color: 'white'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {event.description}
                            </Typography>
                            {event.patientName && (
                              <Typography variant="body2" color="primary.main">
                                Patient: {event.patientName} - {formatCurrency(event.balance || 0)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No upcoming deadlines in the next 3 days
              </Typography>
            )}
          </List>
        </TabPanel>
      </Card>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Calendar Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.action}
          />
        ))}
      </SpeedDial>

      {/* Event Details Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getEventTypeIcon(selectedEvent?.type)}
            <Box>
              <Typography variant="h6">{selectedEvent?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEvent && formatDateTime(`${selectedEvent.date}T${selectedEvent.time}`)}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Event Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{selectedEvent?.type?.replace('_', ' ')}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">{selectedEvent?.duration} minutes</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedEvent?.status}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(selectedEvent?.status),
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Priority</Typography>
                  <Chip
                    label={selectedEvent?.priority}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(selectedEvent?.priority),
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Assignment & Contact</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Assigned To</Typography>
                  <Typography variant="body1">{selectedEvent?.assignedTo}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Created By</Typography>
                  <Typography variant="body1">{selectedEvent?.createdBy}</Typography>
                </Box>
                {selectedEvent?.patientName && (
                  <>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Patient</Typography>
                      <Typography variant="body1">{selectedEvent.patientName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{selectedEvent.phoneNumber}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Balance</Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatCurrency(selectedEvent.balance || 0)}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1">{selectedEvent?.description}</Typography>
              
              {selectedEvent?.notes && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Notes</Typography>
                  <Typography variant="body1">{selectedEvent.notes}</Typography>
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<Edit />}>
            Edit Event
          </Button>
          {selectedEvent?.status === 'scheduled' && (
            <Button variant="contained" startIcon={<Done />}>
              Mark Complete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getTaskTypeIcon(selectedTask?.type)}
            <Box>
              <Typography variant="h6">{selectedTask?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Due: {selectedTask && formatDate(selectedTask.dueDate)}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Task Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{selectedTask?.type?.replace('_', ' ')}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Priority</Typography>
                  <Chip
                    label={selectedTask?.priority}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(selectedTask?.priority),
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedTask?.status?.replace('_', ' ')}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(selectedTask?.status),
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Progress</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Box sx={{ width: '200px' }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 8,
                          backgroundColor: 'grey.300',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${selectedTask?.progress || 0}%`,
                            height: '100%',
                            backgroundColor: selectedTask?.progress === 100 ? 'success.main' : 'primary.main',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2">
                      {selectedTask?.progress || 0}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Assignment & Time</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Assigned To</Typography>
                  <Typography variant="body1">{selectedTask?.assignedTo}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Created By</Typography>
                  <Typography variant="body1">{selectedTask?.createdBy}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Estimated Hours</Typography>
                  <Typography variant="body1">{selectedTask?.estimatedHours}h</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Actual Hours</Typography>
                  <Typography variant="body1">{selectedTask?.actualHours}h</Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1">{selectedTask?.description}</Typography>
              
              {selectedTask?.tags && selectedTask.tags.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Tags</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedTask.tags.map((tag: string, index: number) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<Edit />}>
            Edit Task
          </Button>
          {selectedTask?.status !== 'completed' && (
            <Button variant="contained" startIcon={<Done />}>
              Mark Complete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* New Event Dialog - Placeholder */}
      <Dialog
        open={newEventDialogOpen}
        onClose={() => setNewEventDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Event creation form would go here...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewEventDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Event</Button>
        </DialogActions>
      </Dialog>

      {/* New Task Dialog - Placeholder */}
      <Dialog
        open={newTaskDialogOpen}
        onClose={() => setNewTaskDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Task creation form would go here...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTaskDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarScheduling;
