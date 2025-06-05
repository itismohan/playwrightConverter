import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, Paper, Tabs, Tab, Typography, useMediaQuery } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import AccessibleHeader from './components/AccessibleHeader';
import EnterpriseDropZone from './components/EnterpriseDropZone';
import AccessibleFileTree from './components/AccessibleFileTree';
import CodeComparison from './components/CodeComparison';
import FileProgressItem from './components/FileProgressItem';
import ConversionTemplates from './components/ConversionTemplates';
import BatchJobQueue from './components/BatchJobQueue';
import ConversionAnalytics from './components/ConversionAnalytics';
import ProjectSaveManager from './components/ProjectSaveManager';
import muiTheme from './theme/mui-theme';

// Define the interface for file nodes in the file tree
interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

function App() {
  // State for theme mode
  const [darkMode, setDarkMode] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // State for file upload and conversion
  const [files, setFiles] = useState<File[]>([]);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [convertedCode, setConvertedCode] = useState<string>('');
  const [originalCode, setOriginalCode] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);

  // Create theme based on dark mode preference
  const theme = React.useMemo(() => {
    return createTheme({
      ...muiTheme,
      palette: {
        ...muiTheme.palette,
        mode: darkMode ? 'dark' : 'light',
      },
    });
  }, [darkMode]);

  // Toggle dark mode
  const toggleColorMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle file upload
  const handleFilesAccepted = (acceptedFiles: File[], rootPath: string) => {
    setFiles(acceptedFiles);
    
    // Build file tree
    const tree: FileNode[] = [];
    const pathMap: { [key: string]: FileNode } = {};
    
    acceptedFiles.forEach(file => {
      const path = file.webkitRelativePath || file.name;
      const parts = path.split('/');
      
      let currentPath = '';
      let parentPath = '';
      
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!pathMap[currentPath]) {
          const node: FileNode = {
            name: part,
            path: currentPath,
            isDirectory: !isLast,
            children: isLast ? undefined : [],
          };
          
          pathMap[currentPath] = node;
          
          if (index === 0) {
            tree.push(node);
          } else {
            if (pathMap[parentPath] && pathMap[parentPath].children) {
              pathMap[parentPath].children!.push(node);
            }
          }
        }
        
        parentPath = currentPath;
      });
    });
    
    setFileTree(tree);
    
    // Auto-expand first level
    const newExpandedPaths = new Set<string>();
    tree.forEach(node => {
      if (node.isDirectory) {
        newExpandedPaths.add(node.path);
      }
    });
    setExpandedPaths(newExpandedPaths);
    
    // Reset other states
    setSelectedFile(null);
    setConvertedCode('');
    setOriginalCode('');
    setUploadError(null);
  };

  // Handle file tree interactions
  const handleToggleExpand = (path: string) => {
    const newExpandedPaths = new Set(expandedPaths);
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path);
    } else {
      newExpandedPaths.add(path);
    }
    setExpandedPaths(newExpandedPaths);
  };

  const handleSelectFile = (path: string) => {
    setSelectedFile(path);
    
    // Find the file in the uploaded files
    const file = files.find(f => (f.webkitRelativePath || f.name) === path);
    
    if (file) {
      // Read the file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setOriginalCode(content);
        
        // Simulate conversion (in a real app, this would call the conversion logic)
        setTimeout(() => {
          // Example conversion - in reality this would be the actual conversion logic
          const converted = convertSeleniumToPlaywright(content);
          setConvertedCode(converted);
        }, 500);
      };
      reader.readAsText(file);
    }
  };

  // Handle upload errors
  const handleUploadError = (message: string) => {
    setUploadError(message);
  };

  // Mock conversion function (simplified for demo)
  const convertSeleniumToPlaywright = (seleniumCode: string): string => {
    // This is a very simplified example - the real converter would be much more sophisticated
    return seleniumCode
      .replace(/driver\.findElement\(By\.id\("([^"]+)"\)\)\.click\(\);/g, 'await page.click(\'#$1\');')
      .replace(/driver\.findElement\(By\.xpath\("([^"]+)"\)\)\.click\(\);/g, 'await page.click(\'xpath=$1\');')
      .replace(/driver\.findElement\(By\.css\("([^"]+)"\)\)\.click\(\);/g, 'await page.click(\'$1\');')
      .replace(/driver\.findElement\(By\.id\("([^"]+)"\)\)\.sendKeys\("([^"]+)"\);/g, 'await page.fill(\'#$1\', \'$2\');')
      .replace(/String ([a-zA-Z0-9_]+) = driver\.getTitle\(\);/g, 'const $1 = await page.title();')
      .replace(/Assert\.assertEquals\(([^,]+), "([^"]+)"\);/g, 'expect($1).toBe(\'$2\');')
      .replace(/driver\.get\("([^"]+)"\);/g, 'await page.goto(\'$1\');')
      .replace(/driver\.navigate\(\)\.to\("([^"]+)"\);/g, 'await page.goto(\'$1\');')
      .replace(/driver\.quit\(\);/g, 'await browser.close();')
      .replace(/WebDriverWait wait = new WebDriverWait\(driver, ([0-9]+)\);/g, '// Playwright has auto-waiting built in')
      .replace(/wait\.until\(ExpectedConditions\.visibilityOfElementLocated\(By\.id\("([^"]+)"\)\)\);/g, 'await page.waitForSelector(\'#$1\', { state: \'visible\' });')
      .replace(/wait\.until\(ExpectedConditions\.elementToBeClickable\(By\.id\("([^"]+)"\)\)\);/g, 'await page.waitForSelector(\'#$1\', { state: \'visible\' });')
      .replace(/public void ([a-zA-Z0-9_]+)\(\) {/g, 'test(\'$1\', async ({ page }) => {')
      .replace(/}$/g, '});')
      .replace(/@Test/g, '')
      .replace(/import org\.junit\.Test;/g, 'import { test, expect } from \'@playwright/test\';')
      .replace(/import org\.openqa\.selenium\.[^;]+;/g, '// Playwright imports are handled automatically');
  };

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AccessibleHeader 
          title="Selenium to Playwright Converter" 
          subtitle="Convert Java Selenium tests to TypeScript Playwright" 
          onToggleColorMode={toggleColorMode}
          isDarkMode={darkMode}
        />
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="converter tabs"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Convert" />
              <Tab label="Batch Jobs" />
              <Tab label="Analytics" />
              <Tab label="Projects" />
            </Tabs>
            
            {/* Convert Tab */}
            {activeTab === 0 && (
              <Box>
                {files.length === 0 ? (
                  <EnterpriseDropZone 
                    onFilesAccepted={handleFilesAccepted}
                    onError={handleUploadError}
                    maxFileSize={1000 * 1024 * 1024} // 1000MB
                  />
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ width: { xs: '100%', md: '25%' } }}>
                      <AccessibleFileTree 
                        files={fileTree}
                        expandedPaths={expandedPaths}
                        onToggleExpand={handleToggleExpand}
                        onSelectFile={handleSelectFile}
                      />
                    </Box>
                    
                    <Box sx={{ width: { xs: '100%', md: '75%' } }}>
                      {selectedFile ? (
                        <CodeComparison 
                          originalCode={originalCode}
                          convertedCode={convertedCode}
                          originalFileName={selectedFile.split('/').pop() || ''}
                          convertedFileName={`${selectedFile.split('/').pop()?.replace('.java', '')}.spec.ts` || ''}
                        />
                      ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="h6" color="text.secondary">
                            Select a file from the tree to view and convert
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
                
                {uploadError && (
                  <Box sx={{ mt: 2 }}>
                    <FileProgressItem 
                      fileName="Upload Error"
                      fileSize={0}
                      progress={0}
                      status="error"
                      errorMessage={uploadError}
                    />
                  </Box>
                )}
                
                {files.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <ConversionTemplates />
                  </Box>
                )}
              </Box>
            )}
            
            {/* Batch Jobs Tab */}
            {activeTab === 1 && (
              <BatchJobQueue />
            )}
            
            {/* Analytics Tab */}
            {activeTab === 2 && (
              <ConversionAnalytics />
            )}
            
            {/* Projects Tab */}
            {activeTab === 3 && (
              <ProjectSaveManager />
            )}
          </Paper>
        </Container>
        
        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800] }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              Selenium to Playwright Converter • Enterprise Edition • {new Date().getFullYear()}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
