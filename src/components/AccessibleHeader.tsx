import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

interface AccessibleHeaderProps {
  title: string;
  subtitle?: string;
  onToggleColorMode: () => void;
  isDarkMode: boolean;
}

const AccessibleHeader: React.FC<AccessibleHeaderProps> = ({
  title,
  subtitle,
  onToggleColorMode,
  isDarkMode,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h1"
            color="text.primary"
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <IconButton
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onToggleColorMode}
          color="inherit"
          edge="end"
        >
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AccessibleHeader;
