import React, { useState, useEffect } from 'react';
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
  Chip, 
  Button,
  IconButton
} from '@mui/material';
import { PlayArrow, Pause, Delete } from '@mui/icons-material';

interface Job {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  timeElapsed: string;
  timeRemaining: string;
}

const BatchJobQueue: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'job-1',
      name: 'LoginTest Suite',
      status: 'running',
      progress: 45,
      timeElapsed: '01:23',
      timeRemaining: '01:45',
    },
    {
      id: 'job-2',
      name: 'ShoppingCartTest Suite',
      status: 'queued',
      progress: 0,
      timeElapsed: '00:00',
      timeRemaining: '03:20',
    },
    {
      id: 'job-3',
      name: 'CheckoutTest Suite',
      status: 'completed',
      progress: 100,
      timeElapsed: '02:15',
      timeRemaining: '00:00',
    },
    {
      id: 'job-4',
      name: 'UserProfileTest Suite',
      status: 'failed',
      progress: 67,
      timeElapsed: '01:45',
      timeRemaining: '00:00',
    },
  ]);
  
  // Update running job progress
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => 
        prevJobs.map(job => {
          if (job.status === 'running' && job.progress < 100) {
            const newProgress = Math.min(job.progress + 1, 100);
            const newTimeElapsed = incrementTime(job.timeElapsed);
            const newTimeRemaining = decrementTime(job.timeRemaining);
            
            return {
              ...job,
              progress: newProgress,
              timeElapsed: newTimeElapsed,
              timeRemaining: newTimeRemaining,
              status: newProgress === 100 ? 'completed' : 'running',
            };
          }
          return job;
        })
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Helper functions for time manipulation
  const incrementTime = (timeStr: string): string => {
    const [mins, secs] = timeStr.split(':').map(Number);
    const totalSecs = mins * 60 + secs + 1;
    const newMins = Math.floor(totalSecs / 60);
    const newSecs = totalSecs % 60;
    return `${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
  };
  
  const decrementTime = (timeStr: string): string => {
    const [mins, secs] = timeStr.split(':').map(Number);
    const totalSecs = Math.max(0, mins * 60 + secs - 1);
    const newMins = Math.floor(totalSecs / 60);
    const newSecs = totalSecs % 60;
    return `${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
  };
  
  // Job actions
  const toggleJobStatus = (id: string) => {
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === id) {
          return {
            ...job,
            status: job.status === 'running' ? 'queued' : 
                   job.status === 'queued' ? 'running' : job.status
          };
        }
        return job;
      })
    );
  };
  
  const removeJob = (id: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
  };
  
  // Status chip styles
  const getStatusChip = (status: Job['status']) => {
    const statusProps = {
      queued: { color: 'default', label: 'Queued' },
      running: { color: 'primary', label: 'Running' },
      completed: { color: 'success', label: 'Completed' },
      failed: { color: 'error', label: 'Failed' },
    };
    
    const { color, label } = statusProps[status];
    
    return (
      <Chip 
        label={label} 
        color={color as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"} 
        size="small" 
      />
    );
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Batch Job Queue
      </Typography>
      <Typography variant="body1" paragraph>
        Monitor and manage your batch conversion jobs
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Job Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Time Elapsed</TableCell>
              <TableCell>Est. Remaining</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map(job => (
              <TableRow 
                key={job.id}
                sx={{ 
                  bgcolor: 
                    job.status === 'failed' ? 'error.50' : 
                    job.status === 'completed' ? 'success.50' : 
                    'inherit'
                }}
              >
                <TableCell>{job.name}</TableCell>
                <TableCell>{getStatusChip(job.status)}</TableCell>
                <TableCell>{job.progress}%</TableCell>
                <TableCell>{job.timeElapsed}</TableCell>
                <TableCell>{job.timeRemaining}</TableCell>
                <TableCell>
                  <Box>
                    {(job.status === 'queued' || job.status === 'running') && (
                      <IconButton
                        size="small"
                        color={job.status === 'running' ? 'warning' : 'primary'}
                        onClick={() => toggleJobStatus(job.id)}
                        sx={{ mr: 1 }}
                      >
                        {job.status === 'running' ? <Pause /> : <PlayArrow />}
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeJob(job.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BatchJobQueue;
