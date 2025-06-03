import React, { useState, useRef, useEffect } from 'react';

interface FolderUploadProps {
  onFilesUpload: (files: File[], rootPath: string) => void;
}

const FolderUpload: React.FC<FolderUploadProps> = ({ onFilesUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadType, setUploadType] = useState<'folder' | 'zip' | null>(null);
  const [fileCount, setFileCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Set webkitdirectory attribute using useEffect to avoid TypeScript errors
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', 'true');
      folderInputRef.current.setAttribute('directory', 'true');
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFiles = (files: File[]): boolean => {
    // Check if there are any files
    if (files.length === 0) {
      setError('No files were selected');
      return false;
    }
    
    // For zip upload, check if it's a zip file
    if (uploadType === 'zip') {
      const zipFile = files[0];
      if (!zipFile.name.endsWith('.zip')) {
        setError('Please upload a ZIP file');
        return false;
      }
      
      if (zipFile.size > 50 * 1024 * 1024) { // 50MB limit
        setError('ZIP file size exceeds 50MB limit');
        return false;
      }
    } else {
      // For folder upload, check if there are Java files
      const hasJavaFiles = files.some(file => file.name.endsWith('.java'));
      if (!hasJavaFiles) {
        setError('No Java files found in the selected folder');
        return false;
      }
      
      // Check total size
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 100 * 1024 * 1024) { // 100MB limit
        setError('Total file size exceeds 100MB limit');
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const processZipFile = (zipFile: File) => {
    if (!validateFiles([zipFile])) return;
    
    setFileCount(1);
    onFilesUpload([zipFile], '');
  };

  const processFolderFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (!validateFiles(fileArray)) return;
    
    // Find common root path
    const paths = fileArray.map(file => file.webkitRelativePath);
    const rootPath = paths.length > 0 ? paths[0].split('/')[0] : '';
    
    setFileCount(fileArray.length);
    onFilesUpload(fileArray, rootPath);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Check if it's a folder or a zip file
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      
      if (item.webkitGetAsEntry()?.isDirectory) {
        setError('Please use the folder upload button for directories');
        return;
      } else if (item.type === 'application/zip' || item.type === 'application/x-zip-compressed') {
        setUploadType('zip');
        if (e.dataTransfer.files.length > 0) {
          processZipFile(e.dataTransfer.files[0]);
        }
      } else {
        setError('Please upload a folder or a ZIP file');
      }
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadType('folder');
      processFolderFiles(e.target.files);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadType('zip');
      processZipFile(e.target.files[0]);
    }
  };

  const handleFolderButtonClick = () => {
    folderInputRef.current?.click();
  };

  const handleZipButtonClick = () => {
    zipInputRef.current?.click();
  };

  return (
    <div className="folder-upload-container">
      <div 
        className={`folder-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={folderInputRef}
          onChange={handleFolderChange}
          multiple
          style={{ display: 'none' }}
        />
        <input 
          type="file" 
          ref={zipInputRef}
          onChange={handleZipChange}
          accept=".zip"
          style={{ display: 'none' }}
        />
        <div className="folder-upload-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>Upload your entire Selenium test suite</p>
          
          <div className="upload-buttons">
            <button 
              className="upload-button folder-button" 
              onClick={handleFolderButtonClick}
            >
              Select Folder
            </button>
            <span className="or-divider">or</span>
            <button 
              className="upload-button zip-button" 
              onClick={handleZipButtonClick}
            >
              Upload ZIP
            </button>
          </div>
          
          <p className="folder-upload-hint">
            {fileCount > 0 
              ? `Selected: ${fileCount} file${fileCount !== 1 ? 's' : ''}`
              : 'Supports folder structure or ZIP archive'}
          </p>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FolderUpload;
