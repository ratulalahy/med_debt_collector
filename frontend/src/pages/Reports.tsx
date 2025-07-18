import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Phone,
  People,
  Schedule,
  Assessment,
  FileDownload,
  DateRange,
  PieChart,
  BarChart,
  Timeline,
  CallMade,
  Payment,
  Timer,
} from '@mui/icons-material';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { mockReports, mockDashboardStats, mockCallLogs, mockCampaigns } from '../data/mockData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

const Reports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('daily');
  const [tabValue, setTabValue] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState('calls');

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

  const getReportData = () => {
    switch (timeRange) {
      case 'daily':
        return mockReports.dailyStats;
      case 'weekly':
        return mockReports.weeklyStats;
      case 'monthly':
        return mockReports.monthlyStats;
      default:
        return mockReports.dailyStats;
    }
  };

  const reportData = getReportData();

  // Chart configurations
  const callsByHourData = {
    labels: mockReports.dailyStats.callsByHour.map(item => item.hour),
    datasets: [
      {
        label: 'Calls Made',
        data: mockReports.dailyStats.callsByHour.map(item => item.calls),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const callsByDayData = {
    labels: mockReports.weeklyStats.callsByDay.map(item => item.day),
    datasets: [
      {
        label: 'Total Calls',
        data: mockReports.weeklyStats.callsByDay.map(item => item.calls),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'Successful Calls',
        data: mockReports.weeklyStats.callsByDay.map(item => item.success),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
    ],
  };

  const callOutcomeData = {
    labels: ['Payment Arranged', 'Payment Completed', 'No Answer', 'Information Requested', 'Follow-up Needed'],
    datasets: [
      {
        data: [120, 85, 200, 95, 150],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const collectionTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Collections ($)',
        data: [12000, 15420, 18750, 22340],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chart Title',
      },
    },
  };

  const handleExport = (format: string) => {
    alert(`Exporting report as ${format}. This will be implemented with backend integration.`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Reports & Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => handleExport('PDF')}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Key Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {reportData.totalCalls || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Calls
                  </Typography>
                </Box>
                <CallMade sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {reportData.successfulCalls || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Successful Calls
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {reportData.paymentArrangements || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment Arrangements
                  </Typography>
                </Box>
                <Payment sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(reportData.totalRecovered || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Recovered
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Tabs */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
            <Tab label="Call Analytics" icon={<Phone />} iconPosition="start" />
            <Tab label="Collection Performance" icon={<AttachMoney />} iconPosition="start" />
            <Tab label="Campaign Results" icon={<Assessment />} iconPosition="start" />
            <Tab label="Detailed Reports" icon={<BarChart />} iconPosition="start" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Calls by Hour (Today)
                    </Typography>
                    <Line data={callsByHourData} options={chartOptions} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Call Outcomes
                    </Typography>
                    <Doughnut data={callOutcomeData} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Weekly Call Performance
                    </Typography>
                    <Bar data={callsByDayData} options={chartOptions} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Collection Trend
                    </Typography>
                    <Line data={collectionTrendData} options={chartOptions} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Collection Summary
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <AttachMoney />
                        </ListItemIcon>
                        <ListItemText
                          primary="Total Collections"
                          secondary={formatCurrency(48750.25)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUp />
                        </ListItemIcon>
                        <ListItemText
                          primary="Collection Rate"
                          secondary="68.5%"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Timer />
                        </ListItemIcon>
                        <ListItemText
                          primary="Avg. Collection Time"
                          secondary="3.2 days"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Campaign Performance Comparison
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Campaign</strong></TableCell>
                            <TableCell><strong>Total Calls</strong></TableCell>
                            <TableCell><strong>Success Rate</strong></TableCell>
                            <TableCell><strong>Collection Rate</strong></TableCell>
                            <TableCell><strong>Total Recovered</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mockCampaigns.map((campaign) => (
                            <TableRow key={campaign.id}>
                              <TableCell>{campaign.name}</TableCell>
                              <TableCell>{campaign.totalPatients}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={campaign.successRate}
                                    sx={{ width: 80, height: 8, borderRadius: 4 }}
                                  />
                                  <Typography variant="body2">
                                    {campaign.successRate.toFixed(1)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={campaign.collectionRate}
                                    sx={{ width: 80, height: 8, borderRadius: 4 }}
                                    color="success"
                                  />
                                  <Typography variant="body2">
                                    {campaign.collectionRate.toFixed(1)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                  {formatCurrency(campaign.totalRecovered)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={campaign.status}
                                  size="small"
                                  color={campaign.status === 'active' ? 'success' : 'default'}
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Performing Metrics
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUp color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Best Collection Day"
                          secondary="Tuesday (78.5% success rate)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Timer color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Optimal Call Time"
                          secondary="2:00 PM - 4:00 PM"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Phone color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Most Effective Agent"
                          secondary="Debt Collection Agent (72% success)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AttachMoney color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Average Collection Amount"
                          secondary="$185.50 per successful call"
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
                      Areas for Improvement
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingDown color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Low Response Rate"
                          secondary="Fridays show 45% lower response"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Schedule color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Long Call Duration"
                          secondary="Average 5.2 minutes (target: 3.5 min)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <People color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Follow-up Rate"
                          secondary="Only 62% of no-answers get follow-up"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body1">
                    <strong>Export Options:</strong> You can export detailed reports in PDF, Excel, or CSV formats. 
                    Custom date ranges and filtering options will be available in the next iteration.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
