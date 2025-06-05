import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Typography, Button, LinearProgress, Stack } from '@mui/material';
import { UploadFile, CreateNewFolder, CloudUpload } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface EnterpriseDropZoneProps {
  onFilesAccepted: (files: File[], rootPath: string) => void;
  onError: (message: string) => void;
  maxFileSize?: number;
}

const EnterpriseDropZone: React.FC<EnterpriseDropZoneProps> = ({
  onFilesAccepted,
  onError,
  maxFileSize = 1000 * 1024 * 1024, // Default 1000MB (1GB)
}) => {
  const theme = useTheme();
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isDragActive, setIsDragActive] = React.useState<boolean>(false);
  
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }
    
    // Check file size
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      onError(`Some files exceed the maximum size limit of ${formatFileSize(maxFileSize)}`);
      return;
    }
    
    // Simulate upload progress
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          
          // Get root path from webkitRelativePath if available
          let rootPath = '';
          if (acceptedFiles[0].webkitRelativePath) {
            const pathParts = acceptedFiles[0].webkitRelativePath.split('/');
            if (pathParts.length > 1) {
              rootPath = pathParts[0];
            }
          }
          
          onFilesAccepted(acceptedFiles, rootPath);
        }, 500);
      }
    }, 100);
  }, [maxFileSize, onError, onFilesAccepted]);
  
  const {
    getRootProps,
    getInputProps,
    isDragReject,
    open,
  } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => {
      setIsDragActive(false);
      onError('Invalid file type or other drop error');
    },
  });
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  
  const MotionBox = motion(Box);
  
  return (
    <Box>
      <MotionBox
        {...getRootProps()}
        sx={{
          p: 8,
          border: '2px dashed',
          borderColor: isDragActive 
            ? 'primary.main' 
            : isDragReject 
              ? 'error.main' 
              : 'divider',
          borderRadius: 2,
          bgcolor: isDragActive 
            ? alpha(theme.palette.primary.main, 0.05)
            : isDragReject 
              ? alpha(theme.palette.error.main, 0.05)
              : 'background.paper',
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.light',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          },
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input {...getInputProps()} directory="" webkitdirectory="" />
        
        {isUploading ? (
          <Stack spacing={4} width="100%" maxWidth="400px">
            <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mx: 'auto' }} />
            <Typography variant="h6">Uploading files...</Typography>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body1">{uploadProgress}%</Typography>
          </Stack>
        ) : (
          <>
            <UploadFile sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Drag & Drop Files or Folders
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: 500 }}>
              Upload Java Selenium test files or entire project folders to convert them to Playwright TypeScript
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
              Maximum file size: {formatFileSize(maxFileSize)}
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<UploadFile />}
                onClick={open}
              >
                Select Files
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<CreateNewFolder />}
                onClick={open}
              >
                Select Folder
              </Button>
            </Stack>
          </>
        )}
      </MotionBox>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Supported file types: .java
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Batch conversion available for multiple files
        </Typography>
      </Box>
    </Box>
  );
};

export default EnterpriseDropZone;
