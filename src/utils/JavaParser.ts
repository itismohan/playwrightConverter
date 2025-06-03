/**
 * JavaParser.ts
 * Utility for parsing Java Selenium test scripts and identifying key components
 */

export interface ParsedElement {
  type: string;
  original: string;
  details: {
    [key: string]: any;
  };
  lineNumber?: number;
}

export class JavaParser {
  private content: string;
  private lines: string[];

  constructor(content: string) {
    this.content = content;
    this.lines = content.split('\n');
  }

  /**
   * Parse the Java file content to identify Selenium components
   */
  public parse(): {
    imports: ParsedElement[];
    classDefinition: ParsedElement | null;
    methods: ParsedElement[];
    seleniumElements: ParsedElement[];
    assertions: ParsedElement[];
    waits: ParsedElement[];
    actions: ParsedElement[];
  } {
    const imports = this.parseImports();
    const classDefinition = this.parseClassDefinition();
    const methods = this.parseMethods();
    const seleniumElements = this.parseSeleniumElements();
    const assertions = this.parseAssertions();
    const waits = this.parseWaits();
    const actions = this.parseActions();

    return {
      imports,
      classDefinition,
      methods,
      seleniumElements,
      assertions,
      waits,
      actions
    };
  }

  /**
   * Parse Java import statements
   */
  private parseImports(): ParsedElement[] {
    const importRegex = /import\s+(static\s+)?([^;]+);/g;
    const imports: ParsedElement[] = [];
    
    let match;
    while ((match = importRegex.exec(this.content)) !== null) {
      const isStatic = !!match[1];
      const importPath = match[2];
      
      imports.push({
        type: 'import',
        original: match[0],
        details: {
          isStatic,
          importPath,
          isSelenium: this.isSeleniumImport(importPath)
        },
        lineNumber: this.getLineNumber(match.index)
      });
    }
    
    return imports;
  }

  /**
   * Check if an import is related to Selenium
   */
  private isSeleniumImport(importPath: string): boolean {
    return importPath.includes('org.openqa.selenium') || 
           importPath.includes('junit') || 
           importPath.includes('testng');
  }

  /**
   * Parse class definition
   */
  private parseClassDefinition(): ParsedElement | null {
    const classRegex = /public\s+class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*\{/;
    const match = classRegex.exec(this.content);
    
    if (!match) return null;
    
    return {
      type: 'class',
      original: match[0],
      details: {
        className: match[1],
        parentClass: match[2] || null,
        interfaces: match[3] ? match[3].split(',').map(i => i.trim()) : []
      },
      lineNumber: this.getLineNumber(match.index)
    };
  }

  /**
   * Parse method definitions
   */
  private parseMethods(): ParsedElement[] {
    const methodRegex = /(?:@Test|@Before|@After|@BeforeClass|@AfterClass)?\s*(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\([^)]*\)\s*(?:throws\s+[\w,\s]+)?\s*\{/g;
    const methods: ParsedElement[] = [];
    
    let match;
    while ((match = methodRegex.exec(this.content)) !== null) {
      const methodContent = this.extractMethodContent(match.index);
      
      methods.push({
        type: 'method',
        original: match[0],
        details: {
          methodName: match[1],
          isTest: match[0].includes('@Test'),
          isSetup: match[0].includes('@Before'),
          isTeardown: match[0].includes('@After'),
          content: methodContent
        },
        lineNumber: this.getLineNumber(match.index)
      });
    }
    
    return methods;
  }

  /**
   * Extract the content of a method
   */
  private extractMethodContent(startIndex: number): string {
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let endIndex = startIndex;
    
    for (let i = startIndex; i < this.content.length; i++) {
      const char = this.content[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !inString) {
        inString = true;
      } else if (char === '"' && inString) {
        inString = false;
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
    }
    
    return this.content.substring(startIndex, endIndex);
  }

  /**
   * Parse Selenium element locators
   */
  private parseSeleniumElements(): ParsedElement[] {
    const elementRegex = /(?:driver|webDriver|wd)\.findElement\(By\.(id|name|xpath|cssSelector|className|tagName|linkText|partialLinkText)\s*\(\s*"([^"]+)"\s*\)\)/g;
    const elements: ParsedElement[] = [];
    
    let match;
    while ((match = elementRegex.exec(this.content)) !== null) {
      elements.push({
        type: 'element',
        original: match[0],
        details: {
          locatorType: match[1],
          locatorValue: match[2]
        },
        lineNumber: this.getLineNumber(match.index)
      });
    }
    
    return elements;
  }

  /**
   * Parse assertions
   */
  private parseAssertions(): ParsedElement[] {
    const assertRegex = /(?:Assert|assertEquals|assertTrue|assertFalse|assertNotNull|assertNull|assertThat)\s*\(([^;]+)\)/g;
    const assertions: ParsedElement[] = [];
    
    let match;
    while ((match = assertRegex.exec(this.content)) !== null) {
      assertions.push({
        type: 'assertion',
        original: match[0],
        details: {
          assertionContent: match[1]
        },
        lineNumber: this.getLineNumber(match.index)
      });
    }
    
    return assertions;
  }

  /**
   * Parse wait statements
   */
  private parseWaits(): ParsedElement[] {
    const waitRegex = /(?:wait|WebDriverWait|FluentWait).*?\.until\(([^;]+)\)/g;
    const waits: ParsedElement[] = [];
    
    let match;
    while ((match = waitRegex.exec(this.content)) !== null) {
      waits.push({
        type: 'wait',
        original: match[0],
        details: {
          condition: match[1]
        },
        lineNumber: this.getLineNumber(match.index)
      });
    }
    
    return waits;
  }

  /**
   * Parse Selenium actions
   */
  private parseActions(): ParsedElement[] {
    const actionRegex = /(?:\.click\(\)|\.sendKeys\([^)]+\)|\.clear\(\)|\.submit\(\)|\.selectByVisibleText\([^)]+\)|\.selectByValue\([^)]+\)|\.selectByIndex\([^)]+\)|\.moveToElement\([^)]+\)|\.dragAndDrop\([^)]+\)|\.perform\(\))/g;
    const actions: ParsedElement[] = [];
    
    let match;
    while ((match = actionRegex.exec(this.content)) !== null) {
      // Get the full statement by looking backward for the start
      const statementStart = this.content.lastIndexOf('\n', match.index) + 1;
      const statementEnd = this.content.indexOf(';', match.index) + 1;
      const fullStatement = this.content.substring(statementStart, statementEnd).trim();
      
      actions.push({
        type: 'action',
        original: fullStatement,
        details: {
          actionType: this.determineActionType(match[0]),
          actionContent: match[0]
        },
        lineNumber: this.getLineNumber(match.index)
      });
    }
    
    return actions;
  }

  /**
   * Determine the type of action
   */
  private determineActionType(action: string): string {
    if (action.includes('.click()')) return 'click';
    if (action.includes('.sendKeys(')) return 'input';
    if (action.includes('.clear()')) return 'clear';
    if (action.includes('.submit()')) return 'submit';
    if (action.includes('.selectByVisibleText(')) return 'select';
    if (action.includes('.selectByValue(')) return 'select';
    if (action.includes('.selectByIndex(')) return 'select';
    if (action.includes('.moveToElement(')) return 'hover';
    if (action.includes('.dragAndDrop(')) return 'dragAndDrop';
    if (action.includes('.perform()')) return 'perform';
    return 'unknown';
  }

  /**
   * Get line number from character index
   */
  private getLineNumber(index: number): number {
    const content = this.content.substring(0, index);
    return (content.match(/\n/g) || []).length + 1;
  }
}

export default JavaParser;
