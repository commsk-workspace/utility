// Document types
export type DocumentType = 
  | 'mermaid' 
  | 'markdown' 
  | 'json' 
  | 'sql' 
  | 'text' 
  | 'yaml' 
  | 'xml' 
  | 'csv';

export interface Document {
  id: string;
  type: DocumentType;
  title: string | null;
  content: string;
  language: string | null;
  viewPassword: string | null;
  editPassword: string | null;
  isPublic: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Version {
  id: string;
  documentId: string;
  content: string;
  createdAt: Date;
  createdBy: string | null;
}

// API Request/Response types
export interface CreateDocumentRequest {
  type: DocumentType;
  title?: string;
  content: string;
  language?: string;
  viewPassword?: string;
  editPassword?: string;
  isPublic?: boolean;
  expiresAt?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  editPassword: string;
}

export interface VerifyPasswordRequest {
  password: string;
  type: 'view' | 'edit';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Tool categories
export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  category: string;
  tags: string[];
}

// Share dialog types
export interface ShareSettings {
  isPublic: boolean;
  viewPassword: string;
  editPassword: string;
  expiresAt: string;
}

// Editor types
export interface EditorState {
  content: string;
  language: string;
  isDirty: boolean;
}

// Color types
export interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

// JSON types
export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  lineNumber?: number;
}

// Regex types
export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

export interface RegexResult {
  isValid: boolean;
  matches: RegexMatch[];
  error?: string;
}

// Hash types
export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

// Case types
export type CaseType = 
  | 'camelCase' 
  | 'PascalCase' 
  | 'snake_case' 
  | 'kebab-case' 
  | 'CONSTANT_CASE' 
  | 'lowercase' 
  | 'UPPERCASE' 
  | 'Title Case'
  | 'Sentence case';

// Converter types
export type ConversionType = 
  | 'json-csv' 
  | 'csv-json' 
  | 'json-xml' 
  | 'xml-json' 
  | 'json-yaml' 
  | 'yaml-json'
  | 'base64-encode'
  | 'base64-decode'
  | 'url-encode'
  | 'url-decode';
