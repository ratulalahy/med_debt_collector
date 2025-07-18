import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  TextField,
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Pause,
  Stop,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  Phone,
  Schedule,
  AttachMoney,
  People,
  Assessment,
  Campaign as CampaignIcon,
  CallMade,
  Timer,
} from '@mui/icons-material';
import { mockCampaigns, mockCallLogs, getCampaignById, getCallLogsByCampaignId } from '../data/mockData';

const CallCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    agentType: 'debt_collection',
    priority: 'medium',
    startDate: '',
    endDate: '',
    totalPatients: 0,
  });

  const handleCampaignClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setDetailsOpen(true);
  };

  const handleStartCampaign = (campaignId: string) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, status: 'active' }
          : campaign
      )
    );
    alert(`Campaign started successfully!`);
  };

  const handlePauseCampaign = (campaignId: string) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, status: 'paused' }
          : campaign
      )
    );
    alert(`Campaign paused successfully!`);
  };

  const handleStopCampaign = (campaignId: string) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, status: 'completed' }
          : campaign
      )
    );
    alert(`Campaign stopped successfully!`);
  };

  const handleCreateCampaign = () => {
    const newCampaignData = {
      id: `camp-${Date.now()}`,
      ...newCampaign,
      status: 'scheduled',
      callsCompleted: 0,
      callsScheduled: newCampaign.totalPatients,
      successRate: 0,
      collectionRate: 0,
      totalRecovered: 0,
      averageCallDuration: 0,
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
    };
    
    setCampaigns(prevCampaigns => [...prevCampaigns, newCampaignData]);
    setCreateOpen(false);
    setNewCampaign({
      name: '',
      description: '',
      agentType: 'debt_collection',
      priority: 'medium',
      startDate: '',
      endDate: '',
      totalPatients: 0,
    });
    alert('Campaign created successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'scheduled': return 'info';
      case 'paused': return 'warning';
      case 'completed': return 'default';
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getCampaignProgress = (campaign: any) => {
    if (campaign.totalPatients === 0) return 0;
    return (campaign.callsCompleted / campaign.totalPatients) * 100;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Call Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
          size="large"
        >
          Create Campaign
        </Button>
      </Box>

      {/* Campaign Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {campaigns.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Campaigns
                  </Typography>
                </Box>
                <CampaignIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    {campaigns.filter(c => c.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Campaigns
                  </Typography>
                </Box>
                <PlayArrow sx={{ fontSize: 40, color: 'success.main' }} />
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
                    {campaigns.reduce((sum, c) => sum + c.callsCompleted, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Calls Completed
                  </Typography>
                </Box>
                <CallMade sx={{ fontSize: 40, color: 'info.main' }} />
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
                    {formatCurrency(campaigns.reduce((sum, c) => sum + c.totalRecovered, 0))}
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

      {/* Campaigns List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Campaign Management
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Campaign Name</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Progress</strong></TableCell>
                  <TableCell><strong>Success Rate</strong></TableCell>
                  <TableCell><strong>Collection Rate</strong></TableCell>
                  <TableCell><strong>Total Recovered</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {campaign.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {campaign.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        size="small"
                        color={getStatusColor(campaign.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={getCampaignProgress(campaign)}
                          sx={{ width: 100, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption">
                          {campaign.callsCompleted}/{campaign.totalPatients}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {campaign.successRate.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {campaign.collectionRate.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(campaign.totalRecovered)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.priority}
                        size="small"
                        color={getPriorityColor(campaign.priority)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleCampaignClick(campaign)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        {campaign.status === 'scheduled' && (
                          <IconButton
                            size="small"
                            onClick={() => handleStartCampaign(campaign.id)}
                            title="Start Campaign"
                            color="success"
                          >
                            <PlayArrow />
                          </IconButton>
                        )}
                        {campaign.status === 'active' && (
                          <IconButton
                            size="small"
                            onClick={() => handlePauseCampaign(campaign.id)}
                            title="Pause Campaign"
                            color="warning"
                          >
                            <Pause />
                          </IconButton>
                        )}
                        {(campaign.status === 'active' || campaign.status === 'paused') && (
                          <IconButton
                            size="small"
                            onClick={() => handleStopCampaign(campaign.id)}
                            title="Stop Campaign"
                            color="error"
                          >
                            <Stop />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          title="Edit Campaign"
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Campaign Details: {selectedCampaign?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedCampaign && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Campaign Overview
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CampaignIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Campaign Name"
                            secondary={selectedCampaign.name}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Assessment />
                          </ListItemIcon>
                          <ListItemText
                            primary="Status"
                            secondary={
                              <Chip
                                label={selectedCampaign.status}
                                size="small"
                                color={getStatusColor(selectedCampaign.status)}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Schedule />
                          </ListItemIcon>
                          <ListItemText
                            primary="Duration"
                            secondary={`${formatDate(selectedCampaign.startDate)} - ${formatDate(selectedCampaign.endDate)}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <People />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Patients"
                            secondary={selectedCampaign.totalPatients}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Timer />
                          </ListItemIcon>
                          <ListItemText
                            primary="Average Call Duration"
                            secondary={formatDuration(selectedCampaign.averageCallDuration)}
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
                        Performance Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="primary.main">
                              {selectedCampaign.callsCompleted}
                            </Typography>
                            <Typography variant="caption">Calls Completed</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="warning.main">
                              {selectedCampaign.callsScheduled}
                            </Typography>
                            <Typography variant="caption">Calls Scheduled</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="success.main">
                              {selectedCampaign.successRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption">Success Rate</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="info.main">
                              {selectedCampaign.collectionRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption">Collection Rate</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="success.main">
                              {formatCurrency(selectedCampaign.totalRecovered)}
                            </Typography>
                            <Typography variant="caption">Total Recovered</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Campaign Progress
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={getCampaignProgress(selectedCampaign)}
                          sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          {getCampaignProgress(selectedCampaign).toFixed(1)}%
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCampaign.callsCompleted} of {selectedCampaign.totalPatients} calls completed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedCampaign?.status === 'scheduled' && (
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => {
                handleStartCampaign(selectedCampaign.id);
                setDetailsOpen(false);
              }}
            >
              Start Campaign
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Agent Type</InputLabel>
                <Select
                  value={newCampaign.agentType}
                  onChange={(e) => setNewCampaign({ ...newCampaign, agentType: e.target.value })}
                  label="Agent Type"
                >
                  <MenuItem value="debt_collection">Debt Collection</MenuItem>
                  <MenuItem value="payment_reminder">Payment Reminder</MenuItem>
                  <MenuItem value="follow_up">Follow Up</MenuItem>
                  <MenuItem value="customer_service">Customer Service</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newCampaign.priority}
                  onChange={(e) => setNewCampaign({ ...newCampaign, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={newCampaign.startDate}
                onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={newCampaign.endDate}
                onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Patients"
                type="number"
                value={newCampaign.totalPatients}
                onChange={(e) => setNewCampaign({ ...newCampaign, totalPatients: parseInt(e.target.value) || 0 })}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateCampaign}
            disabled={!newCampaign.name || !newCampaign.startDate || !newCampaign.endDate}
          >
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CallCampaigns;
