import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

interface ZipProcessorProps {
  zipFile: File;
  onFilesExtracted: (files: File[], rootPath: string) => void;
  onError: (error: string) => void;
}

const ZipProcessor: React.FC<ZipProcessorProps> = ({ zipFile, onFilesExtracted, onError }) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    processZipFile();
  }, [zipFile]);

  const processZipFile = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);
      
      const zip = new JSZip();
      
      // Load the zip file
      const zipContent = await zip.loadAsync(zipFile, {
        createFolders: true,
        checkCRC32: true
      });
      
      setProgress(30);
      
      // Extract files
      const files: File[] = [];
      const fileNames = Object.keys(zipContent.files);
      
      // Find common root directory
      let rootPath = '';
      if (fileNames.length > 0) {
        const firstPath = fileNames[0].split('/');
        if (firstPath.length > 1) {
          rootPath = firstPath[0];
          
          // Verify all files share the same root
          const allSameRoot = fileNames.every(name => name.startsWith(rootPath + '/'));
          if (!allSameRoot) {
            rootPath = '';
          }
        }
      }
      
      setProgress(50);
      
      // Process each file
      let processedCount = 0;
      const totalFiles = Object.keys(zipContent.files).filter(name => !zipContent.files[name].dir).length;
      
      const processPromises = Object.keys(zipContent.files).map(async (filename) => {
        const zipEntry = zipContent.files[filename];
        
        // Skip directories
        if (zipEntry.dir) return;
        
        try {
          // Get file content as blob
          const content = await zipEntry.async('blob');
          
          // Create a File object
          const file = new File([content], filename, {
            type: getFileType(filename),
            lastModified: zipEntry.date.getTime()
          });
          
          // Add custom property to mimic webkitRelativePath
          Object.defineProperty(file, 'webkitRelativePath', {
            value: filename,
            writable: false
          });
          
          files.push(file);
          
          // Update progress
          processedCount++;
          setProgress(50 + Math.floor((processedCount / totalFiles) * 40));
        } catch (err) {
          console.error(`Error extracting file ${filename}:`, err);
        }
      });
      
      await Promise.all(processPromises);
      setProgress(100);
      
      // Check if we found any Java files
      const javaFiles = files.filter(file => file.name.endsWith('.java'));
      if (javaFiles.length === 0) {
        onError('No Java files found in the ZIP archive');
        return;
      }
      
      onFilesExtracted(files, rootPath);
    } catch (err) {
      console.error('Error processing ZIP file:', err);
      onError(`Failed to process ZIP file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'java': return 'text/x-java-source';
      case 'gradle': return 'text/plain';
      case 'xml': return 'application/xml';
      case 'properties': return 'text/plain';
      case 'json': return 'application/json';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  };

  return (
    <div className="zip-processor">
      {isProcessing && (
        <div className="processing-indicator">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p>Extracting ZIP file... {progress}%</p>
        </div>
      )}
    </div>
  );
};

export default ZipProcessor;
