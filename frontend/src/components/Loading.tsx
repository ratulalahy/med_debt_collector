// Loading Component
// Shows loading states throughout the application

import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Skeleton,
  Stack,
  LinearProgress
} from '@mui/material';

interface LoadingProps {
  variant?: 'circular' | 'linear' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'circular',
  size = 'medium',
  message = 'Loading...',
  fullScreen = false,
  overlay = false
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 40;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  const renderContent = () => {
    switch (variant) {
      case 'linear':
        return (
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <LinearProgress />
            {message && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {message}
              </Typography>
            )}
          </Box>
        );
      
      case 'skeleton':
        return (
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        );
      
      default:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={getSizeValue()} />
            {message && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {message}
              </Typography>
            )}
          </Box>
        );
    }
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...(fullScreen && {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9998,
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }),
    ...(overlay && {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.8)'
    }),
    ...(!fullScreen && !overlay && {
      minHeight: 200,
      p: 4
    })
  };

  return (
    <Box sx={containerStyles}>
      {renderContent()}
    </Box>
  );
};

// Table Loading Skeleton Component
export const TableLoadingSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 6 
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="rectangular"
              height={40}
              sx={{ flex: 1 }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

// Card Loading Skeleton Component
export const CardLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Paper key={index} sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} />
        </Paper>
      ))}
    </Stack>
  );
};

// Chart Loading Skeleton Component
export const ChartLoadingSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => {
  return (
    <Box sx={{ width: '100%', height, position: 'relative' }}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <CircularProgress />
      </Box>
    </Box>
  );
};

export default Loading;
