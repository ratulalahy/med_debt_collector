// Test script to verify CallQueueManagement component functionality
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CallQueueManagement from './CallQueueManagement';

const theme = createTheme();

interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

// Note: Testing framework not installed. Component exports available for manual testing.
export { TestWrapper, CallQueueManagement };
