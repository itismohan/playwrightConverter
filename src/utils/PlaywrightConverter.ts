/**
 * PlaywrightConverter.ts
 * Utility for converting Java Selenium test scripts to Playwright TypeScript
 */

import { ParsedElement } from './JavaParser';

export interface ConversionResult {
  code: string;
  comments: {
    line: number;
    text: string;
    type: 'info' | 'warning' | 'error';
  }[];
}

export class PlaywrightConverter {
  private imports: ParsedElement[];
  private classDefinition: ParsedElement | null;
  private methods: ParsedElement[];
  private seleniumElements: ParsedElement[];
  private assertions: ParsedElement[];
  private waits: ParsedElement[];
  private actions: ParsedElement[];
  private comments: {
    line: number;
    text: string;
    type: 'info' | 'warning' | 'error';
  }[];

  constructor(parseResult: {
    imports: ParsedElement[];
    classDefinition: ParsedElement | null;
    methods: ParsedElement[];
    seleniumElements: ParsedElement[];
    assertions: ParsedElement[];
    waits: ParsedElement[];
    actions: ParsedElement[];
  }) {
    this.imports = parseResult.imports;
    this.classDefinition = parseResult.classDefinition;
    this.methods = parseResult.methods;
    this.seleniumElements = parseResult.seleniumElements;
    this.assertions = parseResult.assertions;
    this.waits = parseResult.waits;
    this.actions = parseResult.actions;
    this.comments = [];
  }

  /**
   * Convert Java Selenium test to Playwright TypeScript
   */
  public convert(): ConversionResult {
    let playwrightCode = this.generateImports();
    playwrightCode += this.generateTestStructure();

    return {
      code: playwrightCode,
      comments: this.comments
    };
  }

  /**
   * Generate Playwright imports
   */
  private generateImports(): string {
    let imports = "import { test, expect } from '@playwright/test';\n";
    
    // Check if we need page.evaluate for JavaScript execution
    if (this.content.includes('executeScript') || this.content.includes('executeAsyncScript')) {
      this.addComment(1, 'JavaScript execution detected, added page.evaluate import', 'info');
    }
    
    return imports + "\n";
  }

  /**
   * Generate the test structure
   */
  private generateTestStructure(): string {
    let testCode = '';
    const className = this.classDefinition?.details.className || 'SeleniumTest';
    
    testCode += `test.describe('${className}', () => {\n`;
    
    // Add beforeEach if setup methods exist
    const setupMethods = this.methods.filter(m => m.details.isSetup);
    if (setupMethods.length > 0) {
      testCode += this.generateBeforeEach(setupMethods);
    } else {
      testCode += `  test.beforeEach(async ({ page }) => {\n`;
      testCode += `    // Setup code goes here\n`;
      testCode += `  });\n\n`;
    }
    
    // Add test methods
    const testMethods = this.methods.filter(m => m.details.isTest);
    if (testMethods.length > 0) {
      testMethods.forEach(method => {
        testCode += this.generateTestMethod(method);
      });
    } else {
      // If no test methods found, create a sample test
      testCode += `  test('sample test', async ({ page }) => {\n`;
      testCode += `    // Test code goes here\n`;
      testCode += `  });\n\n`;
      this.addComment(1, 'No test methods found, created a sample test', 'warning');
    }
    
    // Add afterEach if teardown methods exist
    const teardownMethods = this.methods.filter(m => m.details.isTeardown);
    if (teardownMethods.length > 0) {
      testCode += this.generateAfterEach(teardownMethods);
    }
    
    testCode += '});\n';
    
    return testCode;
  }

  /**
   * Generate beforeEach block
   */
  private generateBeforeEach(setupMethods: ParsedElement[]): string {
    let code = `  test.beforeEach(async ({ page }) => {\n`;
    
    setupMethods.forEach(method => {
      const convertedSetup = this.convertMethodContent(method.details.content);
      code += this.indentCode(convertedSetup, 4);
    });
    
    code += `  });\n\n`;
    return code;
  }

  /**
   * Generate afterEach block
   */
  private generateAfterEach(teardownMethods: ParsedElement[]): string {
    let code = `  test.afterEach(async ({ page }) => {\n`;
    
    teardownMethods.forEach(method => {
      const convertedTeardown = this.convertMethodContent(method.details.content);
      code += this.indentCode(convertedTeardown, 4);
    });
    
    code += `  });\n\n`;
    return code;
  }

  /**
   * Generate a test method
   */
  private generateTestMethod(method: ParsedElement): string {
    const methodName = method.details.methodName;
    let code = `  test('${methodName}', async ({ page }) => {\n`;
    
    const convertedMethod = this.convertMethodContent(method.details.content);
    code += this.indentCode(convertedMethod, 4);
    
    code += `  });\n\n`;
    return code;
  }

  /**
   * Convert method content from Selenium to Playwright
   */
  private convertMethodContent(content: string): string {
    let converted = '';
    
    // Extract lines of code from the method content
    const methodLines = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('/*'));
    
    for (const line of methodLines) {
      // Skip method signature and braces
      if (line.includes('public') || line.includes('private') || line.includes('protected') || 
          line === '{' || line === '}') {
        continue;
      }
      
      // Convert the line
      const convertedLine = this.convertLine(line);
      if (convertedLine) {
        converted += convertedLine + '\n';
      }
    }
    
    return converted;
  }

  /**
   * Convert a single line of Selenium code to Playwright
   */
  private convertLine(line: string): string | null {
    // Skip empty lines or comments
    if (!line || line.trim().length === 0 || line.trim().startsWith('//')) {
      return null;
    }
    
    // Handle navigation
    if (line.includes('.get(') || line.includes('.navigate().to(')) {
      return this.convertNavigation(line);
    }
    
    // Handle element location and actions
    if (line.includes('.findElement(')) {
      return this.convertElementAction(line);
    }
    
    // Handle assertions
    if (line.includes('assert') || line.includes('Assert')) {
      return this.convertAssertion(line);
    }
    
    // Handle waits
    if (line.includes('.until(')) {
      return this.convertWait(line);
    }
    
    // Handle JavaScript execution
    if (line.includes('.executeScript(')) {
      return this.convertJavaScriptExecution(line);
    }
    
    // Handle variable declarations
    if (line.includes('WebElement') || line.includes('String') || line.includes('int') || line.includes('boolean')) {
      return this.convertVariableDeclaration(line);
    }
    
    // If we can't convert the line, add a comment and return the original
    this.addComment(0, `Could not convert: ${line}`, 'warning');
    return `// TODO: Convert manually: ${line}`;
  }

  /**
   * Convert navigation commands
   */
  private convertNavigation(line: string): string {
    if (line.includes('.get(')) {
      const urlMatch = /\.get\(\s*"([^"]+)"\s*\)/.exec(line);
      if (urlMatch) {
        return `await page.goto('${urlMatch[1]}');`;
      }
    } else if (line.includes('.navigate().to(')) {
      const urlMatch = /\.navigate\(\)\.to\(\s*"([^"]+)"\s*\)/.exec(line);
      if (urlMatch) {
        return `await page.goto('${urlMatch[1]}');`;
      }
    }
    
    this.addComment(0, `Could not convert navigation: ${line}`, 'warning');
    return `// TODO: Convert navigation manually: ${line}`;
  }

  /**
   * Convert element location and actions
   */
  private convertElementAction(line: string): string {
    // Extract locator
    const locatorMatch = /By\.(id|name|xpath|cssSelector|className|tagName|linkText|partialLinkText)\s*\(\s*"([^"]+)"\s*\)/.exec(line);
    
    if (!locatorMatch) {
      this.addComment(0, `Could not extract locator from: ${line}`, 'warning');
      return `// TODO: Convert element action manually: ${line}`;
    }
    
    const locatorType = locatorMatch[1];
    const locatorValue = locatorMatch[2];
    let playwrightLocator = this.convertLocator(locatorType, locatorValue);
    
    // Handle different actions
    if (line.includes('.click()')) {
      return `await ${playwrightLocator}.click();`;
    } else if (line.includes('.sendKeys(')) {
      const textMatch = /\.sendKeys\(\s*"([^"]*)"\s*\)/.exec(line);
      if (textMatch) {
        return `await ${playwrightLocator}.fill('${textMatch[1]}');`;
      }
    } else if (line.includes('.clear()')) {
      return `await ${playwrightLocator}.clear();`;
    } else if (line.includes('.getText()')) {
      if (line.includes('=')) {
        const variableName = line.split('=')[0].trim();
        return `const ${variableName} = await ${playwrightLocator}.textContent();`;
      } else {
        return `await ${playwrightLocator}.textContent();`;
      }
    } else if (line.includes('.getAttribute(')) {
      const attrMatch = /\.getAttribute\(\s*"([^"]*)"\s*\)/.exec(line);
      if (attrMatch) {
        const attrName = attrMatch[1];
        if (line.includes('=')) {
          const variableName = line.split('=')[0].trim();
          return `const ${variableName} = await ${playwrightLocator}.getAttribute('${attrName}');`;
        } else {
          return `await ${playwrightLocator}.getAttribute('${attrName}');`;
        }
      }
    } else if (line.includes('.isDisplayed()')) {
      if (line.includes('=')) {
        const variableName = line.split('=')[0].trim();
        return `const ${variableName} = await ${playwrightLocator}.isVisible();`;
      } else {
        return `await ${playwrightLocator}.isVisible();`;
      }
    } else if (line.includes('.isEnabled()')) {
      if (line.includes('=')) {
        const variableName = line.split('=')[0].trim();
        return `const ${variableName} = await ${playwrightLocator}.isEnabled();`;
      } else {
        return `await ${playwrightLocator}.isEnabled();`;
      }
    } else if (line.includes('.submit()')) {
      return `await ${playwrightLocator}.evaluate(el => el.form.submit());`;
    }
    
    this.addComment(0, `Could not convert element action: ${line}`, 'warning');
    return `// TODO: Convert element action manually: ${line}`;
  }

  /**
   * Convert Selenium locator to Playwright locator
   */
  private convertLocator(locatorType: string, locatorValue: string): string {
    switch (locatorType) {
      case 'id':
        return `page.locator('#${locatorValue}')`;
      case 'name':
        return `page.locator('[name="${locatorValue}"]')`;
      case 'xpath':
        return `page.locator('xpath=${locatorValue}')`;
      case 'cssSelector':
        return `page.locator('${locatorValue}')`;
      case 'className':
        return `page.locator('.${locatorValue}')`;
      case 'tagName':
        return `page.locator('${locatorValue}')`;
      case 'linkText':
        return `page.getByText('${locatorValue}')`;
      case 'partialLinkText':
        return `page.getByText('${locatorValue}', { exact: false })`;
      default:
        this.addComment(0, `Unknown locator type: ${locatorType}`, 'warning');
        return `page.locator('${locatorValue}')`;
    }
  }

  /**
   * Convert assertions
   */
  private convertAssertion(line: string): string {
    if (line.includes('assertEquals')) {
      const match = /assertEquals\s*\(\s*([^,]+),\s*([^)]+)\s*\)/.exec(line);
      if (match) {
        const actual = match[1].trim();
        const expected = match[2].trim();
        return `expect(${actual}).toBe(${expected});`;
      }
    } else if (line.includes('assertTrue')) {
      const match = /assertTrue\s*\(\s*([^)]+)\s*\)/.exec(line);
      if (match) {
        const condition = match[1].trim();
        return `expect(${condition}).toBe(true);`;
      }
    } else if (line.includes('assertFalse')) {
      const match = /assertFalse\s*\(\s*([^)]+)\s*\)/.exec(line);
      if (match) {
        const condition = match[1].trim();
        return `expect(${condition}).toBe(false);`;
      }
    } else if (line.includes('assertNotNull')) {
      const match = /assertNotNull\s*\(\s*([^)]+)\s*\)/.exec(line);
      if (match) {
        const value = match[1].trim();
        return `expect(${value}).not.toBeNull();`;
      }
    } else if (line.includes('assertNull')) {
      const match = /assertNull\s*\(\s*([^)]+)\s*\)/.exec(line);
      if (match) {
        const value = match[1].trim();
        return `expect(${value}).toBeNull();`;
      }
    }
    
    this.addComment(0, `Could not convert assertion: ${line}`, 'warning');
    return `// TODO: Convert assertion manually: ${line}`;
  }

  /**
   * Convert waits
   */
  private convertWait(line: string): string {
    if (line.includes('visibilityOfElementLocated')) {
      const locatorMatch = /By\.(id|name|xpath|cssSelector|className|tagName|linkText|partialLinkText)\s*\(\s*"([^"]+)"\s*\)/.exec(line);
      if (locatorMatch) {
        const locatorType = locatorMatch[1];
        const locatorValue = locatorMatch[2];
        const playwrightLocator = this.convertLocator(locatorType, locatorValue);
        return `await ${playwrightLocator}.waitFor({ state: 'visible' });`;
      }
    } else if (line.includes('elementToBeClickable')) {
      const locatorMatch = /By\.(id|name|xpath|cssSelector|className|tagName|linkText|partialLinkText)\s*\(\s*"([^"]+)"\s*\)/.exec(line);
      if (locatorMatch) {
        const locatorType = locatorMatch[1];
        const locatorValue = locatorMatch[2];
        const playwrightLocator = this.convertLocator(locatorType, locatorValue);
        return `await ${playwrightLocator}.waitFor({ state: 'attached' });`;
      }
    } else if (line.includes('presenceOfElementLocated')) {
      const locatorMatch = /By\.(id|name|xpath|cssSelector|className|tagName|linkText|partialLinkText)\s*\(\s*"([^"]+)"\s*\)/.exec(line);
      if (locatorMatch) {
        const locatorType = locatorMatch[1];
        const locatorValue = locatorMatch[2];
        const playwrightLocator = this.convertLocator(locatorType, locatorValue);
        return `await ${playwrightLocator}.waitFor({ state: 'attached' });`;
      }
    } else if (line.includes('invisibilityOfElementLocated')) {
      const locatorMatch = /By\.(id|name|xpath|cssSelector|className|tagName|linkText|partialLinkText)\s*\(\s*"([^"]+)"\s*\)/.exec(line);
      if (locatorMatch) {
        const locatorType = locatorMatch[1];
        const locatorValue = locatorMatch[2];
        const playwrightLocator = this.convertLocator(locatorType, locatorValue);
        return `await ${playwrightLocator}.waitFor({ state: 'hidden' });`;
      }
    } else if (line.includes('Thread.sleep')) {
      const match = /Thread\.sleep\(\s*(\d+)\s*\)/.exec(line);
      if (match) {
        const milliseconds = match[1];
        return `await page.waitForTimeout(${milliseconds});`;
      }
    }
    
    this.addComment(0, `Could not convert wait: ${line}`, 'warning');
    return `// TODO: Convert wait manually: ${line}`;
  }

  /**
   * Convert JavaScript execution
   */
  private convertJavaScriptExecution(line: string): string {
    const scriptMatch = /executeScript\(\s*"([^"]+)"/.exec(line);
    if (scriptMatch) {
      const script = scriptMatch[1];
      return `await page.evaluate(() => { ${script} });`;
    }
    
    this.addComment(0, `Could not convert JavaScript execution: ${line}`, 'warning');
    return `// TODO: Convert JavaScript execution manually: ${line}`;
  }

  /**
   * Convert variable declarations
   */
  private convertVariableDeclaration(line: string): string {
    // WebElement to Playwright Locator
    if (line.includes('WebElement')) {
      const match = /WebElement\s+(\w+)\s*=\s*(.+)/.exec(line);
      if (match) {
        const variableName = match[1];
        const value = match[2].trim();
        
        if (value.includes('.findElement(')) {
          const locatorMatch = /By\.(id|name|xpath|cssSelector|className|tagName|linkText|partialLinkText)\s*\(\s*"([^"]+)"\s*\)/.exec(value);
          if (locatorMatch) {
            const locatorType = locatorMatch[1];
            const locatorValue = locatorMatch[2];
            const playwrightLocator = this.convertLocator(locatorType, locatorValue);
            return `const ${variableName} = ${playwrightLocator};`;
          }
        }
      }
    }
    
    // String, int, boolean declarations
    if (line.includes('String') || line.includes('int') || line.includes('boolean')) {
      const match = /(String|int|boolean)\s+(\w+)\s*=\s*(.+)/.exec(line);
      if (match) {
        const type = match[1];
        const variableName = match[2];
        const value = match[3].trim().replace(';', '');
        
        return `const ${variableName} = ${value};`;
      }
    }
    
    this.addComment(0, `Could not convert variable declaration: ${line}`, 'warning');
    return `// TODO: Convert variable declaration manually: ${line}`;
  }

  /**
   * Add a comment to the comments list
   */
  private addComment(line: number, text: string, type: 'info' | 'warning' | 'error'): void {
    this.comments.push({ line, text, type });
  }

  /**
   * Indent code by a specified number of spaces
   */
  private indentCode(code: string, spaces: number): string {
    const indent = ' '.repeat(spaces);
    return code.split('\n').map(line => line ? indent + line : line).join('\n');
  }

  /**
   * Get the full content of the Java file
   */
  private get content(): string {
    return this.imports.map(i => i.original).join('\n') + '\n' +
      (this.classDefinition?.original || '') + '\n' +
      this.methods.map(m => m.details.content).join('\n');
  }
}

export default PlaywrightConverter;
