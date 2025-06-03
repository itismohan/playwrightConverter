/**
 * BatchConverter.ts
 * Utility for batch conversion of Java Selenium test suites to Playwright TypeScript
 */

import JavaParser from './JavaParser';
import PlaywrightConverter, { ConversionResult } from './PlaywrightConverter';
import { ProjectStructure, JavaClass } from './ProjectAnalyzer';

export interface ConversionOutput {
  filePath: string;
  originalCode: string;
  convertedCode: string;
  comments: {
    line: number;
    text: string;
    type: 'info' | 'warning' | 'error';
  }[];
}

export interface BatchConversionResult {
  outputs: ConversionOutput[];
  configFiles: {
    filePath: string;
    content: string;
  }[];
  resourceFiles: {
    filePath: string;
    content: string;
  }[];
  summary: {
    totalFiles: number;
    convertedFiles: number;
    skippedFiles: number;
    errors: number;
  };
}

export class BatchConverter {
  private projectStructure: ProjectStructure;
  private conversionOutputs: ConversionOutput[] = [];
  private configFiles: { filePath: string; content: string }[] = [];
  private errors: { filePath: string; error: string }[] = [];

  constructor(projectStructure: ProjectStructure) {
    this.projectStructure = projectStructure;
  }

  /**
   * Convert the entire project
   */
  public convert(): BatchConversionResult {
    // Process test classes first
    this.processTestClasses();
    
    // Process page objects
    this.processPageObjects();
    
    // Process utility classes
    this.processUtilityClasses();
    
    // Generate configuration files
    this.generateConfigFiles();
    
    // Prepare resource files
    const resourceFiles = this.projectStructure.resourceFiles.map(resource => ({
      filePath: this.convertFilePath(resource.path),
      content: resource.content
    }));
    
    // Generate summary
    const summary = {
      totalFiles: this.projectStructure.classes.length,
      convertedFiles: this.conversionOutputs.length,
      skippedFiles: this.projectStructure.classes.length - this.conversionOutputs.length - this.errors.length,
      errors: this.errors.length
    };
    
    return {
      outputs: this.conversionOutputs,
      configFiles: this.configFiles,
      resourceFiles,
      summary
    };
  }

  /**
   * Process test classes
   */
  private processTestClasses(): void {
    for (const testClass of this.projectStructure.testClasses) {
      try {
        const output = this.convertClass(testClass);
        this.conversionOutputs.push(output);
      } catch (error) {
        this.errors.push({
          filePath: testClass.filePath,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Process page objects
   */
  private processPageObjects(): void {
    for (const pageObject of this.projectStructure.pageObjects) {
      try {
        const output = this.convertPageObject(pageObject);
        this.conversionOutputs.push(output);
      } catch (error) {
        this.errors.push({
          filePath: pageObject.filePath,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Process utility classes
   */
  private processUtilityClasses(): void {
    for (const utilityClass of this.projectStructure.utilities) {
      try {
        const output = this.convertUtilityClass(utilityClass);
        this.conversionOutputs.push(output);
      } catch (error) {
        this.errors.push({
          filePath: utilityClass.filePath,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Convert a Java class to TypeScript
   */
  private convertClass(javaClass: JavaClass): ConversionOutput {
    // If we already have parse results, use them
    const parseResult = javaClass.parseResult || new JavaParser(javaClass.content).parse();
    
    // Convert to Playwright TypeScript
    const converter = new PlaywrightConverter(parseResult);
    const result = converter.convert();
    
    // Add imports for dependencies
    const enhancedCode = this.addDependencyImports(result.code, javaClass);
    
    return {
      filePath: this.convertFilePath(javaClass.filePath),
      originalCode: javaClass.content,
      convertedCode: enhancedCode,
      comments: result.comments
    };
  }

  /**
   * Convert a page object class to TypeScript
   */
  private convertPageObject(pageObject: JavaClass): ConversionOutput {
    // Special handling for page objects
    const tsCode = this.generatePageObjectClass(pageObject);
    
    return {
      filePath: this.convertFilePath(pageObject.filePath),
      originalCode: pageObject.content,
      convertedCode: tsCode,
      comments: [{
        line: 1,
        text: 'Converted from Selenium Page Object to Playwright Page Object pattern',
        type: 'info'
      }]
    };
  }

  /**
   * Convert a utility class to TypeScript
   */
  private convertUtilityClass(utilityClass: JavaClass): ConversionOutput {
    // Special handling for utility classes
    const tsCode = this.generateUtilityClass(utilityClass);
    
    return {
      filePath: this.convertFilePath(utilityClass.filePath),
      originalCode: utilityClass.content,
      convertedCode: tsCode,
      comments: [{
        line: 1,
        text: 'Converted from Java utility class to TypeScript utility',
        type: 'info'
      }]
    };
  }

  /**
   * Generate a Playwright page object class
   */
  private generatePageObjectClass(pageObject: JavaClass): string {
    // Extract WebElements from the Java page object
    const webElementRegex = /private\s+WebElement\s+(\w+)(?:\s*=\s*[^;]+)?;/g;
    const elements: { name: string; locator: string }[] = [];
    
    let match;
    while ((match = webElementRegex.exec(pageObject.content)) !== null) {
      const elementName = match[1];
      
      // Try to find the locator for this element
      const locatorRegex = new RegExp(`${elementName}\\s*=\\s*.*?\\.findElement\\(By\\.(\\w+)\\(\\s*"([^"]+)"\\s*\\)\\)`, 's');
      const locatorMatch = locatorRegex.exec(pageObject.content);
      
      if (locatorMatch) {
        const locatorType = locatorMatch[1];
        const locatorValue = locatorMatch[2];
        elements.push({
          name: elementName,
          locator: this.convertLocator(locatorType, locatorValue)
        });
      } else {
        // If we can't find the locator, use a placeholder
        elements.push({
          name: elementName,
          locator: `page.locator('/* TODO: Add locator for ${elementName} */')`
        });
      }
    }
    
    // Generate the TypeScript page object
    let code = `import { Page, Locator } from '@playwright/test';\n\n`;
    code += `/**\n * Page object for ${pageObject.name}\n */\n`;
    code += `export class ${pageObject.name} {\n`;
    code += `  readonly page: Page;\n`;
    
    // Add element properties
    for (const element of elements) {
      code += `  readonly ${element.name}: Locator;\n`;
    }
    
    // Add constructor
    code += `\n  constructor(page: Page) {\n`;
    code += `    this.page = page;\n`;
    
    // Initialize elements
    for (const element of elements) {
      code += `    this.${element.name} = ${element.locator};\n`;
    }
    
    code += `  }\n\n`;
    
    // Convert methods
    const methodRegex = /public\s+(\w+(?:<[^>]+>)?)\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*\{([^}]*)\}/gs;
    while ((match = methodRegex.exec(pageObject.content)) !== null) {
      const returnType = match[1];
      const methodName = match[2];
      const params = match[3];
      const methodBody = match[4];
      
      // Skip constructors
      if (methodName === pageObject.name) continue;
      
      // Convert method signature
      code += `  async ${methodName}(${this.convertMethodParams(params)}): Promise<${this.convertReturnType(returnType)}> {\n`;
      
      // Convert method body (simplified)
      const convertedBody = this.convertMethodBody(methodBody, elements);
      code += convertedBody.split('\n').map(line => `    ${line}`).join('\n');
      
      code += `\n  }\n\n`;
    }
    
    code += `}\n`;
    return code;
  }

  /**
   * Generate a TypeScript utility class
   */
  private generateUtilityClass(utilityClass: JavaClass): string {
    // For utility classes, we'll convert static methods to exported functions
    let code = `/**\n * Utility functions converted from ${utilityClass.name}\n */\n\n`;
    
    // Import Playwright
    code += `import { Page, expect } from '@playwright/test';\n\n`;
    
    // Convert static methods to exported functions
    const methodRegex = /public\s+static\s+(\w+(?:<[^>]+>)?)\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*\{([^}]*)\}/gs;
    let match;
    
    while ((match = methodRegex.exec(utilityClass.content)) !== null) {
      const returnType = match[1];
      const methodName = match[2];
      const params = match[3];
      const methodBody = match[4];
      
      // Convert method signature
      code += `/**\n * ${methodName} function\n */\n`;
      code += `export async function ${methodName}(${this.convertMethodParams(params)}): Promise<${this.convertReturnType(returnType)}> {\n`;
      
      // Convert method body (simplified)
      const convertedBody = this.convertMethodBody(methodBody, []);
      code += convertedBody.split('\n').map(line => `  ${line}`).join('\n');
      
      code += `\n}\n\n`;
    }
    
    return code;
  }

  /**
   * Convert Java method parameters to TypeScript
   */
  private convertMethodParams(params: string): string {
    if (!params.trim()) return '';
    
    return params.split(',').map(param => {
      const parts = param.trim().split(/\s+/);
      if (parts.length < 2) return param; // Can't parse
      
      const type = this.convertParamType(parts[0]);
      const name = parts[1];
      
      return `${name}: ${type}`;
    }).join(', ');
  }

  /**
   * Convert Java parameter type to TypeScript
   */
  private convertParamType(javaType: string): string {
    switch (javaType) {
      case 'String': return 'string';
      case 'int':
      case 'long':
      case 'float':
      case 'double': return 'number';
      case 'boolean': return 'boolean';
      case 'WebDriver': return 'Page';
      case 'WebElement': return 'Locator';
      default: return 'any';
    }
  }

  /**
   * Convert Java return type to TypeScript
   */
  private convertReturnType(javaType: string): string {
    switch (javaType) {
      case 'void': return 'void';
      case 'String': return 'string';
      case 'int':
      case 'long':
      case 'float':
      case 'double': return 'number';
      case 'boolean': return 'boolean';
      case 'WebElement': return 'Locator';
      default: return 'any';
    }
  }

  /**
   * Convert Java method body to TypeScript
   */
  private convertMethodBody(javaBody: string, elements: { name: string; locator: string }[]): string {
    let tsBody = javaBody;
    
    // Replace common Selenium patterns
    tsBody = tsBody.replace(/driver\.findElement\(By\.(id|name|xpath|cssSelector|className|tagName|linkText|partialLinkText)\s*\(\s*"([^"]+)"\s*\)\)/g, 
      (match, locatorType, locatorValue) => `await page.locator(${this.convertLocatorString(locatorType, locatorValue)})`);
    
    // Replace element actions
    tsBody = tsBody.replace(/(\w+)\.click\(\)/g, 'await $1.click()');
    tsBody = tsBody.replace(/(\w+)\.sendKeys\(\s*"([^"]*)"\s*\)/g, 'await $1.fill("$2")');
    tsBody = tsBody.replace(/(\w+)\.clear\(\)/g, 'await $1.clear()');
    
    // Replace waits
    tsBody = tsBody.replace(/Thread\.sleep\(\s*(\d+)\s*\)/g, 'await page.waitForTimeout($1)');
    
    // Replace assertions
    tsBody = tsBody.replace(/Assert\.assertEquals\(\s*([^,]+),\s*([^)]+)\)/g, 'expect($1).toBe($2)');
    tsBody = tsBody.replace(/Assert\.assertTrue\(\s*([^)]+)\)/g, 'expect($1).toBe(true)');
    tsBody = tsBody.replace(/Assert\.assertFalse\(\s*([^)]+)\)/g, 'expect($1).toBe(false)');
    
    // Add return statement if needed
    if (tsBody.includes('return ') && !tsBody.trim().endsWith(';')) {
      tsBody += ';';
    }
    
    return tsBody;
  }

  /**
   * Convert Selenium locator to Playwright locator
   */
  private convertLocator(locatorType: string, locatorValue: string): string {
    switch (locatorType) {
      case 'id': return `page.locator('#${locatorValue}')`;
      case 'name': return `page.locator('[name="${locatorValue}"]')`;
      case 'xpath': return `page.locator('xpath=${locatorValue}')`;
      case 'cssSelector': return `page.locator('${locatorValue}')`;
      case 'className': return `page.locator('.${locatorValue}')`;
      case 'tagName': return `page.locator('${locatorValue}')`;
      case 'linkText': return `page.getByText('${locatorValue}')`;
      case 'partialLinkText': return `page.getByText('${locatorValue}', { exact: false })`;
      default: return `page.locator('${locatorValue}')`;
    }
  }

  /**
   * Convert Selenium locator to Playwright locator string
   */
  private convertLocatorString(locatorType: string, locatorValue: string): string {
    switch (locatorType) {
      case 'id': return `'#${locatorValue}'`;
      case 'name': return `'[name="${locatorValue}"]'`;
      case 'xpath': return `'xpath=${locatorValue}'`;
      case 'cssSelector': return `'${locatorValue}'`;
      case 'className': return `'.${locatorValue}'`;
      case 'tagName': return `'${locatorValue}'`;
      case 'linkText': return `text='${locatorValue}'`;
      case 'partialLinkText': return `text='${locatorValue}'`;
      default: return `'${locatorValue}'`;
    }
  }

  /**
   * Add imports for dependencies
   */
  private addDependencyImports(code: string, javaClass: JavaClass): string {
    let imports = '';
    
    // Add imports for page objects
    for (const dependency of javaClass.dependencies) {
      const dependentClass = this.findClassByFullName(dependency);
      if (dependentClass && dependentClass.isPageObject) {
        const importPath = this.getRelativeImportPath(javaClass.filePath, dependentClass.filePath);
        imports += `import { ${dependentClass.name} } from '${importPath}';\n`;
      }
    }
    
    // Add imports for utility classes
    for (const dependency of javaClass.dependencies) {
      const dependentClass = this.findClassByFullName(dependency);
      if (dependentClass && dependentClass.isUtility) {
        const importPath = this.getRelativeImportPath(javaClass.filePath, dependentClass.filePath);
        imports += `import * as ${dependentClass.name} from '${importPath}';\n`;
      }
    }
    
    if (imports) {
      imports += '\n';
    }
    
    return imports + code;
  }

  /**
   * Find a class by its full name
   */
  private findClassByFullName(fullName: string): JavaClass | undefined {
    return this.projectStructure.classes.find(c => `${c.packageName}.${c.name}` === fullName);
  }

  /**
   * Get relative import path between two files
   */
  private getRelativeImportPath(fromPath: string, toPath: string): string {
    // Convert to TypeScript paths
    const fromTsPath = this.convertFilePath(fromPath);
    const toTsPath = this.convertFilePath(toPath);
    
    // Split paths into components
    const fromParts = fromTsPath.split('/');
    const toParts = toTsPath.split('/');
    
    // Remove filename
    fromParts.pop();
    const toFile = toParts.pop();
    
    // Find common prefix
    let commonPrefixLength = 0;
    const minLength = Math.min(fromParts.length, toParts.length);
    
    for (let i = 0; i < minLength; i++) {
      if (fromParts[i] === toParts[i]) {
        commonPrefixLength++;
      } else {
        break;
      }
    }
    
    // Build relative path
    const upCount = fromParts.length - commonPrefixLength;
    const downParts = toParts.slice(commonPrefixLength);
    
    let relativePath = '';
    for (let i = 0; i < upCount; i++) {
      relativePath += '../';
    }
    
    relativePath += [...downParts, toFile?.replace('.ts', '')].join('/');
    
    // If path doesn't start with . or /, add ./
    if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) {
      relativePath = './' + relativePath;
    }
    
    return relativePath;
  }

  /**
   * Convert Java file path to TypeScript file path
   */
  private convertFilePath(javaPath: string): string {
    // Replace .java with .ts
    let tsPath = javaPath.replace(/\.java$/, '.ts');
    
    // Convert src/main/java or src/test/java to src
    tsPath = tsPath.replace(/src\/(main|test)\/java\//, 'src/');
    
    return tsPath;
  }

  /**
   * Generate configuration files for the Playwright project
   */
  private generateConfigFiles(): void {
    // Generate playwright.config.ts
    const playwrightConfig = this.generatePlaywrightConfig();
    this.configFiles.push({
      filePath: 'playwright.config.ts',
      content: playwrightConfig
    });
    
    // Generate package.json
    const packageJson = this.generatePackageJson();
    this.configFiles.push({
      filePath: 'package.json',
      content: packageJson
    });
    
    // Generate tsconfig.json
    const tsConfig = this.generateTsConfig();
    this.configFiles.push({
      filePath: 'tsconfig.json',
      content: tsConfig
    });
    
    // Generate README.md
    const readme = this.generateReadme();
    this.configFiles.push({
      filePath: 'README.md',
      content: readme
    });
  }

  /**
   * Generate playwright.config.ts
   */
  private generatePlaywrightConfig(): string {
    return `import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in \`await expect(locator).toHaveText();\`
     */
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as \`click()\` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like \`await page.goto('/')\`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { channel: 'chrome' },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
});
`;
  }

  /**
   * Generate package.json
   */
  private generatePackageJson(): string {
    return `{
  "name": "playwright-tests",
  "version": "1.0.0",
  "description": "Playwright tests converted from Selenium",
  "main": "index.js",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "report": "playwright show-report"
  },
  "keywords": [
    "playwright",
    "testing",
    "automation"
  ],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.2"
  }
}
`;
  }

  /**
   * Generate tsconfig.json
   */
  private generateTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*", "playwright.config.ts"]
}
`;
  }

  /**
   * Generate README.md
   */
  private generateReadme(): string {
    return `# Playwright Test Suite

This project was automatically converted from a Selenium Java test suite to Playwright TypeScript.

## Project Structure

- \`src/\` - Contains all test files and page objects
- \`playwright.config.ts\` - Playwright configuration
- \`package.json\` - Project dependencies and scripts

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Install Playwright browsers:
   \`\`\`
   npx playwright install
   \`\`\`

3. Run the tests:
   \`\`\`
   npm test
   \`\`\`

## Running Tests with UI

To run tests with the Playwright UI:
\`\`\`
npm run test:ui
\`\`\`

## Running Tests in Headed Mode

To run tests in headed mode (with visible browser):
\`\`\`
npm run test:headed
\`\`\`

## Viewing Test Report

After tests have run, view the HTML report:
\`\`\`
npm run report
\`\`\`

## Notes on Conversion

This test suite was automatically converted from Selenium Java to Playwright TypeScript.
Some manual adjustments may be needed for complex scenarios.

`;
  }
}

export default BatchConverter;
