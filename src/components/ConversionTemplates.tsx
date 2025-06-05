import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  useTheme
} from '@mui/material';
import AccessibleCard from './AccessibleCard';
import { Code, SmartToy, Build, PhoneAndroid } from '@mui/icons-material';

interface ConversionTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ConversionTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const theme = useTheme();
  
  const templates: ConversionTemplate[] = [
    {
      id: 'basic',
      title: 'Basic Test Conversion',
      description: 'Simple test cases with standard Selenium selectors and assertions',
      icon: <Code fontSize="large" />,
    },
    {
      id: 'pageObject',
      title: 'Page Object Model',
      description: 'Convert Selenium Page Object Model pattern to Playwright',
      icon: <SmartToy fontSize="large" />,
    },
    {
      id: 'datadriven',
      title: 'Data-Driven Tests',
      description: 'Tests with parameterized data sources and multiple iterations',
      icon: <Build fontSize="large" />,
    },
    {
      id: 'e2e',
      title: 'End-to-End Workflows',
      description: 'Complex multi-step user journey tests with assertions',
      icon: <PhoneAndroid fontSize="large" />,
    },
  ];
  
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id === selectedTemplate ? null : id);
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Conversion Templates
      </Typography>
      <Typography variant="body1" paragraph>
        Select a template that best matches your Selenium test structure for optimized conversion
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} key={template.id}>
            <AccessibleCard
              title={template.title}
              description={template.description}
              icon={template.icon}
              isSelected={selectedTemplate === template.id}
              onClick={() => handleSelectTemplate(template.id)}
            />
          </Grid>
        ))}
      </Grid>
      
      {selectedTemplate && (
        <Box mt={3}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
          >
            Apply Template
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ConversionTemplates;
