import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { FolderOutlined, FolderOpenOutlined, Description, Code } from '@mui/icons-material';
import type { FileNode } from '../utils/types';

interface AccessibleFileTreeProps {
  files: FileNode[];
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  onSelectFile: (path: string) => void;
}

const AccessibleFileTree: React.FC<AccessibleFileTreeProps> = ({
  files,
  expandedPaths,
  onToggleExpand,
  onSelectFile,
}) => {
  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = node.isDirectory && expandedPaths.has(node.path);
    const isJavaFile = !node.isDirectory && node.name.endsWith('.java');
    const isGradleFile = !node.isDirectory && node.name.endsWith('.gradle');
    
    const getFileIcon = () => {
      if (node.isDirectory) {
        return isExpanded ? <FolderOpenOutlined color="primary" /> : <FolderOutlined color="primary" />;
      } else if (isJavaFile) {
        return <Code color="warning" />;
      } else if (isGradleFile) {
        return <Code color="secondary" />;
      } else {
        return <Description color="action" />;
      }
    };
    
    return (
      <React.Fragment key={node.path}>
        <ListItem
          button
          sx={{
            pl: depth * 2 + 1,
            borderRadius: 1,
            my: 0.5,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => {
            if (node.isDirectory) {
              onToggleExpand(node.path);
            } else {
              onSelectFile(node.path);
            }
          }}
          role={node.isDirectory ? 'button' : 'link'}
          aria-expanded={node.isDirectory ? isExpanded : undefined}
          tabIndex={0}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {getFileIcon()}
          </ListItemIcon>
          <ListItemText primary={node.name} />
          <Box sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
            {node.isDirectory ? 'Directory' : 'File'} {node.name}
            {node.isDirectory && (isExpanded ? ', expanded' : ', collapsed')}
          </Box>
        </ListItem>
        
        {node.isDirectory && node.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children.map(child => renderFileNode(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1 }}>
      <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>Project Files</Typography>
      <List dense component="nav" aria-label="project files">
        {files.map(file => renderFileNode(file))}
      </List>
    </Box>
  );
};

export default AccessibleFileTree;
