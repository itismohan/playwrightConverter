import React, { ReactNode } from 'react';
import { Box, Container, Stack, useMediaQuery, useTheme } from '@mui/material';

interface ResponsiveLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  sidebarWidth?: string | number;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  maxWidth = 'lg',
  sidebarWidth = '280px',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Container maxWidth={maxWidth} sx={{ py: 4 }}>
      {sidebar ? (
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>
          <Box
            sx={{
              width: isMobile ? '100%' : sidebarWidth,
              flexShrink: 0,
              mb: isMobile ? 3 : 0,
            }}
          >
            {sidebar}
          </Box>
          <Box sx={{ flexGrow: 1 }}>{children}</Box>
        </Box>
      ) : (
        children
      )}
    </Container>
  );
};

export default ResponsiveLayout;
