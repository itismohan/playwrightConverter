# Selenium to Playwright Converter

## Project Overview
This web application converts Java-based Selenium test scripts into equivalent Playwright test scripts written in TypeScript. It provides an intuitive interface for uploading Java files, parsing Selenium constructs, and generating Playwright code with side-by-side comparison.

## Features
- **File Upload**: Accepts .java files containing Selenium test scripts
- **Parsing**: Recognizes common Selenium constructs (WebDriver, By, WebElement, Actions, waits, assertions)
- **Conversion**: Maps Java classes and methods to their Playwright counterparts
- **Syntax Transformation**: Converts Java syntax to valid TypeScript syntax
- **Locator Translation**: Translates Selenium locators to Playwright selectors
- **Output Generation**: Creates .ts files using the Playwright test framework
- **UI Features**: 
  - Syntax highlighting for both Java and TypeScript
  - Side-by-side comparison view
  - Comments in output code for parts needing manual review
  - Download functionality for both original and converted code

## Usage Instructions
1. **Upload a Java File**: 
   - Drag and drop a Java Selenium test file onto the upload area, or click to browse
   - Only .java files are accepted (5MB size limit)

2. **View Conversion**:
   - After upload, the original Java code appears on the left
   - The converted Playwright TypeScript code appears on the right
   - Conversion notes appear below with warnings about any parts that need manual review

3. **Download Results**:
   - Click the download button in either panel to save the original or converted code

## Technical Implementation
- **Frontend**: React with TypeScript
- **Parsing**: Custom Java parser to identify Selenium constructs
- **Conversion Logic**: Modular converter for Java to TypeScript transformation
- **UI Components**: 
  - FileUpload: Handles file selection and validation
  - CodeComparison: Displays side-by-side code with syntax highlighting
  - Conversion notes with different severity levels

## Conversion Coverage
The converter handles:
- Basic navigation (driver.get, navigate().to)
- Element location (findElement with various By locators)
- Element actions (click, sendKeys, clear, etc.)
- Assertions (assertEquals, assertTrue, etc.)
- Waits (explicit waits with ExpectedConditions)
- Basic JavaScript execution
- Test structure (JUnit @Test, @Before, @After)

## Limitations and Future Enhancements
- Some complex Selenium patterns may require manual adjustments
- Advanced Selenium features like custom waits might need review
- Future enhancements could include:
  - Support for TestNG annotations
  - Batch conversion of multiple files
  - Custom mapping rules for project-specific libraries
  - More advanced code analysis for complex patterns

## Getting Started with Development
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server
4. Run `npm run build` to create a production build
