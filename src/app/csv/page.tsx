'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  Copy,
  Trash2,
  ArrowRight,
  Download,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard, downloadFile } from '@/lib/utils';

export default function CsvPage() {
  const { toast } = useToast();
  const [csvInput, setCsvInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const csvToJson = () => {
    try {
      const lines = csvInput.trim().split('\n');
      if (lines.length === 0) {
        throw new Error('Empty CSV');
      }

      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = parseCSVLine(lines[i], delimiter);
        const obj: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        
        result.push(obj);
      }

      setJsonOutput(JSON.stringify(result, null, 2));
      toast({ title: 'Converted!', description: 'CSV converted to JSON.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to convert CSV',
        variant: 'destructive',
      });
    }
  };

  const jsonToCsv = () => {
    try {
      const data = JSON.parse(jsonInput);
      
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects');
      }

      if (data.length === 0) {
        throw new Error('JSON array is empty');
      }

      const headers = Object.keys(data[0]);
      const lines: string[] = [];

      if (includeHeaders) {
        lines.push(headers.map(h => escapeCSVValue(h, delimiter)).join(delimiter));
      }

      data.forEach(item => {
        const values = headers.map(header => escapeCSVValue(String(item[header] ?? ''), delimiter));
        lines.push(values.join(delimiter));
      });

      setCsvOutput(lines.join('\n'));
      toast({ title: 'Converted!', description: 'JSON converted to CSV.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to convert JSON',
        variant: 'destructive',
      });
    }
  };

  const parseCSVLine = (line: string, delim: string): string[] => {
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
      } else if (char === delim && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const escapeCSVValue = (value: string, delim: string): string => {
    if (value.includes('"') || value.includes(delim) || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
  };

  const handleDownloadCsv = () => {
    downloadFile(csvOutput, 'data.csv', 'text/csv');
    toast({ title: 'Downloaded!', description: 'CSV file downloaded.' });
  };

  const handleDownloadJson = () => {
    downloadFile(jsonOutput, 'data.json', 'application/json');
    toast({ title: 'Downloaded!', description: 'JSON file downloaded.' });
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <Table className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">CSV ↔ JSON Converter</h1>
          <p className="text-sm text-muted-foreground">
            Convert between CSV and JSON formats
          </p>
        </div>
      </div>

      {/* Options */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Delimiter:</Label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="csv-to-json" className="space-y-4">
        <TabsList>
          <TabsTrigger value="csv-to-json">CSV → JSON</TabsTrigger>
          <TabsTrigger value="json-to-csv">JSON → CSV</TabsTrigger>
        </TabsList>

        <TabsContent value="csv-to-json" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>CSV Input</Label>
                <Button variant="outline" size="sm" onClick={() => setCsvInput('')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="name,email,age
John,john@example.com,25
Jane,jane@example.com,30"
                className="min-h-[300px] font-mono text-sm"
              />
              <Button onClick={csvToJson} className="w-full mt-4">
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
                    onClick={handleDownloadJson}
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

        <TabsContent value="json-to-csv" className="space-y-4">
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
                placeholder='[
  {"name": "John", "email": "john@example.com", "age": 25},
  {"name": "Jane", "email": "jane@example.com", "age": 30}
]'
                className="min-h-[300px] font-mono text-sm"
              />
              <Button onClick={jsonToCsv} className="w-full mt-4">
                <ArrowRight className="h-4 w-4 mr-2" />
                Convert to CSV
              </Button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>CSV Output</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(csvOutput)}
                    disabled={!csvOutput}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCsv}
                    disabled={!csvOutput}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={csvOutput}
                readOnly
                placeholder="CSV output will appear here..."
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
