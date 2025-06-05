import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  IconButton,
  Flex,
  useTheme
} from '@mui/material';
import { Download, Delete, Edit } from '@mui/icons-material';

interface Project {
  id: string;
  name: string;
  lastModified: string;
  fileCount: number;
  size: string;
}

const ProjectSaveManager: React.FC = () => {
  const theme = useTheme();
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj-1',
      name: 'Login Test Suite',
      lastModified: '2025-06-01',
      fileCount: 12,
      size: '1.2 MB',
    },
    {
      id: 'proj-2',
      name: 'E-commerce Tests',
      lastModified: '2025-05-28',
      fileCount: 24,
      size: '2.8 MB',
    },
    {
      id: 'proj-3',
      name: 'API Integration Tests',
      lastModified: '2025-05-15',
      fileCount: 8,
      size: '0.9 MB',
    },
  ]);
  
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  const handleSelectProject = (id: string) => {
    setSelectedProject(id === selectedProject ? null : id);
  };
  
  const handleDeleteProject = (id: string) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
    if (selectedProject === id) {
      setSelectedProject(null);
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Saved Projects
      </Typography>
      <Typography variant="body1" paragraph>
        Manage your saved conversion projects
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell>Files</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map(project => (
              <TableRow 
                key={project.id} 
                onClick={() => handleSelectProject(project.id)}
                selected={selectedProject === project.id}
                hover
                sx={{ 
                  cursor: 'pointer',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light + '20',
                  }
                }}
              >
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.lastModified}</TableCell>
                <TableCell>{project.fileCount}</TableCell>
                <TableCell>{project.size}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <IconButton
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Download logic would go here
                      }}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Download />}
        >
          Save Current Project
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<Edit />}
          disabled={!selectedProject}
        >
          Edit Project Details
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectSaveManager;
