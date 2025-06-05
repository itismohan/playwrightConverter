import React from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';

interface AccessibleCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const AccessibleCard: React.FC<AccessibleCardProps> = ({
  title,
  description,
  icon,
  isSelected = false,
  onClick,
  children,
}) => {
  // Generate a unique ID for accessibility
  const id = `card-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <Card
      id={id}
      sx={{
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        transform: isSelected ? 'translateY(-2px)' : 'none',
        boxShadow: isSelected ? 3 : 1,
        border: isSelected ? '1px solid' : '1px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        bgcolor: isSelected ? 'primary.50' : 'background.paper',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 2,
        } : {},
        '&:active': onClick ? {
          transform: 'translateY(0)',
          boxShadow: 1,
        } : {},
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? isSelected : undefined}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="center" mb={description ? 2 : 0}>
          {icon && <Box mr={2}>{icon}</Box>}
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </Box>
        
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
};

export default AccessibleCard;
