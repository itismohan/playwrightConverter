import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';

interface FileProgressItemProps {
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  errorMessage?: string;
}

const FileProgressItem: React.FC<FileProgressItemProps> = ({
  fileName,
  fileSize,
  progress,
  status,
  errorMessage,
}) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Status styles mapping
  const statusStyles = {
    pending: {
      color: 'text.secondary',
      progressColor: 'grey',
      label: 'Waiting to process...'
    },
    processing: {
      color: 'info.main',
      progressColor: 'info',
      label: 'Processing...'
    },
    complete: {
      color: 'success.main',
      progressColor: 'success',
      label: 'Conversion complete'
    },
    error: {
      color: 'error.main',
      progressColor: 'error',
      label: 'Error during conversion'
    },
  };

  const currentStyles = statusStyles[status];

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 2, 
        p: 2, 
        borderRadius: 2,
        bgcolor: status === 'error' ? 'error.50' : 
                status === 'complete' ? 'success.50' : 
                status === 'processing' ? 'info.50' : 'grey.50'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1">{fileName}</Typography>
        <Typography variant="body2">{formatFileSize(fileSize)}</Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        color={currentStyles.progressColor as "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit" | undefined}
        sx={{ mb: 1, height: 6, borderRadius: 3 }}
      />
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color={currentStyles.color}>
          {currentStyles.label}
        </Typography>
        <Typography variant="body2">{progress}%</Typography>
      </Box>
      
      {status === 'error' && errorMessage && (
        <Box mt={1} p={1} bgcolor="error.100" borderRadius={1}>
          <Typography variant="body2" color="error.main">{errorMessage}</Typography>
        </Box>
      )}
      
      <Box sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {`File ${fileName}, size ${formatFileSize(fileSize)}, conversion ${status}, progress ${progress}%`}
        {status === 'error' && errorMessage && `, Error: ${errorMessage}`}
      </Box>
    </Paper>
  );
};

export default FileProgressItem;
