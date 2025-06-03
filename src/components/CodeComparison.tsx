import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ConversionResult } from '../utils/PlaywrightConverter';

// Register languages
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('typescript', typescript);

interface CodeComparisonProps {
  originalCode: string;
  conversionResult: ConversionResult | null;
  fileName: string;
}

const CodeComparison: React.FC<CodeComparisonProps> = ({ 
  originalCode, 
  conversionResult, 
  fileName 
}) => {
  const outputFileName = fileName.replace('.java', '.ts');
  
  const downloadOriginalCode = () => {
    const blob = new Blob([originalCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadConvertedCode = () => {
    if (!conversionResult) return;
    
    const blob = new Blob([conversionResult.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-comparison-container">
      <div className="code-panels">
        <div className="code-panel">
          <div className="code-panel-header">
            <h3>Original Java Selenium Code</h3>
            <span className="file-name">{fileName}</span>
            <button 
              className="download-button" 
              onClick={downloadOriginalCode}
              title="Download original code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
          <div className="code-content">
            <SyntaxHighlighter 
              language="java" 
              style={vs2015}
              showLineNumbers={true}
              wrapLines={true}
            >
              {originalCode}
            </SyntaxHighlighter>
          </div>
        </div>
        
        <div className="code-panel">
          <div className="code-panel-header">
            <h3>Converted Playwright TypeScript</h3>
            <span className="file-name">{outputFileName}</span>
            {conversionResult && (
              <button 
                className="download-button" 
                onClick={downloadConvertedCode}
                title="Download converted code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            )}
          </div>
          <div className="code-content">
            {conversionResult ? (
              <SyntaxHighlighter 
                language="typescript" 
                style={vs2015}
                showLineNumbers={true}
                wrapLines={true}
              >
                {conversionResult.code}
              </SyntaxHighlighter>
            ) : (
              <div className="no-code-message">
                Upload a Java Selenium file to see the converted Playwright code
              </div>
            )}
          </div>
        </div>
      </div>
      
      {conversionResult && conversionResult.comments.length > 0 && (
        <div className="conversion-comments">
          <h3>Conversion Notes</h3>
          <ul>
            {conversionResult.comments.map((comment, index) => (
              <li key={index} className={`comment-${comment.type}`}>
                {comment.line > 0 ? `Line ${comment.line}: ` : ''}{comment.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CodeComparison;
