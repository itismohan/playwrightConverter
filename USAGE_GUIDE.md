# Selenium to Playwright Converter - Usage Guide

## Getting Started

### Running the Application Locally

1. **Prerequisites:**
   - Node.js (v14 or higher)
   - npm (v6 or higher)

2. **Installation:**
   ```bash
   # Extract the source code archive
   unzip selenium-to-playwright-converter-source.zip
   
   # Navigate to the project directory
   cd selenium-to-playwright-converter
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm start
   ```

3. **Access the Application:**
   - Open your browser and navigate to `http://localhost:3000`

### Using the Pre-built Version

1. **Prerequisites:**
   - Any static file server (like `serve`, nginx, etc.)

2. **Deployment:**
   ```bash
   # Install serve globally (if not already installed)
   npm install -g serve
   
   # Extract the build archive
   unzip selenium-to-playwright-converter-build.zip
   
   # Serve the build directory
   serve -s build
   ```

3. **Access the Application:**
   - Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5000`)

## Using the Converter

### Single File Conversion

1. **Upload a Java File:**
   - Drag and drop your Java Selenium test file onto the upload area, or click to browse your files
   - Only `.java` files are accepted (maximum size: 5MB)
   - The file will be automatically processed upon upload

2. **Review the Conversion:**
   - The original Java code will be displayed on the left side
   - The converted Playwright TypeScript code will be displayed on the right side
   - Conversion notes will appear below the code panels, highlighting any parts that need manual review

3. **Download the Results:**
   - Click the download button in the Java panel to save the original code
   - Click the download button in the TypeScript panel to save the converted code

### Batch Suite Conversion (New Feature)

1. **Upload Your Test Suite:**
   - **Option 1:** Click "Select Folder" to upload an entire directory structure
   - **Option 2:** Click "Upload ZIP" to upload a ZIP archive containing your test suite
   - The application will analyze the project structure and identify test classes, page objects, and utilities

2. **Review Project Analysis:**
   - After upload, the application will display statistics about your project
   - You'll see counts of test classes, page objects, utility classes, and resource files
   - The file tree on the left shows the complete project structure

3. **Convert the Entire Project:**
   - Click "Convert Entire Project" to start the batch conversion process
   - The application will process all files while maintaining dependencies and relationships
   - A progress indicator will show conversion status

4. **Download the Converted Project:**
   - Once conversion is complete, click "Download Converted Project"
   - This will generate a ZIP file containing the complete Playwright project
   - The ZIP includes all converted test files, page objects, utilities, and configuration files

5. **Using the Converted Project:**
   - Extract the downloaded ZIP file
   - Run `npm install` to install dependencies
   - Run `npx playwright install` to install browsers
   - Run `npm test` to execute the tests

## Project Structure of Converted Output

The converted Playwright project will have the following structure:

```
playwright-project/
├── playwright.config.ts    # Playwright configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── README.md               # Usage instructions
└── src/                    # Source code directory
    ├── tests/              # Converted test files
    ├── pages/              # Converted page objects
    └── utils/              # Converted utility functions
```

## Conversion Coverage

The converter handles the following Selenium constructs:

- **Navigation:** `driver.get()`, `navigate().to()`
- **Element Location:** `findElement()` with various `By` locators
- **Element Actions:** `click()`, `sendKeys()`, `clear()`, etc.
- **Assertions:** `assertEquals()`, `assertTrue()`, etc.
- **Waits:** Explicit waits with `ExpectedConditions`
- **JavaScript Execution:** `executeScript()`
- **Test Structure:** JUnit `@Test`, `@Before`, `@After`
- **Page Objects:** Selenium Page Object pattern to Playwright Page Object pattern
- **Utility Classes:** Static utility methods to TypeScript functions

## Special Features for Batch Conversion

- **Project Structure Preservation:** Maintains the same directory structure as the original project
- **Dependency Mapping:** Correctly handles dependencies between classes
- **Configuration Generation:** Creates all necessary configuration files for a working Playwright project
- **Resource Handling:** Copies resource files to the appropriate locations
- **Gradle Support:** Analyzes Gradle build files to understand project structure

## Limitations

Some complex Selenium patterns may require manual adjustments:

- Advanced custom waits
- Complex JavaScript execution
- TestNG-specific annotations
- Custom Selenium extensions

## Troubleshooting

- **File Upload Issues:** Ensure your file has a `.java` extension and is under 5MB
- **Folder Upload Issues:** Some browsers may have limitations with folder upload; try using Chrome
- **ZIP Upload Issues:** Ensure your ZIP file is under 50MB and contains Java files
- **Conversion Errors:** Check the error message for details on what went wrong
- **Display Issues:** Try refreshing the page or using a different browser
