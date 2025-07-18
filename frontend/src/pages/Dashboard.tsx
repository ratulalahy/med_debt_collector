import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  Phone,
  AttachMoney,
  People,
  Refresh,
  CallMade,
  Schedule,
  Payment,
  Assessment,
  Timer,
  CheckCircle,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';
import { mockDashboardStats, mockPatients, mockCampaigns, mockCallLogs } from '../data/mockData';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState(mockDashboardStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setStats({
        ...stats,
        callsToday: stats.callsToday + Math.floor(Math.random() * 10),
        successfulContacts: stats.successfulContacts + Math.floor(Math.random() * 5),
        totalRecoveredToday: stats.totalRecoveredToday + Math.random() * 100,
      });
      setIsRefreshing(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'warning':
        return <Warning sx={{ color: 'warning.main' }} />;
      case 'error':
        return <Error sx={{ color: 'error.main' }} />;
      default:
        return <Info sx={{ color: 'info.main' }} />;
    }
  };

  const keyMetrics = [
    {
      title: 'Total Outstanding',
      value: formatCurrency(stats.totalOutstanding),
      icon: <AttachMoney />,
      color: '#f44336',
      change: '+2.5%',
      changeType: 'increase',
    },
    {
      title: 'Active Patients',
      value: stats.activePatients.toLocaleString(),
      icon: <People />,
      color: '#2196f3',
      change: '+8.2%',
      changeType: 'increase',
    },
    {
      title: 'Calls Today',
      value: stats.callsToday.toLocaleString(),
      icon: <Phone />,
      color: '#4caf50',
      change: '+15.3%',
      changeType: 'increase',
    },
    {
      title: 'Collection Rate',
      value: `${stats.collectionRate.toFixed(1)}%`,
      icon: <TrendingUp />,
      color: '#ff9800',
      change: '+4.3%',
      changeType: 'increase',
    },
  ];

  const upcomingCalls = mockPatients
    .filter(patient => patient.nextScheduled)
    .sort((a, b) => new Date(a.nextScheduled!).getTime() - new Date(b.nextScheduled!).getTime())
    .slice(0, 5);

  const recentCalls = mockCallLogs
    .sort((a, b) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime())
    .slice(0, 5);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Dashboard Overview
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {formatTime(currentTime)}
          </Typography>
          <IconButton onClick={handleRefresh} disabled={isRefreshing}>
            <Refresh sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Real-time Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Live Update:</strong> {mockCampaigns.filter(c => c.status === 'active').length} active campaigns running. 
          System is operating normally with {((stats.successfulContacts / stats.callsToday) * 100).toFixed(1)}% success rate today.
        </Typography>
      </Alert>
      
      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {keyMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: metric.color + '20',
                      color: metric.color 
                    }}
                  >
                    {metric.icon}
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Chip
                    label={metric.change}
                    size="small"
                    color={metric.changeType === 'increase' ? 'success' : 'error'}
                    sx={{ fontSize: '0.75rem' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    vs last period
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Today's Progress */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Today's Progress
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Calls Completed</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {stats.callsToday} / 600
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.callsToday / 600) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Successful Contacts</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {stats.successfulContacts} / {stats.callsToday}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.successfulContacts / stats.callsToday) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                  color="success"
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Payment Arrangements</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {stats.paymentArrangements} / {stats.successfulContacts}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.paymentArrangements / stats.successfulContacts) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                  color="warning"
                />
              </Box>

              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {formatCurrency(stats.totalRecoveredToday)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Recovered Today
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Activity
              </Typography>
              <List>
                {stats.recentActivity.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(activity.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {activity.action}
                            </Typography>
                            {activity.amount && (
                              <Chip
                                label={activity.amount}
                                size="small"
                                color="success"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.patient} • {activity.outcome}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < stats.recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Scheduled Calls */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Upcoming Calls
                </Typography>
                <Schedule color="primary" />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Patient</strong></TableCell>
                      <TableCell><strong>Scheduled</strong></TableCell>
                      <TableCell><strong>Priority</strong></TableCell>
                      <TableCell><strong>Balance</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingCalls.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {patient.residentFirstName} {patient.residentLastName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(patient.nextScheduled!).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={patient.priority}
                            size="small"
                            color={patient.priority === 'high' ? 'error' : patient.priority === 'medium' ? 'warning' : 'success'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            {formatCurrency(patient.balance)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CallMade />}
                    sx={{ mb: 1 }}
                  >
                    Start New Campaign
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<People />}
                    sx={{ mb: 1 }}
                  >
                    View Patients
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assessment />}
                    sx={{ mb: 1 }}
                  >
                    View Reports
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AttachMoney />}
                  >
                    Payment Processing
                  </Button>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="body2">Voice AI System: Online</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="body2">Payment Gateway: Active</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="body2">Database: Connected</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
