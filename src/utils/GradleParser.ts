/**
 * GradleParser.ts
 * Utility for parsing Gradle build files and extracting project structure information
 */

export interface GradleDependency {
  group: string;
  name: string;
  version: string;
  configuration: string;
}

export interface GradleProject {
  projectName: string;
  sourceDirectories: string[];
  testDirectories: string[];
  dependencies: GradleDependency[];
  plugins: string[];
  repositories: string[];
}

export class GradleParser {
  private content: string;
  private lines: string[];

  constructor(content: string) {
    this.content = content;
    this.lines = content.split('\n');
  }

  /**
   * Parse the Gradle build file content
   */
  public parse(): GradleProject {
    const projectName = this.parseProjectName();
    const sourceDirectories = this.parseSourceDirectories();
    const testDirectories = this.parseTestDirectories();
    const dependencies = this.parseDependencies();
    const plugins = this.parsePlugins();
    const repositories = this.parseRepositories();

    return {
      projectName,
      sourceDirectories,
      testDirectories,
      dependencies,
      plugins,
      repositories
    };
  }

  /**
   * Parse project name from build.gradle
   */
  private parseProjectName(): string {
    // Look for project name in various formats
    const archivesBaseNameRegex = /archivesBaseName\s*=\s*['"]([^'"]+)['"]/;
    const rootProjectNameRegex = /rootProject\.name\s*=\s*['"]([^'"]+)['"]/;
    const projectNameRegex = /project\.name\s*=\s*['"]([^'"]+)['"]/;
    
    for (const line of this.lines) {
      let match = archivesBaseNameRegex.exec(line);
      if (match) return match[1];
      
      match = rootProjectNameRegex.exec(line);
      if (match) return match[1];
      
      match = projectNameRegex.exec(line);
      if (match) return match[1];
    }
    
    // If no explicit name found, try to extract from settings.gradle
    return 'selenium-project'; // Default name if not found
  }

  /**
   * Parse source directories from build.gradle
   */
  private parseSourceDirectories(): string[] {
    const directories: string[] = ['src/main/java']; // Default source directory
    
    // Look for custom source set definitions
    const sourceSetRegex = /sourceSets\s*{([^}]*)}/gs;
    const sourceSetMatch = sourceSetRegex.exec(this.content);
    
    if (sourceSetMatch) {
      const sourceSetContent = sourceSetMatch[1];
      const mainSourceRegex = /main\s*{([^}]*)}/gs;
      const mainSourceMatch = mainSourceRegex.exec(sourceSetContent);
      
      if (mainSourceMatch) {
        const mainContent = mainSourceMatch[1];
        const javaDirRegex = /java\s*{([^}]*)}/gs;
        const javaDirMatch = javaDirRegex.exec(mainContent);
        
        if (javaDirMatch) {
          const javaDirs = javaDirMatch[1].match(/srcDir[s]?\s*['"]([^'"]+)['"]/g);
          if (javaDirs) {
            directories.length = 0; // Clear default if custom dirs found
            javaDirs.forEach(dir => {
              const dirMatch = /srcDir[s]?\s*['"]([^'"]+)['"]/g.exec(dir);
              if (dirMatch) directories.push(dirMatch[1]);
            });
          }
        }
      }
    }
    
    return directories;
  }

  /**
   * Parse test directories from build.gradle
   */
  private parseTestDirectories(): string[] {
    const directories: string[] = ['src/test/java']; // Default test directory
    
    // Look for custom test source set definitions
    const sourceSetRegex = /sourceSets\s*{([^}]*)}/gs;
    const sourceSetMatch = sourceSetRegex.exec(this.content);
    
    if (sourceSetMatch) {
      const sourceSetContent = sourceSetMatch[1];
      const testSourceRegex = /test\s*{([^}]*)}/gs;
      const testSourceMatch = testSourceRegex.exec(sourceSetContent);
      
      if (testSourceMatch) {
        const testContent = testSourceMatch[1];
        const javaDirRegex = /java\s*{([^}]*)}/gs;
        const javaDirMatch = javaDirRegex.exec(testContent);
        
        if (javaDirMatch) {
          const javaDirs = javaDirMatch[1].match(/srcDir[s]?\s*['"]([^'"]+)['"]/g);
          if (javaDirs) {
            directories.length = 0; // Clear default if custom dirs found
            javaDirs.forEach(dir => {
              const dirMatch = /srcDir[s]?\s*['"]([^'"]+)['"]/g.exec(dir);
              if (dirMatch) directories.push(dirMatch[1]);
            });
          }
        }
      }
    }
    
    return directories;
  }

  /**
   * Parse dependencies from build.gradle
   */
  private parseDependencies(): GradleDependency[] {
    const dependencies: GradleDependency[] = [];
    
    // Look for dependencies block
    const dependenciesRegex = /dependencies\s*{([^}]*)}/gs;
    const dependenciesMatch = dependenciesRegex.exec(this.content);
    
    if (dependenciesMatch) {
      const dependenciesContent = dependenciesMatch[1];
      
      // Match different dependency formats
      // Format: configuration 'group:name:version'
      const singleQuoteDependencyRegex = /(\w+)\s*['"]([^:]+):([^:]+):([^'"]+)['"]/g;
      let match;
      
      while ((match = singleQuoteDependencyRegex.exec(dependenciesContent)) !== null) {
        dependencies.push({
          configuration: match[1],
          group: match[2],
          name: match[3],
          version: match[4]
        });
      }
      
      // Format: configuration "group:name:version"
      const doubleQuoteDependencyRegex = /(\w+)\s*["']([^:]+):([^:]+):([^"']+)["']/g;
      while ((match = doubleQuoteDependencyRegex.exec(dependenciesContent)) !== null) {
        dependencies.push({
          configuration: match[1],
          group: match[2],
          name: match[3],
          version: match[4]
        });
      }
      
      // Format: configuration group: 'group', name: 'name', version: 'version'
      const mapDependencyRegex = /(\w+)\s*\(\s*group\s*:\s*["']([^"']+)["']\s*,\s*name\s*:\s*["']([^"']+)["']\s*,\s*version\s*:\s*["']([^"']+)["']\s*\)/g;
      while ((match = mapDependencyRegex.exec(dependenciesContent)) !== null) {
        dependencies.push({
          configuration: match[1],
          group: match[2],
          name: match[3],
          version: match[4]
        });
      }
    }
    
    return dependencies;
  }

  /**
   * Parse plugins from build.gradle
   */
  private parsePlugins(): string[] {
    const plugins: string[] = [];
    
    // Look for plugins block
    const pluginsRegex = /plugins\s*{([^}]*)}/gs;
    const pluginsMatch = pluginsRegex.exec(this.content);
    
    if (pluginsMatch) {
      const pluginsContent = pluginsMatch[1];
      const pluginRegex = /id\s*["']([^"']+)["']/g;
      let match;
      
      while ((match = pluginRegex.exec(pluginsContent)) !== null) {
        plugins.push(match[1]);
      }
    }
    
    // Look for apply plugin statements
    const applyPluginRegex = /apply\s+plugin\s*:\s*["']([^"']+)["']/g;
    let match;
    
    while ((match = applyPluginRegex.exec(this.content)) !== null) {
      plugins.push(match[1]);
    }
    
    return plugins;
  }

  /**
   * Parse repositories from build.gradle
   */
  private parseRepositories(): string[] {
    const repositories: string[] = [];
    
    // Look for repositories block
    const repositoriesRegex = /repositories\s*{([^}]*)}/gs;
    const repositoriesMatch = repositoriesRegex.exec(this.content);
    
    if (repositoriesMatch) {
      const repositoriesContent = repositoriesMatch[1];
      
      // Check for mavenCentral
      if (repositoriesContent.includes('mavenCentral()')) {
        repositories.push('mavenCentral');
      }
      
      // Check for jcenter
      if (repositoriesContent.includes('jcenter()')) {
        repositories.push('jcenter');
      }
      
      // Check for google
      if (repositoriesContent.includes('google()')) {
        repositories.push('google');
      }
      
      // Check for maven URLs
      const mavenUrlRegex = /maven\s*{\s*url\s*["']([^"']+)["']/g;
      let match;
      
      while ((match = mavenUrlRegex.exec(repositoriesContent)) !== null) {
        repositories.push(`maven:${match[1]}`);
      }
    }
    
    return repositories;
  }
}

export default GradleParser;
