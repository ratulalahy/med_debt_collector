import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemIcon,
  Avatar,
  TableSortLabel,
  Tooltip,
  Badge,
  Stack,
} from '@mui/material';
import {
  Search,
  Phone,
  Email,
  Edit,
  Visibility,
  FilterList,
  PersonAdd,
  CallMade,
  Payment,
  Schedule,
  AttachMoney,
  TrendingUp,
  CalendarToday,
  ExpandMore,
  Person,
  History,
  AccountBalance,
  ContactPhone,
  LocalHospital,
  CheckCircle,
  Cancel,
  Warning,
  PhoneCallback,
  CallReceived,
  Info,
  SortByAlpha,
  SwapVert,
} from '@mui/icons-material';
import { mockPatients, mockCallLogs, getCallLogsByPatientId, searchPatients, filterPatientsByStatus, filterPatientsByPriority } from '../data/mockData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
  const [viewMode, setViewMode] = useState<'table' | 'accordion'>('accordion');

  const handleSort = (column: string) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // Filter and sort patients based on search, filters, and sorting
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Apply search filter
    if (searchQuery) {
      filtered = searchPatients(searchQuery);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(patient => patient.priority === priorityFilter);
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.residentFirstName} ${a.residentLastName}`;
          bValue = `${b.residentFirstName} ${b.residentLastName}`;
          break;
        case 'balance':
          aValue = a.balance;
          bValue = b.balance;
          break;
        case 'lastContact':
          aValue = a.lastContact ? new Date(a.lastContact).getTime() : 0;
          bValue = b.lastContact ? new Date(b.lastContact).getTime() : 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          aValue = a.priority;
          bValue = b.priority;
          break;
        default:
          aValue = a[sortBy as keyof typeof a];
          bValue = b[sortBy as keyof typeof b];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [patients, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  const handleCall = (patient: any) => {
    alert(`Initiating call to ${patient.contactFirstName} ${patient.contactLastName} at ${patient.contactNumber}`);
  };

  const handleScheduleCall = (patient: any) => {
    alert(`Scheduling call for ${patient.residentFirstName} ${patient.residentLastName}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'resolved': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPatientCallHistory = (patientId: string) => {
    return getCallLogsByPatientId(patientId);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
        Patient Management
      </Typography>
      
      {/* Search and Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => setNewPatientOpen(true)}
                >
                  Add Patient
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Patients ({filteredPatients.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={viewMode === 'accordion' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('accordion')}
                size="small"
              >
                Accordion View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                size="small"
              >
                Table View
              </Button>
            </Box>
          </Box>

          {/* Sorting Controls */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Tooltip title="Sort by Name">
              <Button
                variant={sortBy === 'name' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleSort('name')}
                startIcon={sortBy === 'name' ? (sortOrder === 'asc' ? <SwapVert /> : <SwapVert sx={{ transform: 'rotate(180deg)' }} />) : <SortByAlpha />}
              >
                Name
              </Button>
            </Tooltip>
            <Tooltip title="Sort by Balance">
              <Button
                variant={sortBy === 'balance' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleSort('balance')}
                startIcon={sortBy === 'balance' ? (sortOrder === 'asc' ? <SwapVert /> : <SwapVert sx={{ transform: 'rotate(180deg)' }} />) : <AttachMoney />}
              >
                Balance
              </Button>
            </Tooltip>
            <Tooltip title="Sort by Last Contact">
              <Button
                variant={sortBy === 'lastContact' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleSort('lastContact')}
                startIcon={sortBy === 'lastContact' ? (sortOrder === 'asc' ? <SwapVert /> : <SwapVert sx={{ transform: 'rotate(180deg)' }} />) : <CallMade />}
              >
                Last Contact
              </Button>
            </Tooltip>
            <Tooltip title="Sort by Priority">
              <Button
                variant={sortBy === 'priority' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleSort('priority')}
                startIcon={sortBy === 'priority' ? (sortOrder === 'asc' ? <SwapVert /> : <SwapVert sx={{ transform: 'rotate(180deg)' }} />) : <Warning />}
              >
                Priority
              </Button>
            </Tooltip>
          </Box>

          {/* Accordion View */}
          {viewMode === 'accordion' && (
            <Box>
              {filteredPatients.map((patient) => (
                <Accordion
                  key={patient.id}
                  expanded={expandedAccordion === patient.id}
                  onChange={handleAccordionChange(patient.id)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {patient.residentFirstName} {patient.residentLastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {patient.id}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            {formatCurrency(patient.balance)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Balance
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Chip
                            label={patient.status}
                            size="small"
                            color={getStatusColor(patient.status)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Chip
                            label={patient.priority}
                            size="small"
                            color={getPriorityColor(patient.priority)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Call Now">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCall(patient);
                              }}
                              color="primary"
                            >
                              <Phone />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Schedule Call">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScheduleCall(patient);
                              }}
                              color="secondary"
                            >
                              <Schedule />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePatientClick(patient);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* Patient Details */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person color="primary" />
                              Patient Information
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemIcon><LocalHospital /></ListItemIcon>
                                <ListItemText
                                  primary="Facility"
                                  secondary={patient.facilityName}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CalendarToday /></ListItemIcon>
                                <ListItemText
                                  primary="Date of Birth"
                                  secondary={formatDate(patient.dateOfBirth)}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><AccountBalance /></ListItemIcon>
                                <ListItemText
                                  primary="Payer"
                                  secondary={patient.payerDesc}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><AttachMoney /></ListItemIcon>
                                <ListItemText
                                  primary="Due Date"
                                  secondary={formatDate(patient.dueDate)}
                                />
                              </ListItem>
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Contact Details */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ContactPhone color="primary" />
                              Contact Information
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemIcon><Person /></ListItemIcon>
                                <ListItemText
                                  primary="Contact Name"
                                  secondary={`${patient.contactFirstName} ${patient.contactLastName}`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><Phone /></ListItemIcon>
                                <ListItemText
                                  primary="Phone Number"
                                  secondary={patient.contactNumber}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><Email /></ListItemIcon>
                                <ListItemText
                                  primary="Email"
                                  secondary={patient.contactEmail}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CalendarToday /></ListItemIcon>
                                <ListItemText
                                  primary="Last Contact"
                                  secondary={patient.lastContact ? formatDate(patient.lastContact) : 'Never'}
                                />
                              </ListItem>
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Call History */}
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <History color="primary" />
                              Recent Call History
                            </Typography>
                            {getPatientCallHistory(patient.id).length > 0 ? (
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Date</TableCell>
                                      <TableCell>Duration</TableCell>
                                      <TableCell>Outcome</TableCell>
                                      <TableCell>Agent Type</TableCell>
                                      <TableCell>Cost</TableCell>
                                      <TableCell>Notes</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {getPatientCallHistory(patient.id).slice(0, 3).map((call) => (
                                      <TableRow key={call.id}>
                                        <TableCell>{formatDate(call.callDate)}</TableCell>
                                        <TableCell>{Math.floor(call.duration / 60)}m {call.duration % 60}s</TableCell>
                                        <TableCell>
                                          <Chip
                                            label={call.outcome.replace('_', ' ')}
                                            size="small"
                                            color={call.outcome.includes('payment') ? 'success' : 'default'}
                                            sx={{ textTransform: 'capitalize' }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            label={call.agentType.replace('_', ' ')}
                                            size="small"
                                            variant="outlined"
                                            sx={{ textTransform: 'capitalize' }}
                                          />
                                        </TableCell>
                                        <TableCell>${call.cost.toFixed(2)}</TableCell>
                                        <TableCell>{call.notes}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Alert severity="info">No call history available</Alert>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Status and Priority Override */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Status Management
                            </Typography>
                            <Stack spacing={2}>
                              <FormControl size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                  value={patient.status}
                                  label="Status"
                                  onChange={(e) => {
                                    // Update patient status
                                    const updatedPatients = patients.map(p => 
                                      p.id === patient.id ? { ...p, status: e.target.value } : p
                                    );
                                    setPatients(updatedPatients);
                                  }}
                                >
                                  <MenuItem value="active">Active</MenuItem>
                                  <MenuItem value="pending">Pending</MenuItem>
                                  <MenuItem value="resolved">Resolved</MenuItem>
                                </Select>
                              </FormControl>
                              <FormControl size="small">
                                <InputLabel>Priority</InputLabel>
                                <Select
                                  value={patient.priority}
                                  label="Priority"
                                  onChange={(e) => {
                                    // Update patient priority
                                    const updatedPatients = patients.map(p => 
                                      p.id === patient.id ? { ...p, priority: e.target.value } : p
                                    );
                                    setPatients(updatedPatients);
                                  }}
                                >
                                  <MenuItem value="high">High</MenuItem>
                                  <MenuItem value="medium">Medium</MenuItem>
                                  <MenuItem value="low">Low</MenuItem>
                                </Select>
                              </FormControl>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Quick Actions */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Quick Actions
                            </Typography>
                            <Stack spacing={1}>
                              <Button
                                variant="outlined"
                                startIcon={<Phone />}
                                onClick={() => handleCall(patient)}
                                fullWidth
                                size="small"
                              >
                                Call Now
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<Schedule />}
                                onClick={() => handleScheduleCall(patient)}
                                fullWidth
                                size="small"
                              >
                                Schedule Call
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<Payment />}
                                fullWidth
                                size="small"
                              >
                                Payment Plan
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => handlePatientClick(patient)}
                                fullWidth
                                size="small"
                              >
                                Edit Details
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'id'}
                        direction={sortBy === 'id' ? sortOrder : 'asc'}
                        onClick={() => handleSort('id')}
                      >
                        Patient ID
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortOrder : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        Resident Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'balance'}
                        direction={sortBy === 'balance' ? sortOrder : 'asc'}
                        onClick={() => handleSort('balance')}
                      >
                        Balance
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'status'}
                        direction={sortBy === 'status' ? sortOrder : 'asc'}
                        onClick={() => handleSort('status')}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'priority'}
                        direction={sortBy === 'priority' ? sortOrder : 'asc'}
                        onClick={() => handleSort('priority')}
                      >
                        Priority
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'lastContact'}
                        direction={sortBy === 'lastContact' ? sortOrder : 'asc'}
                        onClick={() => handleSort('lastContact')}
                      >
                        Last Contact
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>{patient.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {patient.residentFirstName} {patient.residentLastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          DOB: {formatDate(patient.dateOfBirth)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {patient.contactFirstName} {patient.contactLastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {patient.contactNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          {formatCurrency(patient.balance)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(patient.dueDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={patient.status}
                          size="small"
                          color={getStatusColor(patient.status)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.priority}
                          size="small"
                          color={getPriorityColor(patient.priority)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {patient.lastContact ? formatDate(patient.lastContact) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handlePatientClick(patient)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Call Now">
                            <IconButton
                              size="small"
                              onClick={() => handleCall(patient)}
                              color="primary"
                            >
                              <Phone />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Schedule Call">
                            <IconButton
                              size="small"
                              onClick={() => handleScheduleCall(patient)}
                              color="secondary"
                            >
                              <Schedule />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {filteredPatients.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No patients found matching your search criteria.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Patient Details: {selectedPatient?.residentFirstName} {selectedPatient?.residentLastName}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Box>
              <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
                <Tab label="Overview" />
                <Tab label="Call History" />
                <Tab label="Payment Info" />
                <Tab label="Notes" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Resident Information
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Full Name"
                              secondary={`${selectedPatient.residentFirstName} ${selectedPatient.residentLastName}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Patient ID"
                              secondary={selectedPatient.id}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Date of Birth"
                              secondary={formatDate(selectedPatient.dateOfBirth)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Facility"
                              secondary={selectedPatient.facilityName}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Payer"
                              secondary={selectedPatient.payerDesc}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Contact Information
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Contact Name"
                              secondary={`${selectedPatient.contactFirstName} ${selectedPatient.contactLastName}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Phone Number"
                              secondary={selectedPatient.contactNumber}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Email"
                              secondary={selectedPatient.contactEmail}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Status"
                              secondary={
                                <Chip
                                  label={selectedPatient.status}
                                  size="small"
                                  color={getStatusColor(selectedPatient.status)}
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Priority"
                              secondary={
                                <Chip
                                  label={selectedPatient.priority}
                                  size="small"
                                  color={getPriorityColor(selectedPatient.priority)}
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              }
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Account Summary
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <AttachMoney sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                              <Typography variant="h6">{formatCurrency(selectedPatient.balance)}</Typography>
                              <Typography variant="caption">Outstanding Balance</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <CallMade sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                              <Typography variant="h6">{selectedPatient.totalCalls}</Typography>
                              <Typography variant="caption">Total Calls</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                              <Typography variant="h6">{selectedPatient.successfulContacts}</Typography>
                              <Typography variant="caption">Successful Contacts</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <Payment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                              <Typography variant="h6">{selectedPatient.paymentArrangements}</Typography>
                              <Typography variant="caption">Payment Arrangements</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Call History
                </Typography>
                {getPatientCallHistory(selectedPatient.id).length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Outcome</TableCell>
                          <TableCell>Agent Type</TableCell>
                          <TableCell>Cost</TableCell>
                          <TableCell>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getPatientCallHistory(selectedPatient.id).map((call) => (
                          <TableRow key={call.id}>
                            <TableCell>{formatDate(call.callDate)}</TableCell>
                            <TableCell>{Math.floor(call.duration / 60)}m {call.duration % 60}s</TableCell>
                            <TableCell>
                              <Chip
                                label={call.outcome.replace('_', ' ')}
                                size="small"
                                color={call.outcome.includes('payment') ? 'success' : 'default'}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>{call.agentType.replace('_', ' ')}</TableCell>
                            <TableCell>${call.cost.toFixed(2)}</TableCell>
                            <TableCell>{call.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">No call history available for this patient.</Alert>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Current Balance
                        </Typography>
                        <Typography variant="h4" color="error.main">
                          {formatCurrency(selectedPatient.balance)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Due: {formatDate(selectedPatient.dueDate)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Payment Options
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button variant="outlined" fullWidth>
                            Set up Payment Plan
                          </Button>
                          <Button variant="outlined" fullWidth>
                            Process One-time Payment
                          </Button>
                          <Button variant="outlined" fullWidth>
                            Request Financial Assistance
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                  Notes & Communication
                </Typography>
                <Card>
                  <CardContent>
                    <Typography variant="body1">
                      {selectedPatient.notes}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Add a new note..."
                      variant="outlined"
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="contained">Add Note</Button>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Phone />}>
            Call Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Patient Dialog */}
      <Dialog
        open={newPatientOpen}
        onClose={() => setNewPatientOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Patient</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This feature will be connected to the backend in the next iteration.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Resident First Name"
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Resident Last Name"
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient ID"
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                variant="outlined"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact First Name"
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Last Name"
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Email"
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Outstanding Balance"
                type="number"
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                variant="outlined"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Facility Name"
                variant="outlined"
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewPatientOpen(false)}>Cancel</Button>
          <Button variant="contained">Add Patient</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientManagement;
