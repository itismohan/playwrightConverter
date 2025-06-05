import React from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Download, ContentCopy } from '@mui/icons-material';
import { IconButton, Button, Tooltip } from '@mui/material';

interface CodeComparisonProps {
  originalCode: string;
  convertedCode: string;
  originalFileName: string;
  convertedFileName: string;
}

const CodeComparison: React.FC<CodeComparisonProps> = ({
  originalCode,
  convertedCode,
  originalFileName,
  convertedFileName,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalCode);
  };
  
  const handleCopyConverted = () => {
    navigator.clipboard.writeText(convertedCode);
  };
  
  const handleDownloadOriginal = () => {
    const element = document.createElement('a');
    const file = new Blob([originalCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = originalFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleDownloadConverted = () => {
    const element = document.createElement('a');
    const file = new Blob([convertedCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = convertedFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={2} 
          sx={{ 
            height: '100%', 
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ 
            p: 1.5, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default'
          }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {originalFileName} (Selenium - Java)
            </Typography>
            <Box>
              <Tooltip title="Copy code">
                <IconButton size="small" onClick={handleCopyOriginal} sx={{ mr: 1 }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download file">
                <IconButton size="small" onClick={handleDownloadOriginal}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
            <SyntaxHighlighter
              language="java"
              style={isDarkMode ? atomOneDark : docco}
              customStyle={{ 
                margin: 0,
                padding: '16px',
                fontSize: '14px',
                lineHeight: '1.5',
                borderRadius: 0
              }}
            >
              {originalCode || '// No code to display'}
            </SyntaxHighlighter>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={2} 
          sx={{ 
            height: '100%', 
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: theme.palette.primary.main + '40',
          }}
        >
          <Box sx={{ 
            p: 1.5, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: theme.palette.primary.main + '40',
            bgcolor: theme.palette.primary.main + '08'
          }}>
            <Typography variant="subtitle1" fontWeight="medium" color="primary">
              {convertedFileName} (Playwright - TypeScript)
            </Typography>
            <Box>
              <Tooltip title="Copy code">
                <IconButton size="small" onClick={handleCopyConverted} sx={{ mr: 1 }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download file">
                <IconButton size="small" onClick={handleDownloadConverted}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
            <SyntaxHighlighter
              language="typescript"
              style={isDarkMode ? atomOneDark : docco}
              customStyle={{ 
                margin: 0,
                padding: '16px',
                fontSize: '14px',
                lineHeight: '1.5',
                borderRadius: 0
              }}
            >
              {convertedCode || '// Conversion in progress...'}
            </SyntaxHighlighter>
          </Box>
          
          {convertedCode && (
            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Download />}
                onClick={handleDownloadConverted}
              >
                Download Converted Code
              </Button>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CodeComparison;
