import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BatchConversionResult } from '../utils/BatchConverter';

interface ZipDownloaderProps {
  conversionResult: BatchConversionResult;
  projectName: string;
}

const ZipDownloader: React.FC<ZipDownloaderProps> = ({ conversionResult, projectName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      
      const zip = new JSZip();
      
      // Add converted files
      for (const output of conversionResult.outputs) {
        zip.file(output.filePath, output.convertedCode);
      }
      
      setProgress(30);
      
      // Add config files
      for (const configFile of conversionResult.configFiles) {
        zip.file(configFile.filePath, configFile.content);
      }
      
      setProgress(50);
      
      // Add resource files
      for (const resourceFile of conversionResult.resourceFiles) {
        zip.file(resourceFile.filePath, resourceFile.content);
      }
      
      setProgress(70);
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        setProgress(70 + Math.floor(metadata.percent * 0.3));
      });
      
      // Save the zip file
      const safeName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      saveAs(zipBlob, `${safeName}-playwright.zip`);
      
      setProgress(100);
      
      // Reset after a delay
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Error generating zip file:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="zip-downloader">
      <button 
        className="download-button"
        onClick={handleDownload}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <span>Generating ZIP... {progress}%</span>
        ) : (
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Converted Project
          </span>
        )}
      </button>
      
      {isGenerating && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      
      <div className="download-stats">
        <p>
          {conversionResult.summary.convertedFiles} files converted
          {conversionResult.summary.errors > 0 && ` (${conversionResult.summary.errors} errors)`}
        </p>
      </div>
    </div>
  );
};

export default ZipDownloader;
