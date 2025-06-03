import React, { useState, useEffect } from 'react';

interface FileTreeProps {
  files: File[];
  rootPath: string;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
  file?: File;
}

const FileTree: React.FC<FileTreeProps> = ({ files, rootPath }) => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (files.length > 0) {
      const tree = buildFileTree(files, rootPath);
      setTreeData(tree);
      
      // Auto-expand the root and first level directories
      const initialExpanded = new Set<string>();
      initialExpanded.add(rootPath);
      
      if (tree.children) {
        tree.children.forEach(child => {
          if (child.isDirectory) {
            initialExpanded.add(child.path);
          }
        });
      }
      
      setExpandedNodes(initialExpanded);
    }
  }, [files, rootPath]);

  const buildFileTree = (files: File[], rootPath: string): TreeNode => {
    const root: TreeNode = {
      name: rootPath || 'Project Root',
      path: rootPath,
      isDirectory: true,
      children: []
    };
    
    const pathMap = new Map<string, TreeNode>();
    pathMap.set(rootPath, root);
    
    files.forEach(file => {
      // Get the file path relative to the root
      const relativePath = file.webkitRelativePath || file.name;
      const pathParts = relativePath.split('/');
      
      // Skip the root directory itself
      if (pathParts.length === 1 && pathParts[0] === rootPath) {
        return;
      }
      
      let currentPath = '';
      let parentNode = root;
      
      // Create or find nodes for each directory in the path
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!pathMap.has(currentPath)) {
          const newNode: TreeNode = {
            name: part,
            path: currentPath,
            isDirectory: true,
            children: []
          };
          
          parentNode.children.push(newNode);
          pathMap.set(currentPath, newNode);
        }
        
        parentNode = pathMap.get(currentPath)!;
      }
      
      // Add the file node
      const fileName = pathParts[pathParts.length - 1];
      const filePath = currentPath ? `${currentPath}/${fileName}` : fileName;
      
      const fileNode: TreeNode = {
        name: fileName,
        path: filePath,
        isDirectory: false,
        children: [],
        file: file
      };
      
      parentNode.children.push(fileNode);
    });
    
    // Sort each level: directories first, then files, both alphabetically
    const sortNodes = (node: TreeNode) => {
      node.children.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      node.children.forEach(child => {
        if (child.isDirectory) {
          sortNodes(child);
        }
      });
    };
    
    sortNodes(root);
    return root;
  };

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.path);
    const isJavaFile = !node.isDirectory && node.name.endsWith('.java');
    const isGradleFile = !node.isDirectory && (node.name === 'build.gradle' || node.name === 'settings.gradle');
    
    return (
      <div key={node.path} className="file-tree-node">
        <div 
          className={`file-tree-node-content ${node.isDirectory ? 'directory' : 'file'} ${isJavaFile ? 'java-file' : ''} ${isGradleFile ? 'gradle-file' : ''}`}
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => node.isDirectory && toggleNode(node.path)}
        >
          {node.isDirectory ? (
            <span className="directory-icon">
              {isExpanded ? '📂' : '📁'}
            </span>
          ) : (
            <span className="file-icon">
              {isJavaFile ? '☕' : isGradleFile ? '⚙️' : '📄'}
            </span>
          )}
          <span className="node-name">{node.name}</span>
        </div>
        
        {node.isDirectory && isExpanded && (
          <div className="file-tree-children">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-tree-container">
      <h3>Project Structure</h3>
      <div className="file-tree">
        {treeData ? renderTreeNode(treeData) : <p>No files uploaded</p>}
      </div>
      <div className="file-stats">
        <p>
          {files.length} file{files.length !== 1 ? 's' : ''} total
          {' • '}
          {files.filter(f => f.name.endsWith('.java')).length} Java file{files.filter(f => f.name.endsWith('.java')).length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default FileTree;
