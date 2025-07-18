import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Upload as UploadIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  Assessment as ReportsIcon,
  LocalHospital as HospitalIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Queue as QueueIcon,
  CallReceived as IncomingCallsIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';

const drawerWidth = 240;
const collapsedWidth = 64;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Data Upload', icon: <UploadIcon />, path: '/upload' },
  { text: 'Patient Management', icon: <PeopleIcon />, path: '/patients' },
  { text: 'Call Queue', icon: <QueueIcon />, path: '/call-queue' },
  { text: 'Incoming Calls', icon: <IncomingCallsIcon />, path: '/incoming-calls' },
  { text: 'Calendar & Scheduling', icon: <CalendarTodayIcon />, path: '/calendar' },
  { text: 'Call Campaigns', icon: <CampaignIcon />, path: '/campaigns' },
  { text: 'Reports & Analytics', icon: <ReportsIcon />, path: '/reports' },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Box sx={{ 
        p: open ? 2 : 1, 
        textAlign: 'center',
        position: 'relative',
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <IconButton
          onClick={onToggle}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
        
        <HospitalIcon sx={{ fontSize: open ? 40 : 32, mb: open ? 1 : 0 }} />
        {open && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>
              Medical Debt
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
              Collection System
            </Typography>
          </>
        )}
      </Box>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <Tooltip
            key={item.text}
            title={open ? '' : item.text}
            placement="right"
            arrow
          >
            <ListItem
              onClick={() => handleNavigation(item.path)}
              sx={{
                mb: 1,
                borderRadius: 2,
                cursor: 'pointer',
                backgroundColor:
                  location.pathname === item.path
                    ? 'rgba(255,255,255,0.2)'
                    : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                transition: 'background-color 0.2s',
                justifyContent: open ? 'initial' : 'center',
                px: open ? 2 : 1,
              }}
            >
              <ListItemIcon sx={{ 
                color: 'white', 
                minWidth: open ? 40 : 'auto',
                justifyContent: 'center'
              }}>
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              )}
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
