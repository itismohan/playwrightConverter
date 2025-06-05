import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  LinearProgress,
  useTheme,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const ConversionAnalytics: React.FC = () => {
  const theme = useTheme();
  
  // Sample analytics data
  const [analyticsData] = useState({
    totalConversions: 1247,
    successRate: 94.3,
    averageTime: '1.8s',
    errorRate: 5.7,
    conversionTrend: 12.4,
    popularSelectors: [
      { name: 'ID', count: 532, percentage: 42 },
      { name: 'CSS', count: 347, percentage: 28 },
      { name: 'XPath', count: 218, percentage: 17 },
      { name: 'Name', count: 103, percentage: 8 },
      { name: 'Other', count: 62, percentage: 5 },
    ],
    commonErrors: [
      { type: 'Unsupported selector', count: 37, percentage: 52 },
      { type: 'Complex XPath', count: 18, percentage: 25 },
      { type: 'Custom wait logic', count: 12, percentage: 17 },
      { type: 'Other', count: 4, percentage: 6 },
    ],
  });

  // Colors for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  // Prepare data for pie charts
  const selectorData = analyticsData.popularSelectors.map(item => ({
    name: item.name,
    value: item.percentage
  }));

  const errorData = analyticsData.commonErrors.map(item => ({
    name: item.type,
    value: item.percentage
  }));

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Conversion Analytics
      </Typography>
      <Typography variant="body1" paragraph>
        Performance metrics and insights from your Selenium to Playwright conversions
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Conversions */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 12, right: 12, opacity: 0.2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main' }} />
            </Box>
            <Typography variant="subtitle2" color="text.secondary">Total Conversions</Typography>
            <Typography variant="h4" sx={{ my: 1 }}>{analyticsData.totalConversions}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'success.main',
                  mr: 1,
                  '&::before': {
                    content: '""',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: '4px solid currentColor',
                    mr: 0.5
                  }
                }}
              >
                {analyticsData.conversionTrend}%
              </Box>
              <Typography variant="body2" color="text.secondary">this month</Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Success Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 12, right: 12, opacity: 0.2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'success.main' }} />
            </Box>
            <Typography variant="subtitle2" color="text.secondary">Success Rate</Typography>
            <Typography variant="h4" sx={{ my: 1 }}>{analyticsData.successRate}%</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'success.main',
                  mr: 1,
                  '&::before': {
                    content: '""',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: '4px solid currentColor',
                    mr: 0.5
                  }
                }}
              >
                2.1%
              </Box>
              <Typography variant="body2" color="text.secondary">improvement</Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Error Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 12, right: 12, opacity: 0.2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'error.main' }} />
            </Box>
            <Typography variant="subtitle2" color="text.secondary">Error Rate</Typography>
            <Typography variant="h4" sx={{ my: 1 }}>{analyticsData.errorRate}%</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'success.main',
                  mr: 1,
                  '&::before': {
                    content: '""',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '4px solid currentColor',
                    mr: 0.5
                  }
                }}
              >
                2.1%
              </Box>
              <Typography variant="body2" color="text.secondary">decrease</Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Average Conversion Time */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 12, right: 12, opacity: 0.2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'info.main' }} />
            </Box>
            <Typography variant="subtitle2" color="text.secondary">Avg. Conversion Time</Typography>
            <Typography variant="h4" sx={{ my: 1 }}>{analyticsData.averageTime}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'success.main',
                  mr: 1,
                  '&::before': {
                    content: '""',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '4px solid currentColor',
                    mr: 0.5
                  }
                }}
              >
                0.3s
              </Box>
              <Typography variant="body2" color="text.secondary">faster</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Popular Selectors */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Popular Selectors</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={selectorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {selectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              {analyticsData.popularSelectors.map((selector, index) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{selector.name}</Typography>
                    <Typography variant="body2">{selector.count} ({selector.percentage}%)</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={selector.percentage} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: COLORS[index % COLORS.length]
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        {/* Common Errors */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Common Errors</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {errorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              {analyticsData.commonErrors.map((error, index) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{error.type}</Typography>
                    <Typography variant="body2">{error.count} ({error.percentage}%)</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={error.percentage} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: COLORS[index % COLORS.length]
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConversionAnalytics;
