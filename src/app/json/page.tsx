'use client';

import { useState } from 'react';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Braces,
  Copy,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeftRight,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { copyToClipboard, downloadFile } from '@/lib/utils';
import { useHistory, type JsonHistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { ShareButton } from '@/components/share/ShareButton';
import {
  formatJson,
  minifyJson,
  validateJson,
  jsonToTypeScript,
  jsonDiff,
  jsonToYaml,
  flattenJson,
  unflattenJson,
  sortJsonKeys,
} from '@/lib/tools/json-tools';

const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Bangkok",
    "country": "Thailand"
  },
  "hobbies": ["coding", "reading", "gaming"]
}`;

export default function JsonPage() {
  const { toast } = useToast();
  const [json, setJson] = useLocalStorage('json-code', sampleJson);
  const [json2, setJson2] = useLocalStorage('json-code-2', '{}');
  const [output, setOutput] = useState('');
  const [validation, setValidation] = useState<{ valid: boolean; error?: string } | null>(null);

  // History
  const jsonHistory = useHistory<JsonHistoryItem>({ storageKey: 'json' });

  const addToJsonHistory = (action: string, input: string, output: string) => {
    jsonHistory.addToHistory({
      input: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
      output: output.substring(0, 100) + (output.length > 100 ? '...' : ''),
      action,
    }, action);
  };

  const handleValidate = () => {
    const result = validateJson(json);
    setValidation(result);
    if (result.valid) {
      toast({
        title: 'Valid JSON',
        description: 'The JSON is valid.',
      });
    } else {
      toast({
        title: 'Invalid JSON',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleFormat = () => {
    const result = formatJson(json);
    if (result.success && result.data) {
      setJson(result.data);
      addToJsonHistory('Format', json, result.data);
      toast({
        title: 'Formatted!',
        description: 'JSON has been formatted.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleMinify = () => {
    const result = minifyJson(json);
    if (result.success && result.data) {
      setJson(result.data);
      addToJsonHistory('Minify', json, result.data);
      toast({
        title: 'Minified!',
        description: 'JSON has been minified.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleToTypeScript = () => {
    const result = jsonToTypeScript(json);
    if (result.success && result.data) {
      setOutput(result.data);
      addToJsonHistory('To TypeScript', json, result.data);
      toast({
        title: 'Converted!',
        description: 'JSON converted to TypeScript interface.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleToYaml = () => {
    const result = jsonToYaml(json);
    if (result.success && result.data) {
      setOutput(result.data);
      addToJsonHistory('To YAML', json, result.data);
      toast({
        title: 'Converted!',
        description: 'JSON converted to YAML.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleFlatten = () => {
    const result = flattenJson(json);
    if (result.success && result.data) {
      setOutput(result.data);
      addToJsonHistory('Flatten', json, result.data);
      toast({
        title: 'Flattened!',
        description: 'JSON has been flattened.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleSort = () => {
    const result = sortJsonKeys(json);
    if (result.success && result.data) {
      setJson(result.data);
      addToJsonHistory('Sort Keys', json, result.data);
      toast({
        title: 'Sorted!',
        description: 'JSON keys have been sorted alphabetically.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleDiff = () => {
    const result = jsonDiff(json, json2);
    if (result.success && result.data) {
      setOutput(JSON.stringify(result.data, null, 2));
      addToJsonHistory('Diff', json, JSON.stringify(result.data, null, 2));
      toast({
        title: 'Compared!',
        description: 'JSON diff generated.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({
      title: 'Copied!',
      description: 'Copied to clipboard.',
    });
  };

  const handleClear = () => {
    setJson('');
    setOutput('');
    setValidation(null);
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Braces className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">JSON Tools</h1>
            <p className="text-sm text-muted-foreground">
              Format, validate, convert, and compare JSON
            </p>
          </div>
        </div>
        <ShareButton
          title="JSON Tools - DevTools"
          description="Format, validate, convert, and compare JSON"
          content={json}
          hashtags={['DevTools', 'JSON', 'Developer']}
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
      <Tabs defaultValue="format" className="space-y-4">
        <TabsList>
          <TabsTrigger value="format">Format & Validate</TabsTrigger>
          <TabsTrigger value="convert">Convert</TabsTrigger>
          <TabsTrigger value="diff">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleValidate}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button variant="outline" size="sm" onClick={handleFormat}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Format
            </Button>
            <Button variant="outline" size="sm" onClick={handleMinify}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Minify
            </Button>
            <Button variant="outline" size="sm" onClick={handleSort}>
              Sort Keys
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => handleCopy(json)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Validation Status */}
          {validation && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              validation.valid ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {validation.valid ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Valid JSON</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>{validation.error}</span>
                </>
              )}
            </div>
          )}

          {/* Editor */}
          <Card className="overflow-hidden">
            <MonacoEditor
              value={json}
              onChange={setJson}
              language="json"
              height="calc(100vh - 380px)"
            />
          </Card>
        </TabsContent>

        <TabsContent value="convert" className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleToTypeScript}>
              To TypeScript
            </Button>
            <Button variant="outline" size="sm" onClick={handleToYaml}>
              To YAML
            </Button>
            <Button variant="outline" size="sm" onClick={handleFlatten}>
              Flatten
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => handleCopy(output)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Output
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Input JSON</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={json}
                onChange={setJson}
                language="json"
                height="calc(100vh - 400px)"
              />
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Output</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={output}
                onChange={setOutput}
                language="typescript"
                height="calc(100vh - 400px)"
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diff" className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <Button onClick={handleDiff}>
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Compare
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => handleCopy(output)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Diff
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">JSON 1</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={json}
                onChange={setJson}
                language="json"
                height="300px"
              />
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">JSON 2</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={json2}
                onChange={setJson2}
                language="json"
                height="300px"
              />
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="py-2 px-4 border-b">
              <CardTitle className="text-sm">Diff Result</CardTitle>
            </CardHeader>
            <MonacoEditor
              value={output}
              onChange={setOutput}
              language="json"
              height="300px"
            />
          </Card>
        </TabsContent>
      </Tabs>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-1">
          <HistoryPanel<JsonHistoryItem>
            history={jsonHistory.history}
            onSelect={(item) => {
              // Try to restore original input
            }}
            onRemove={jsonHistory.removeFromHistory}
            onClear={jsonHistory.clearHistory}
            renderItem={(item) => (
              <div>
                <div className="text-xs font-medium text-primary">{item.value.action}</div>
                <div className="font-mono text-xs truncate text-muted-foreground mt-1">
                  {item.value.input}
                </div>
              </div>
            )}
            renderPreview={(item) => item.value.output}
            title="JSON History"
            emptyMessage="Your JSON operations will appear here"
          />
        </div>
      </div>
    </div>
  );
}
