'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileJson,
  Copy,
  Trash2,
  ArrowRight,
  Download,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard, downloadFile } from '@/lib/utils';
import { useHistory, type YamlHistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';

export default function YamlPage() {
  const { toast } = useToast();
  const [yamlInput, setYamlInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [yamlOutput, setYamlOutput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [showHistory, setShowHistory] = useState(false);

  // History
  const yamlHistory = useHistory<YamlHistoryItem>({ storageKey: 'yaml' });

  // Simple YAML parser (handles common cases)
  const parseYaml = (yaml: string): unknown => {
    const lines = yaml.split('\n');
    const result: Record<string, unknown> = {};
    const stack: { indent: number; obj: Record<string, unknown>; key?: string }[] = [{ indent: -1, obj: result }];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = line.search(/\S/);
      const colonIndex = trimmed.indexOf(':');
      
      if (colonIndex === -1) continue;

      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();

      // Handle arrays
      if (key.startsWith('-')) {
        const arrayKey = key.substring(1).trim();
        const parent = stack[stack.length - 1];
        if (!Array.isArray(parent.obj[parent.key || ''])) {
          parent.obj[parent.key || ''] = [];
        }
        (parent.obj[parent.key || ''] as unknown[]).push(value || {});
        continue;
      }

      // Pop stack to correct level
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];

      // Parse value
      if (value === '') {
        // Nested object
        const newObj: Record<string, unknown> = {};
        parent.obj[key] = newObj;
        stack.push({ indent, obj: parent.obj, key });
      } else if (value === 'true' || value === 'false') {
        parent.obj[key] = value === 'true';
      } else if (value === 'null') {
        parent.obj[key] = null;
      } else if (!isNaN(Number(value))) {
        parent.obj[key] = Number(value);
      } else {
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        parent.obj[key] = value;
      }
    }

    return result;
  };

  // Simple JSON to YAML converter
  const jsonToYamlString = (obj: unknown, currentIndent = 0): string => {
    const indentStr = ' '.repeat(indent);
    
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj ? 'true' : 'false';
    if (typeof obj === 'number') return String(obj);
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
        return `"${obj.replace(/"/g, '\\"')}"`;
      }
      return obj;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => {
        const itemStr = jsonToYamlString(item, currentIndent + 1);
        if (typeof item === 'object' && item !== null) {
          return `${indentStr.repeat(currentIndent)}- ${itemStr.trim()}`;
        }
        return `${indentStr.repeat(currentIndent)}- ${itemStr}`;
      }).join('\n');
    }
    
    if (typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '{}';
      return entries.map(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
          return `${indentStr.repeat(currentIndent)}${key}:\n${jsonToYamlString(value, currentIndent + 1)}`;
        } else if (Array.isArray(value)) {
          return `${indentStr.repeat(currentIndent)}${key}:\n${jsonToYamlString(value, currentIndent + 1)}`;
        }
        return `${indentStr.repeat(currentIndent)}${key}: ${jsonToYamlString(value, currentIndent)}`;
      }).join('\n');
    }
    
    return String(obj);
  };

  const yamlToJson = () => {
    try {
      const parsed = parseYaml(yamlInput);
      const jsonStr = JSON.stringify(parsed, null, indent);
      setJsonOutput(jsonStr);
      yamlHistory.addToHistory({ input: yamlInput, output: jsonStr, type: 'yaml-to-json' });
      toast({ title: 'Converted!', description: 'YAML converted to JSON.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to parse YAML',
        variant: 'destructive',
      });
    }
  };

  const jsonToYaml = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const yamlStr = jsonToYamlString(parsed);
      setYamlOutput(yamlStr);
      yamlHistory.addToHistory({ input: jsonInput, output: yamlStr, type: 'json-to-yaml' });
      toast({ title: 'Converted!', description: 'JSON converted to YAML.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to parse JSON',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-rose-500/10">
          <FileJson className="h-6 w-6 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">YAML ↔ JSON Converter</h1>
          <p className="text-sm text-muted-foreground">
            Convert between YAML and JSON formats
          </p>
        </div>
      </div>

      {/* Options */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-4">
          <Label className="text-sm">Indent:</Label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
      </Card>

      <Tabs defaultValue="yaml-to-json" className="space-y-4">
        <TabsList>
          <TabsTrigger value="yaml-to-json">YAML → JSON</TabsTrigger>
          <TabsTrigger value="json-to-yaml">JSON → YAML</TabsTrigger>
        </TabsList>

        <TabsContent value="yaml-to-json" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>YAML Input</Label>
                <Button variant="outline" size="sm" onClick={() => setYamlInput('')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                placeholder="name: John Doe
age: 30
address:
  city: New York
  country: USA
hobbies:
  - reading
  - gaming"
                className="min-h-[300px] font-mono text-sm"
              />
              <Button onClick={yamlToJson} className="w-full mt-4">
                <ArrowRight className="h-4 w-4 mr-2" />
                Convert to JSON
              </Button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>JSON Output</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(jsonOutput)}
                    disabled={!jsonOutput}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(jsonOutput, 'data.json', 'application/json')}
                    disabled={!jsonOutput}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={jsonOutput}
                readOnly
                placeholder="JSON output will appear here..."
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="json-to-yaml" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>JSON Input</Label>
                <Button variant="outline" size="sm" onClick={() => setJsonInput('')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{
  "name": "John Doe",
  "age": 30,
  "address": {
    "city": "New York",
    "country": "USA"
  }
}'
                className="min-h-[300px] font-mono text-sm"
              />
              <Button onClick={jsonToYaml} className="w-full mt-4">
                <ArrowRight className="h-4 w-4 mr-2" />
                Convert to YAML
              </Button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>YAML Output</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(yamlOutput)}
                    disabled={!yamlOutput}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(yamlOutput, 'data.yaml', 'text/yaml')}
                    disabled={!yamlOutput}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={yamlOutput}
                readOnly
                placeholder="YAML output will appear here..."
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* History FAB & Panel */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {showHistory && (
          <div className="w-80 mb-2">
            <HistoryPanel<YamlHistoryItem>
              history={yamlHistory.history}
              onSelect={(item) => {
                if (item.value.type === 'yaml-to-json') {
                  setYamlInput(item.value.input);
                  setJsonOutput(item.value.output);
                } else {
                  setJsonInput(item.value.input);
                  setYamlOutput(item.value.output);
                }
              }}
              onRemove={(id) => yamlHistory.removeFromHistory(id)}
              onClear={() => yamlHistory.clearHistory()}
              renderItem={(item) => (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">{item.value.type === 'yaml-to-json' ? 'YAML → JSON' : 'JSON → YAML'}</span>
                  <code className="text-xs text-muted-foreground truncate">{item.value.input.substring(0, 30)}...</code>
                </div>
              )}
              renderPreview={(item) => item.value.output}
            />
          </div>
        )}
        
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowHistory(!showHistory)}
          title={showHistory ? 'Hide History' : 'Show History'}
        >
          <History className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
