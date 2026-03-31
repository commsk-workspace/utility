// JSON Tools Utility Functions

type ToolResult<T> = { success: boolean; data?: T; error?: string };

export function formatJson(input: string, indent: number = 2): ToolResult<string> {
  try {
    const parsed = JSON.parse(input);
    return { success: true, data: JSON.stringify(parsed, null, indent) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

export function minifyJson(input: string): ToolResult<string> {
  try {
    const parsed = JSON.parse(input);
    return { success: true, data: JSON.stringify(parsed) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

export function validateJson(input: string): { valid: boolean; error?: string; line?: number } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Try to extract line number from error message
    const lineMatch = errorMessage.match(/line (\d+)/i) || errorMessage.match(/position (\d+)/i);
    return {
      valid: false,
      error: errorMessage,
      line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
    };
  }
}

export function jsonToTree(obj: unknown, path: string = ''): JsonTreeNode[] {
  const nodes: JsonTreeNode[] = [];
  
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemPath = path ? `${path}[${index}]` : `[${index}]`;
        nodes.push({
          key: String(index),
          value: item,
          type: getType(item),
          path: itemPath,
          children: typeof item === 'object' && item !== null ? jsonToTree(item, itemPath) : undefined,
        });
      });
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        const itemPath = path ? `${path}.${key}` : key;
        nodes.push({
          key,
          value,
          type: getType(value),
          path: itemPath,
          children: typeof value === 'object' && value !== null ? jsonToTree(value, itemPath) : undefined,
        });
      });
    }
  }
  
  return nodes;
}

export interface JsonTreeNode {
  key: string;
  value: unknown;
  type: string;
  path: string;
  children?: JsonTreeNode[];
}

function getType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export function jsonToCsv(json: string): string {
  try {
    const data = JSON.parse(json);
    
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }
    
    if (data.length === 0) {
      return '';
    }
    
    // Get all unique keys
    const keys = [...new Set(data.flatMap(obj => Object.keys(obj)))];
    
    // Create header
    const header = keys.map(key => `"${key}"`).join(',');
    
    // Create rows
    const rows = data.map(obj => {
      return keys.map(key => {
        const value = obj[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return String(value);
      }).join(',');
    });
    
    return [header, ...rows].join('\n');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to convert JSON to CSV');
  }
}

export function compareJson(json1: string, json2: string): JsonDiff[] {
  try {
    const obj1 = JSON.parse(json1);
    const obj2 = JSON.parse(json2);
    return diffObjects(obj1, obj2, '');
  } catch {
    throw new Error('Invalid JSON input');
  }
}

export interface JsonDiff {
  path: string;
  type: 'added' | 'removed' | 'changed';
  oldValue?: unknown;
  newValue?: unknown;
}

function diffObjects(obj1: unknown, obj2: unknown, path: string): JsonDiff[] {
  const diffs: JsonDiff[] = [];
  
  if (typeof obj1 !== typeof obj2) {
    diffs.push({ path: path || 'root', type: 'changed', oldValue: obj1, newValue: obj2 });
    return diffs;
  }
  
  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    if (obj1 !== obj2) {
      diffs.push({ path: path || 'root', type: 'changed', oldValue: obj1, newValue: obj2 });
    }
    return diffs;
  }
  
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const maxLength = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLength; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      if (i >= obj1.length) {
        diffs.push({ path: itemPath, type: 'added', newValue: obj2[i] });
      } else if (i >= obj2.length) {
        diffs.push({ path: itemPath, type: 'removed', oldValue: obj1[i] });
      } else {
        diffs.push(...diffObjects(obj1[i], obj2[i], itemPath));
      }
    }
    return diffs;
  }
  
  const allKeys = new Set([...Object.keys(obj1 as object), ...Object.keys(obj2 as object)]);
  
  for (const key of allKeys) {
    const itemPath = path ? `${path}.${key}` : key;
    const val1 = (obj1 as Record<string, unknown>)[key];
    const val2 = (obj2 as Record<string, unknown>)[key];
    
    if (!(key in (obj1 as object))) {
      diffs.push({ path: itemPath, type: 'added', newValue: val2 });
    } else if (!(key in (obj2 as object))) {
      diffs.push({ path: itemPath, type: 'removed', oldValue: val1 });
    } else {
      diffs.push(...diffObjects(val1, val2, itemPath));
    }
  }
  
  return diffs;
}

export function jsonToTypeScript(input: string, interfaceName: string = 'Root'): ToolResult<string> {
  try {
    const obj = JSON.parse(input);
    const result = generateTypeScriptInterface(obj, interfaceName);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

function generateTypeScriptInterface(obj: unknown, name: string): string {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return typeof obj;
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'unknown[]';
    const itemType = generateTypeScriptInterface(obj[0], `${name}Item`);
    return `${itemType}[]`;
  }
  
  const lines: string[] = [`interface ${name} {`];
  for (const [key, value] of Object.entries(obj)) {
    const type = getTypeScriptType(value, `${name}${capitalize(key)}`);
    lines.push(`  ${key}: ${type};`);
  }
  lines.push('}');
  return lines.join('\n');
}

function getTypeScriptType(value: unknown, name: string): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    return `${getTypeScriptType(value[0], name)}[]`;
  }
  if (typeof value === 'object') return 'Record<string, unknown>';
  return 'unknown';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function jsonToYaml(input: string): ToolResult<string> {
  try {
    const obj = JSON.parse(input);
    const result = convertToYaml(obj, 0);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

function convertToYaml(obj: unknown, indent: number): string {
  const spaces = '  '.repeat(indent);
  
  if (obj === null) return 'null';
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') return `"${obj}"`;
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      const value = convertToYaml(item, indent + 1);
      if (typeof item === 'object' && item !== null) {
        return `\n${spaces}- ${value.trim()}`;
      }
      return `\n${spaces}- ${value}`;
    }).join('');
  }
  
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  
  return entries.map(([key, value]) => {
    const yamlValue = convertToYaml(value, indent + 1);
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return `\n${spaces}${key}:${yamlValue}`;
    }
    if (Array.isArray(value)) {
      return `\n${spaces}${key}:${yamlValue}`;
    }
    return `\n${spaces}${key}: ${yamlValue}`;
  }).join('');
}

export function flattenJson(input: string, delimiter: string = '.'): ToolResult<string> {
  try {
    const obj = JSON.parse(input);
    const result = flattenObject(obj, '', delimiter);
    return { success: true, data: JSON.stringify(result, null, 2) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

function flattenObject(obj: unknown, prefix: string, delimiter: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  if (typeof obj !== 'object' || obj === null) {
    return { [prefix]: obj };
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const key = prefix ? `${prefix}${delimiter}${index}` : String(index);
      Object.assign(result, flattenObject(item, key, delimiter));
    });
  } else {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}${delimiter}${key}` : key;
      if (typeof value === 'object' && value !== null) {
        Object.assign(result, flattenObject(value, newKey, delimiter));
      } else {
        result[newKey] = value;
      }
    });
  }
  
  return result;
}

export function unflattenJson(input: string, delimiter: string = '.'): ToolResult<string> {
  try {
    const obj = JSON.parse(input);
    const result = unflattenObject(obj, delimiter);
    return { success: true, data: JSON.stringify(result, null, 2) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

function unflattenObject(obj: Record<string, unknown>, delimiter: string): unknown {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split(delimiter);
    let current: Record<string, unknown> = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }
    
    current[keys[keys.length - 1]] = value;
  }
  
  return result;
}

export function sortJsonKeys(input: string, ascending: boolean = true): ToolResult<string> {
  try {
    const obj = JSON.parse(input);
    const sorted = sortObjectKeys(obj, ascending);
    return { success: true, data: JSON.stringify(sorted, null, 2) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

function sortObjectKeys(obj: unknown, ascending: boolean): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeys(item, ascending));
  }
  
  const sortedKeys = Object.keys(obj).sort((a, b) => {
    return ascending ? a.localeCompare(b) : b.localeCompare(a);
  });
  
  const result: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    result[key] = sortObjectKeys((obj as Record<string, unknown>)[key], ascending);
  }
  
  return result;
}

export function jsonDiff(json1: string, json2: string): ToolResult<JsonDiff[]> {
  try {
    const obj1 = JSON.parse(json1);
    const obj2 = JSON.parse(json2);
    const diffs = diffObjects(obj1, obj2, '');
    return { success: true, data: diffs };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}
