// Data Converter Utility Functions
import yaml from 'js-yaml';
import { parseString, Builder } from 'xml2js';

export interface ToolResult<T = string> {
  success: boolean;
  data?: T;
  error?: string;
}

// CSV to JSON
export function csvToJson(csv: string): ToolResult<string> {
  try {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      return { success: true, data: '[]' };
    }
    
    const headers = parseCSVLine(lines[0]);
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const obj: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim() || '';
      });
      
      result.push(obj);
    }
    
    return { success: true, data: JSON.stringify(result, null, 2) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'CSV parsing failed' };
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// JSON to CSV
export function jsonToCsv(json: string): ToolResult<string> {
  try {
    const data = JSON.parse(json);
    
    if (!Array.isArray(data)) {
      return { success: false, error: 'JSON must be an array of objects' };
    }
    
    if (data.length === 0) {
      return { success: true, data: '' };
    }
    
    const keys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
    const header = keys.map(key => `"${key}"`).join(',');
    
    const rows = data.map(obj => {
      return keys.map(key => {
        const value = obj[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return String(value);
      }).join(',');
    });
    
    return { success: true, data: [header, ...rows].join('\n') };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'JSON parsing failed' };
  }
}

// JSON to YAML
export function jsonToYaml(json: string): ToolResult<string> {
  try {
    const data = JSON.parse(json);
    const result = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'JSON to YAML failed' };
  }
}

// YAML to JSON
export function yamlToJson(yamlStr: string): ToolResult<string> {
  try {
    const data = yaml.load(yamlStr);
    return { success: true, data: JSON.stringify(data, null, 2) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'YAML parsing failed' };
  }
}

// JSON to XML
export function jsonToXml(json: string): ToolResult<string> {
  try {
    const data = JSON.parse(json);
    const builder = new Builder({
      rootName: 'root',
      headless: false,
      renderOpts: { pretty: true, indent: '  ', newline: '\n' },
    });
    return { success: true, data: builder.buildObject(data) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'JSON to XML failed' };
  }
}

// XML to JSON
export function xmlToJson(xml: string): ToolResult<string> {
  try {
    let result: string | null = null;
    let parseError: Error | null = null;
    
    parseString(xml, { explicitArray: false, trim: true }, (err, parsed) => {
      if (err) {
        parseError = err;
      } else {
        result = JSON.stringify(parsed, null, 2);
      }
    });
    
    if (parseError) {
      return { success: false, error: 'Invalid XML' };
    }
    
    return { success: true, data: result || '' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'XML parsing failed' };
  }
}

// Base64 Encode
export function base64Encode(text: string): ToolResult<string> {
  try {
    let result: string;
    if (typeof window !== 'undefined') {
      result = btoa(unescape(encodeURIComponent(text)));
    } else {
      result = Buffer.from(text, 'utf-8').toString('base64');
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Base64 encoding failed' };
  }
}

// Base64 Decode
export function base64Decode(encoded: string): ToolResult<string> {
  try {
    let result: string;
    if (typeof window !== 'undefined') {
      result = decodeURIComponent(escape(atob(encoded)));
    } else {
      result = Buffer.from(encoded, 'base64').toString('utf-8');
    }
    return { success: true, data: result };
  } catch {
    return { success: false, error: 'Invalid Base64 string' };
  }
}

// URL Encode
export function urlEncode(text: string): ToolResult<string> {
  try {
    return { success: true, data: encodeURIComponent(text) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'URL encoding failed' };
  }
}

// URL Decode
export function urlDecode(encoded: string): ToolResult<string> {
  try {
    return { success: true, data: decodeURIComponent(encoded) };
  } catch {
    return { success: false, error: 'Invalid URL encoded string' };
  }
}

// Number Base Convert
export function numberBaseConvert(value: string, fromBase: number, toBase: number): ToolResult<string> {
  try {
    const decimal = parseInt(value, fromBase);
    if (isNaN(decimal)) {
      return { success: false, error: `Invalid number for base ${fromBase}` };
    }
    return { success: true, data: decimal.toString(toBase).toUpperCase() };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Base conversion failed' };
  }
}

// Timestamp Convert
export function timestampConvert(value: string, direction: 'toTimestamp' | 'toDate'): ToolResult<string> {
  try {
    if (direction === 'toTimestamp') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { success: false, error: 'Invalid date format' };
      }
      return { success: true, data: Math.floor(date.getTime() / 1000).toString() };
    } else {
      const timestamp = parseInt(value);
      if (isNaN(timestamp)) {
        return { success: false, error: 'Invalid timestamp' };
      }
      const date = new Date(timestamp * 1000);
      return { success: true, data: date.toISOString() };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Timestamp conversion failed' };
  }
}

// HTML Encode
export function htmlEncode(text: string): string {
  const element = typeof document !== 'undefined' 
    ? document.createElement('div')
    : null;
  
  if (element) {
    element.textContent = text;
    return element.innerHTML;
  }
  
  // Fallback for server-side
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// HTML Decode
export function htmlDecode(html: string): string {
  const element = typeof document !== 'undefined'
    ? document.createElement('div')
    : null;
  
  if (element) {
    element.innerHTML = html;
    return element.textContent || '';
  }
  
  // Fallback for server-side
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

export type ConversionType = 
  | 'json-csv'
  | 'csv-json'
  | 'json-yaml'
  | 'yaml-json'
  | 'json-xml'
  | 'xml-json'
  | 'base64-encode'
  | 'base64-decode'
  | 'url-encode'
  | 'url-decode'
  | 'html-encode'
  | 'html-decode';

export const conversionTypes: { value: ConversionType; label: string; from: string; to: string }[] = [
  { value: 'json-csv', label: 'JSON to CSV', from: 'JSON', to: 'CSV' },
  { value: 'csv-json', label: 'CSV to JSON', from: 'CSV', to: 'JSON' },
  { value: 'json-yaml', label: 'JSON to YAML', from: 'JSON', to: 'YAML' },
  { value: 'yaml-json', label: 'YAML to JSON', from: 'YAML', to: 'JSON' },
  { value: 'json-xml', label: 'JSON to XML', from: 'JSON', to: 'XML' },
  { value: 'xml-json', label: 'XML to JSON', from: 'XML', to: 'JSON' },
  { value: 'base64-encode', label: 'Base64 Encode', from: 'Text', to: 'Base64' },
  { value: 'base64-decode', label: 'Base64 Decode', from: 'Base64', to: 'Text' },
  { value: 'url-encode', label: 'URL Encode', from: 'Text', to: 'URL Encoded' },
  { value: 'url-decode', label: 'URL Decode', from: 'URL Encoded', to: 'Text' },
  { value: 'html-encode', label: 'HTML Encode', from: 'Text', to: 'HTML Entities' },
  { value: 'html-decode', label: 'HTML Decode', from: 'HTML Entities', to: 'Text' },
];

export async function convert(input: string, type: ConversionType): Promise<ToolResult<string>> {
  switch (type) {
    case 'json-csv':
      return jsonToCsv(input);
    case 'csv-json':
      return csvToJson(input);
    case 'json-yaml':
      return jsonToYaml(input);
    case 'yaml-json':
      return yamlToJson(input);
    case 'json-xml':
      return jsonToXml(input);
    case 'xml-json':
      return xmlToJson(input);
    case 'base64-encode':
      return base64Encode(input);
    case 'base64-decode':
      return base64Decode(input);
    case 'url-encode':
      return urlEncode(input);
    case 'url-decode':
      return urlDecode(input);
    case 'html-encode':
      return { success: true, data: htmlEncode(input) };
    case 'html-decode':
      return { success: true, data: htmlDecode(input) };
    default:
      return { success: false, error: 'Unknown conversion type' };
  }
}
