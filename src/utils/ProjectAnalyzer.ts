/**
 * ProjectAnalyzer.ts
 * Utility for analyzing Java Selenium project structure and dependencies
 */

import JavaParser, { ParsedElement } from './JavaParser';

export interface JavaClass {
  name: string;
  packageName: string;
  filePath: string;
  content: string;
  imports: string[];
  isTest: boolean;
  isUtility: boolean;
  isPageObject: boolean;
  dependencies: string[];
  parseResult?: ReturnType<JavaParser['parse']>;
}

export interface ProjectStructure {
  classes: JavaClass[];
  testClasses: JavaClass[];
  pageObjects: JavaClass[];
  utilities: JavaClass[];
  baseClasses: JavaClass[];
  gradleFiles: {
    path: string;
    content: string;
  }[];
  resourceFiles: {
    path: string;
    content: string;
  }[];
  packageStructure: Map<string, string[]>;
  dependencies: Map<string, string[]>;
}

export class ProjectAnalyzer {
  private files: File[];
  private rootPath: string;
  private fileContents: Map<string, string> = new Map();
  private parsedClasses: Map<string, JavaClass> = new Map();

  constructor(files: File[], rootPath: string) {
    this.files = files;
    this.rootPath = rootPath;
  }

  /**
   * Analyze the project structure
   */
  public async analyze(): Promise<ProjectStructure> {
    // Read all file contents
    await this.readAllFiles();
    
    // Parse all Java files
    this.parseJavaFiles();
    
    // Identify class types and relationships
    this.identifyClassTypes();
    this.mapDependencies();
    
    // Build the project structure
    return this.buildProjectStructure();
  }

  /**
   * Read all file contents
   */
  private async readAllFiles(): Promise<void> {
    const readPromises = this.files.map(file => this.readFile(file));
    await Promise.all(readPromises);
  }

  /**
   * Read a single file
   */
  private async readFile(file: File): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const relativePath = file.webkitRelativePath || file.name;
        this.fileContents.set(relativePath, content);
        resolve();
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Parse all Java files
   */
  private parseJavaFiles(): void {
    for (const [path, content] of this.fileContents.entries()) {
      if (!path.endsWith('.java')) continue;
      
      try {
        const parser = new JavaParser(content);
        const parseResult = parser.parse();
        
        const packageMatch = /package\s+([^;]+);/.exec(content);
        const packageName = packageMatch ? packageMatch[1].trim() : '';
        
        const classMatch = /public\s+class\s+(\w+)/.exec(content);
        const className = classMatch ? classMatch[1].trim() : path.split('/').pop()?.replace('.java', '') || '';
        
        const imports = parseResult.imports.map(imp => imp.details.importPath);
        
        const javaClass: JavaClass = {
          name: className,
          packageName,
          filePath: path,
          content,
          imports,
          isTest: this.isTestClass(content, className, path),
          isUtility: this.isUtilityClass(content, className, path),
          isPageObject: this.isPageObjectClass(content, className, path),
          dependencies: [],
          parseResult
        };
        
        this.parsedClasses.set(`${packageName}.${className}`, javaClass);
      } catch (error) {
        console.error(`Error parsing Java file ${path}:`, error);
      }
    }
  }

  /**
   * Check if a class is a test class
   */
  private isTestClass(content: string, className: string, path: string): boolean {
    // Check for test annotations
    if (content.includes('@Test') || content.includes('extends TestCase')) {
      return true;
    }
    
    // Check class name
    if (className.endsWith('Test') || className.endsWith('Tests') || className.endsWith('TestCase')) {
      return true;
    }
    
    // Check file path
    if (path.includes('/test/') || path.includes('/tests/')) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if a class is a utility class
   */
  private isUtilityClass(content: string, className: string, path: string): boolean {
    // Check class name
    if (className.endsWith('Util') || className.endsWith('Utils') || className.endsWith('Helper') || className.endsWith('Helpers')) {
      return true;
    }
    
    // Check for static methods
    const staticMethodCount = (content.match(/public\s+static\s+\w+/g) || []).length;
    const totalMethodCount = (content.match(/public\s+\w+\s+\w+/g) || []).length;
    
    if (staticMethodCount > 0 && staticMethodCount / totalMethodCount > 0.7) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if a class is a page object
   */
  private isPageObjectClass(content: string, className: string, path: string): boolean {
    // Check class name
    if (className.endsWith('Page') || className.endsWith('PageObject')) {
      return true;
    }
    
    // Check for WebElement fields
    if (content.includes('WebElement') && content.includes('findElement')) {
      return true;
    }
    
    // Check for PageFactory
    if (content.includes('PageFactory.initElements')) {
      return true;
    }
    
    return false;
  }

  /**
   * Identify class types
   */
  private identifyClassTypes(): void {
    // Further refine class types based on relationships
    for (const javaClass of this.parsedClasses.values()) {
      // Check if class extends a base class
      const extendsMatch = /extends\s+(\w+)/.exec(javaClass.content);
      if (extendsMatch) {
        const baseClassName = extendsMatch[1].trim();
        
        // If it extends a known base class, update its type
        for (const [fullName, baseClass] of this.parsedClasses.entries()) {
          if (baseClass.name === baseClassName) {
            // If it extends a page object, it's likely a page object
            if (baseClass.isPageObject) {
              javaClass.isPageObject = true;
            }
            
            // If it extends a test class, it's likely a test
            if (baseClass.isTest) {
              javaClass.isTest = true;
            }
            
            break;
          }
        }
      }
    }
  }

  /**
   * Map dependencies between classes
   */
  private mapDependencies(): void {
    for (const javaClass of this.parsedClasses.values()) {
      const dependencies: string[] = [];
      
      // Check imports for dependencies on other project classes
      for (const importPath of javaClass.imports) {
        if (this.parsedClasses.has(importPath)) {
          dependencies.push(importPath);
        }
      }
      
      // Check for class references in the content
      for (const [fullName, otherClass] of this.parsedClasses.entries()) {
        if (fullName === `${javaClass.packageName}.${javaClass.name}`) continue;
        
        // Check if the class name is used in the content
        if (javaClass.content.includes(` ${otherClass.name} `) || 
            javaClass.content.includes(`<${otherClass.name}>`) || 
            javaClass.content.includes(`${otherClass.name}.`)) {
          
          // Add as dependency if not already added
          if (!dependencies.includes(fullName)) {
            dependencies.push(fullName);
          }
        }
      }
      
      javaClass.dependencies = dependencies;
    }
  }

  /**
   * Build the project structure
   */
  private buildProjectStructure(): ProjectStructure {
    const classes: JavaClass[] = Array.from(this.parsedClasses.values());
    const testClasses = classes.filter(c => c.isTest);
    const pageObjects = classes.filter(c => c.isPageObject);
    const utilities = classes.filter(c => c.isUtility);
    
    // Identify base classes (classes that are extended by others)
    const baseClasses: JavaClass[] = [];
    const extendedClasses = new Set<string>();
    
    for (const javaClass of classes) {
      const extendsMatch = /extends\s+(\w+)/.exec(javaClass.content);
      if (extendsMatch) {
        const baseClassName = extendsMatch[1].trim();
        
        for (const [fullName, baseClass] of this.parsedClasses.entries()) {
          if (baseClass.name === baseClassName) {
            extendedClasses.add(fullName);
            break;
          }
        }
      }
    }
    
    for (const [fullName, javaClass] of this.parsedClasses.entries()) {
      if (extendedClasses.has(fullName)) {
        baseClasses.push(javaClass);
      }
    }
    
    // Collect Gradle files
    const gradleFiles = Array.from(this.fileContents.entries())
      .filter(([path]) => path.endsWith('.gradle'))
      .map(([path, content]) => ({ path, content }));
    
    // Collect resource files
    const resourceFiles = Array.from(this.fileContents.entries())
      .filter(([path]) => {
        const isResource = path.includes('/resources/') || 
                          path.endsWith('.properties') || 
                          path.endsWith('.xml') || 
                          path.endsWith('.json') || 
                          path.endsWith('.yml') || 
                          path.endsWith('.yaml') || 
                          path.endsWith('.txt');
        
        return isResource && !path.endsWith('.java') && !path.endsWith('.gradle');
      })
      .map(([path, content]) => ({ path, content }));
    
    // Build package structure
    const packageStructure = new Map<string, string[]>();
    
    for (const javaClass of classes) {
      if (!packageStructure.has(javaClass.packageName)) {
        packageStructure.set(javaClass.packageName, []);
      }
      
      packageStructure.get(javaClass.packageName)?.push(javaClass.name);
    }
    
    // Build dependency map
    const dependencies = new Map<string, string[]>();
    
    for (const javaClass of classes) {
      const fullName = `${javaClass.packageName}.${javaClass.name}`;
      dependencies.set(fullName, javaClass.dependencies);
    }
    
    return {
      classes,
      testClasses,
      pageObjects,
      utilities,
      baseClasses,
      gradleFiles,
      resourceFiles,
      packageStructure,
      dependencies
    };
  }
}

export default ProjectAnalyzer;
