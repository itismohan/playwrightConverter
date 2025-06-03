import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import CodeComparison from './components/CodeComparison';
import JavaParser from './utils/JavaParser';
import PlaywrightConverter, { ConversionResult } from './utils/PlaywrightConverter';
import './App.css';

function App() {
  const [javaCode, setJavaCode] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (content: string, name: string) => {
    setJavaCode(content);
    setFileName(name);
    setError(null);
    
    try {
      setIsConverting(true);
      
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Selenium to Playwright Converter</h1>
        <p>Convert Java Selenium test scripts to Playwright TypeScript</p>
      </header>
      
      <main className="App-main">
        <section className="upload-section">
          <FileUpload onFileUpload={handleFileUpload} />
          {isConverting && (
            <div className="converting-indicator">
              <div className="spinner"></div>
              <p>Converting your Selenium code to Playwright...</p>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
        </section>
        
        {javaCode && (
          <section className="comparison-section">
            <CodeComparison 
              originalCode={javaCode} 
              conversionResult={conversionResult} 
              fileName={fileName}
            />
          </section>
        )}
        
        <section className="info-section">
          <h2>About This Tool</h2>
          <p>
            This tool automatically converts Java-based Selenium test scripts into equivalent Playwright test scripts written in TypeScript.
            It handles common Selenium constructs like WebDriver, By, WebElement, Actions, waits, and assertions.
          </p>
          <h3>Key Features</h3>
          <ul>
            <li>Accepts .java files containing Selenium test scripts</li>
            <li>Maps Java classes and methods to their Playwright counterparts</li>
            <li>Converts Java syntax to valid TypeScript syntax</li>
            <li>Translates locators (By.id, By.xpath, etc.) to Playwright selectors</li>
            <li>Generates .ts files using the Playwright test framework</li>
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
