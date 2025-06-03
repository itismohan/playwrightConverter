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

### Step 1: Upload a Java Selenium File

1. Drag and drop your Java Selenium test file onto the upload area, or click to browse your files
2. Only `.java` files are accepted (maximum size: 5MB)
3. The file will be automatically processed upon upload

### Step 2: Review the Conversion

1. The original Java code will be displayed on the left side
2. The converted Playwright TypeScript code will be displayed on the right side
3. Conversion notes will appear below the code panels, highlighting any parts that need manual review

### Step 3: Download the Results

1. Click the download button in the Java panel to save the original code
2. Click the download button in the TypeScript panel to save the converted code

## Sample Files

The application includes two sample Java Selenium test files for testing:

1. `LoginTest.java` - A basic login test with assertions
2. `ShoppingCartTest.java` - A more complex test with various Selenium features

These files are located in the `src/test-samples/` directory.

## Conversion Coverage

The converter handles the following Selenium constructs:

- **Navigation:** `driver.get()`, `navigate().to()`
- **Element Location:** `findElement()` with various `By` locators
- **Element Actions:** `click()`, `sendKeys()`, `clear()`, etc.
- **Assertions:** `assertEquals()`, `assertTrue()`, etc.
- **Waits:** Explicit waits with `ExpectedConditions`
- **JavaScript Execution:** `executeScript()`
- **Test Structure:** JUnit `@Test`, `@Before`, `@After`

## Limitations

Some complex Selenium patterns may require manual adjustments:

- Advanced custom waits
- Complex JavaScript execution
- TestNG-specific annotations
- Custom Selenium extensions

## Troubleshooting

- **File Upload Issues:** Ensure your file has a `.java` extension and is under 5MB
- **Conversion Errors:** Check the error message for details on what went wrong
- **Display Issues:** Try refreshing the page or using a different browser
