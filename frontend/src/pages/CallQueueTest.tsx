// Simple test component to verify CallQueueManagement works
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const CallQueueTest: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Call Queue Test
      </Typography>
      <Typography variant="body1">
        This is a test component to verify the page renders correctly.
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }}>
        Test Button
      </Button>
    </Box>
  );
};

export default CallQueueTest;
