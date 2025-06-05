/**
 * Common TypeScript interfaces and types for the application
 */

// File structure interfaces
export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  file?: File;
}

// Java class structure interfaces
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
  parseResult?: any;
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

// Conversion result interfaces
export interface ConversionComment {
  line: number;
  text: string;
  type: 'info' | 'warning' | 'error';
}

export interface ConversionResult {
  code: string;
  comments: ConversionComment[];
}

export interface ConversionOutput {
  filePath: string;
  originalCode: string;
  convertedCode: string;
  comments: ConversionComment[];
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

// File progress tracking
export type FileStatus = 'pending' | 'processing' | 'complete' | 'error';

export interface FileProgress {
  progress: number;
  status: FileStatus;
  error?: string;
}

// Gradle project structure
export interface GradleProject {
  projectName: string;
  sourceDirectories: string[];
  testDirectories: string[];
  dependencies: {
    name: string;
    version: string;
    type: string;
  }[];
}

// Component props interfaces
export interface EnterpriseDropZoneProps {
  onFilesAccepted: (files: File[], rootPath: string) => void;
  onError: (error: string) => void;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  multiple?: boolean;
  allowFolders?: boolean;
  showFilePreview?: boolean;
}

export interface FileProgressItemProps {
  fileName: string;
  fileSize: number;
  progress: number;
  status: FileStatus;
  errorMessage?: string;
}

export interface AccessibleFileTreeProps {
  files: FileNode[];
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  onSelectFile?: (path: string) => void;
}

export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  maxWidth?: string | string[];
  padding?: string | string[];
}

export interface AccessibleHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onToggleColorMode?: () => void;
}

export interface AccessibleCardProps {
  title: string;
  description: string;
  icon?: React.ReactElement;
  onClick?: () => void;
  isSelected?: boolean;
  ariaLabel?: string;
}
