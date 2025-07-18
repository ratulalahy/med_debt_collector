import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, useMediaQuery } from '@mui/material';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import NotificationSystem from './components/NotificationSystem';
import Dashboard from './pages/Dashboard';
import DataUpload from './pages/DataUpload';
import PatientManagement from './pages/PatientManagement';
import CallQueueManagement from './pages/CallQueueManagement';
import IncomingCalls from './pages/IncomingCalls';
import CalendarScheduling from './pages/CalendarScheduling';
import CallCampaigns from './pages/CallCampaigns';
import Reports from './pages/Reports';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const drawerWidth = 240;
  const collapsedWidth = 64;
  
  // Check if screen is mobile
  const isMobile = useMediaQuery('(max-width:900px)');
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                p: { xs: 2, sm: 3 }, // Responsive padding
                ml: 0, // Remove fixed margin
                backgroundColor: 'background.default',
                minHeight: '100vh',
                transition: theme.transitions.create(['margin', 'width'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                width: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedWidth}px)`,
                // Ensure proper scrolling
                overflowX: 'auto',
                overflowY: 'auto',
              }}
            >
              <Box sx={{ 
                animation: 'fadeIn 0.3s ease-in-out',
                '@keyframes fadeIn': {
                  from: { opacity: 0.8, transform: 'translateX(10px)' },
                  to: { opacity: 1, transform: 'translateX(0)' },
                },
              }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/upload" element={<DataUpload />} />
                  <Route path="/patients" element={<PatientManagement />} />
                  <Route path="/call-queue" element={<CallQueueManagement />} />
                  <Route path="/incoming-calls" element={<IncomingCalls />} />
                  <Route path="/calendar" element={<CalendarScheduling />} />
                  <Route path="/campaigns" element={<CallCampaigns />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </Box>
            </Box>
          </Box>
          <NotificationSystem />
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
