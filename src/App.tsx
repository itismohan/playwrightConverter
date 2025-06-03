import React, { useState, useEffect } from 'react';
import FolderUpload from './components/FolderUpload';
import FileTree from './components/FileTree';
import ZipProcessor from './components/ZipProcessor';
import CodeComparison from './components/CodeComparison';
import ZipDownloader from './components/ZipDownloader';
import JavaParser from './utils/JavaParser';
import PlaywrightConverter from './utils/PlaywrightConverter';
import GradleParser from './utils/GradleParser';
import ProjectAnalyzer, { ProjectStructure } from './utils/ProjectAnalyzer';
import BatchConverter, { BatchConversionResult } from './utils/BatchConverter';
import './App.css';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [rootPath, setRootPath] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [javaCode, setJavaCode] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [conversionResult, setConversionResult] = useState<any>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingZip, setIsProcessingZip] = useState<boolean>(false);
  const [gradleProject, setGradleProject] = useState<any>(null);
  const [projectStructure, setProjectStructure] = useState<ProjectStructure | null>(null);
  const [batchResult, setBatchResult] = useState<BatchConversionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isBatchConverting, setIsBatchConverting] = useState<boolean>(false);
  const [conversionMode, setConversionMode] = useState<'single' | 'batch'>('single');

  const handleFilesUpload = async (uploadedFiles: File[], uploadRootPath: string) => {
    setFiles(uploadedFiles);
    setRootPath(uploadRootPath);
    setSelectedFile(null);
    setJavaCode('');
    setFileName('');
    setConversionResult(null);
    setError(null);
    setBatchResult(null);
    setProjectStructure(null);
    
    // Check for build.gradle file
    const gradleFile = uploadedFiles.find(file => file.name === 'build.gradle');
    if (gradleFile) {
      readGradleFile(gradleFile);
    }
    
    // If more than 1 Java file, suggest batch conversion
    const javaFiles = uploadedFiles.filter(file => file.name.endsWith('.java'));
    if (javaFiles.length > 1) {
      setConversionMode('batch');
      analyzeProject(uploadedFiles, uploadRootPath);
    } else {
      setConversionMode('single');
    }
  };

  const analyzeProject = async (projectFiles: File[], projectRoot: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      const analyzer = new ProjectAnalyzer(projectFiles, projectRoot);
      const structure = await analyzer.analyze();
      setProjectStructure(structure);
      
    } catch (err) {
      console.error('Project analysis error:', err);
      setError(`Error analyzing project: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const convertBatchProject = async () => {
    if (!projectStructure) return;
    
    try {
      setIsBatchConverting(true);
      setError(null);
      
      const converter = new BatchConverter(projectStructure);
      const result = converter.convert();
      setBatchResult(result);
      
    } catch (err) {
      console.error('Batch conversion error:', err);
      setError(`Error converting project: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsBatchConverting(false);
    }
  };

  const readGradleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new GradleParser(content);
        const project = parser.parse();
        setGradleProject(project);
      } catch (err) {
        console.error('Error parsing Gradle file:', err);
      }
    };
    reader.onerror = () => {
      console.error('Failed to read Gradle file');
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.java')) {
      setError('Only Java files can be converted');
      return;
    }
    
    setSelectedFile(file);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJavaCode(content);
      convertJavaToPlaywright(content, file.name);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const convertJavaToPlaywright = (content: string, name: string) => {
    try {
      setIsConverting(true);
      setError(null);
      
      // Parse the Java code
      const parser = new JavaParser(content);
      const parseResult = parser.parse();
      
      // Convert to Playwright TypeScript
      const converter = new PlaywrightConverter(parseResult);
      const result = converter.convert();
      
      setConversionResult(result);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(`Error converting file: ${err instanceof Error ? err.message : String(err)}`);
      setConversionResult(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleZipProcessed = (extractedFiles: File[], extractedRootPath: string) => {
    setIsProcessingZip(false);
    handleFilesUpload(extractedFiles, extractedRootPath);
  };

  const handleZipError = (errorMessage: string) => {
    setIsProcessingZip(false);
    setError(errorMessage);
  };

  const toggleConversionMode = () => {
    setConversionMode(prevMode => prevMode === 'single' ? 'batch' : 'single');
    setSelectedFile(null);
    setJavaCode('');
    setFileName('');
    setConversionResult(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Selenium to Playwright Converter</h1>
        <p>Convert Java Selenium test suites to Playwright TypeScript</p>
      </header>
      
      <main className="App-main">
        <section className="upload-section">
          {files.length === 0 ? (
            <FolderUpload onFilesUpload={handleFilesUpload} />
          ) : (
            <div className="project-view">
              <div className="project-sidebar">
                <FileTree files={files} rootPath={rootPath} />
                <div className="sidebar-actions">
                  <button 
                    className="upload-new-button"
                    onClick={() => setFiles([])}
                  >
                    Upload New Project
                  </button>
                  
                  {files.filter(f => f.name.endsWith('.java')).length > 1 && (
                    <div className="conversion-mode-toggle">
                      <button 
                        className={`mode-button ${conversionMode === 'single' ? 'active' : ''}`}
                        onClick={() => toggleConversionMode()}
                      >
                        Single File
                      </button>
                      <button 
                        className={`mode-button ${conversionMode === 'batch' ? 'active' : ''}`}
                        onClick={() => toggleConversionMode()}
                      >
                        Batch Convert
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="project-content">
                {conversionMode === 'single' ? (
                  selectedFile ? (
                    <div className="file-conversion">
                      {isConverting && (
                        <div className="converting-indicator">
                          <div className="spinner"></div>
                          <p>Converting your Selenium code to Playwright...</p>
                        </div>
                      )}
                      
                      <CodeComparison 
                        originalCode={javaCode} 
                        conversionResult={conversionResult} 
                        fileName={fileName}
                      />
                    </div>
                  ) : (
                    <div className="file-selection-prompt">
                      <h3>Select a Java file from the project tree to convert</h3>
                      <p>
                        {files.filter(f => f.name.endsWith('.java')).length} Java files available for conversion
                      </p>
                      {gradleProject && (
                        <div className="gradle-info">
                          <h4>Gradle Project Detected</h4>
                          <p>Project Name: {gradleProject.projectName}</p>
                          <p>Source Directories: {gradleProject.sourceDirectories.join(', ')}</p>
                          <p>Test Directories: {gradleProject.testDirectories.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="batch-conversion">
                    {isAnalyzing ? (
                      <div className="analyzing-indicator">
                        <div className="spinner"></div>
                        <p>Analyzing project structure...</p>
                      </div>
                    ) : projectStructure ? (
                      <div className="project-analysis">
                        <h3>Project Analysis</h3>
                        <div className="analysis-stats">
                          <div className="stat-item">
                            <span className="stat-value">{projectStructure.testClasses.length}</span>
                            <span className="stat-label">Test Classes</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{projectStructure.pageObjects.length}</span>
                            <span className="stat-label">Page Objects</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{projectStructure.utilities.length}</span>
                            <span className="stat-label">Utility Classes</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{projectStructure.resourceFiles.length}</span>
                            <span className="stat-label">Resource Files</span>
                          </div>
                        </div>
                        
                        {batchResult ? (
                          <div className="batch-result">
                            <h3>Conversion Complete</h3>
                            <div className="conversion-stats">
                              <p>
                                Successfully converted {batchResult.summary.convertedFiles} of {batchResult.summary.totalFiles} files
                                {batchResult.summary.errors > 0 && ` (${batchResult.summary.errors} errors)`}
                              </p>
                            </div>
                            
                            <ZipDownloader 
                              conversionResult={batchResult}
                              projectName={gradleProject?.projectName || "selenium-project"}
                            />
                          </div>
                        ) : (
                          <div className="batch-actions">
                            <button 
                              className="convert-batch-button"
                              onClick={convertBatchProject}
                              disabled={isBatchConverting}
                            >
                              {isBatchConverting ? (
                                <>
                                  <div className="spinner small"></div>
                                  Converting...
                                </>
                              ) : (
                                'Convert Entire Project'
                              )}
                            </button>
                            <p className="batch-hint">
                              This will convert all Java files and maintain the project structure
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="batch-info">
                        <h3>Batch Conversion</h3>
                        <p>
                          Analyzing project structure to prepare for batch conversion...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isProcessingZip && (
            <ZipProcessor 
              zipFile={files[0]} 
              onFilesExtracted={handleZipProcessed}
              onError={handleZipError}
            />
          )}
          
          {error && <div className="error-message">{error}</div>}
        </section>
        
        <section className="info-section">
          <h2>About This Tool</h2>
          <p>
            This tool automatically converts Java-based Selenium test suites into equivalent Playwright test scripts written in TypeScript.
            It handles common Selenium constructs like WebDriver, By, WebElement, Actions, waits, and assertions.
          </p>
          <h3>Key Features</h3>
          <ul>
            <li>Upload entire test suites via folder or ZIP file</li>
            <li>Maintains project structure in converted output</li>
            <li>Maps Java classes and methods to their Playwright counterparts</li>
            <li>Converts Java syntax to valid TypeScript syntax</li>
            <li>Translates locators (By.id, By.xpath, etc.) to Playwright selectors</li>
            <li>Generates complete Playwright test project</li>
            <li>Provides syntax highlighting and side-by-side comparison</li>
            <li>Adds comments for parts that need manual review</li>
          </ul>
        </section>
      </main>
      
      <footer className="App-footer">
        <p>Selenium to Playwright Converter &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
