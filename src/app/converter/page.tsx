'use client';

import { useState } from 'react';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeftRight,
  Copy,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { copyToClipboard } from '@/lib/utils';
import { useHistory, type ConversionHistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { ShareButton } from '@/components/share/ShareButton';
import {
  jsonToCsv,
  csvToJson,
  xmlToJson,
  jsonToXml,
  yamlToJson,
  jsonToYaml,
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  numberBaseConvert,
  timestampConvert,
  ToolResult,
} from '@/lib/tools/converters';

export default function ConverterPage() {
  const { toast } = useToast();
  const [input, setInput] = useLocalStorage('converter-input', '');
  const [output, setOutput] = useState('');
  const [fromFormat, setFromFormat] = useState('json');
  const [toFormat, setToFormat] = useState('csv');
  const [fromBase, setFromBase] = useState('10');
  const [toBase, setToBase] = useState('16');

  // History
  const conversionHistory = useHistory<ConversionHistoryItem>({ storageKey: 'converter' });

  const dataConversions: Record<string, Record<string, (input: string) => ToolResult<string>>> = {
    json: {
      csv: jsonToCsv,
      xml: jsonToXml,
      yaml: jsonToYaml,
    },
    csv: {
      json: csvToJson,
    },
    xml: {
      json: xmlToJson,
    },
    yaml: {
      json: yamlToJson,
    },
  };

  const addToHistory = (fromFmt: string, toFmt: string, inp: string, out: string) => {
    conversionHistory.addToHistory({
      input: inp.substring(0, 50) + (inp.length > 50 ? '...' : ''),
      output: out.substring(0, 50) + (out.length > 50 ? '...' : ''),
      fromFormat: fromFmt,
      toFormat: toFmt,
    }, `${fromFmt} → ${toFmt}`);
  };

  const handleDataConvert = () => {
    const converter = dataConversions[fromFormat]?.[toFormat];
    if (!converter) {
      toast({
        title: 'Error',
        description: `Cannot convert from ${fromFormat} to ${toFormat}`,
        variant: 'destructive',
      });
      return;
    }

    const result = converter(input);
    if (result.success && result.data) {
      setOutput(result.data);
      addToHistory(fromFormat.toUpperCase(), toFormat.toUpperCase(), input, result.data);
      toast({
        title: 'Converted!',
        description: `${fromFormat.toUpperCase()} converted to ${toFormat.toUpperCase()}.`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleBase64Encode = () => {
    const result = base64Encode(input);
    if (result.success && result.data) {
      setOutput(result.data);
      addToHistory('Text', 'Base64', input, result.data);
      toast({ title: 'Encoded!', description: 'Text encoded to Base64.' });
    }
  };

  const handleBase64Decode = () => {
    const result = base64Decode(input);
    if (result.success && result.data) {
      setOutput(result.data);
      addToHistory('Base64', 'Text', input, result.data);
      toast({ title: 'Decoded!', description: 'Base64 decoded to text.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleUrlEncode = () => {
    const result = urlEncode(input);
    if (result.success && result.data) {
      setOutput(result.data);
      addToHistory('Text', 'URL Encoded', input, result.data);
      toast({ title: 'Encoded!', description: 'URL encoded.' });
    }
  };

  const handleUrlDecode = () => {
    const result = urlDecode(input);
    if (result.success && result.data) {
      setOutput(result.data);
      addToHistory('URL Encoded', 'Text', input, result.data);
      toast({ title: 'Decoded!', description: 'URL decoded.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleNumberConvert = () => {
    const result = numberBaseConvert(input, parseInt(fromBase), parseInt(toBase));
    if (result.success && result.data) {
      setOutput(result.data);
      addToHistory(`Base ${fromBase}`, `Base ${toBase}`, input, result.data);
      toast({ title: 'Converted!', description: `Converted from base ${fromBase} to base ${toBase}.` });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleTimestampConvert = (direction: 'toTimestamp' | 'toDate') => {
    const result = timestampConvert(input, direction);
    if (result.success && result.data) {
      setOutput(result.data);
      addToHistory(direction === 'toTimestamp' ? 'Date' : 'Timestamp', direction === 'toTimestamp' ? 'Timestamp' : 'Date', input, result.data);
      toast({ title: 'Converted!', description: 'Timestamp converted.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    toast({ title: 'Copied!', description: 'Output copied to clipboard.' });
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <ArrowLeftRight className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Data Converter</h1>
            <p className="text-sm text-muted-foreground">
              Convert between different data formats
            </p>
          </div>
        </div>
        <ShareButton
          title="Data Converter - DevTools"
          description="Convert between JSON, CSV, XML, YAML, Base64, and more"
          content={output}
          hashtags={['DevTools', 'Converter', 'Developer']}
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">

      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">Data Formats</TabsTrigger>
          <TabsTrigger value="encoding">Encoding</TabsTrigger>
          <TabsTrigger value="number">Number Base</TabsTrigger>
          <TabsTrigger value="time">Timestamp</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={fromFormat} onValueChange={setFromFormat}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
              </SelectContent>
            </Select>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            <Select value={toFormat} onValueChange={setToFormat}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDataConvert}>Convert</Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleSwap}>
              Swap
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Input ({fromFormat.toUpperCase()})</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={input}
                onChange={setInput}
                language={fromFormat}
                height="calc(100vh - 360px)"
              />
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Output ({toFormat.toUpperCase()})</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={output}
                onChange={setOutput}
                language={toFormat}
                height="calc(100vh - 360px)"
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="encoding" className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleBase64Encode}>
              Base64 Encode
            </Button>
            <Button variant="outline" size="sm" onClick={handleBase64Decode}>
              Base64 Decode
            </Button>
            <Button variant="outline" size="sm" onClick={handleUrlEncode}>
              URL Encode
            </Button>
            <Button variant="outline" size="sm" onClick={handleUrlDecode}>
              URL Decode
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleSwap}>
              Swap
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Input</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={input}
                onChange={setInput}
                language="plaintext"
                height="calc(100vh - 360px)"
              />
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Output</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={output}
                onChange={setOutput}
                language="plaintext"
                height="calc(100vh - 360px)"
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="number" className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={fromBase} onValueChange={setFromBase}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Binary (2)</SelectItem>
                <SelectItem value="8">Octal (8)</SelectItem>
                <SelectItem value="10">Decimal (10)</SelectItem>
                <SelectItem value="16">Hexadecimal (16)</SelectItem>
              </SelectContent>
            </Select>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            <Select value={toBase} onValueChange={setToBase}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Binary (2)</SelectItem>
                <SelectItem value="8">Octal (8)</SelectItem>
                <SelectItem value="10">Decimal (10)</SelectItem>
                <SelectItem value="16">Hexadecimal (16)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleNumberConvert}>Convert</Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Input (Base {fromBase})</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={input}
                onChange={setInput}
                language="plaintext"
                height="calc(100vh - 360px)"
              />
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Output (Base {toBase})</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={output}
                onChange={setOutput}
                language="plaintext"
                height="calc(100vh - 360px)"
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => handleTimestampConvert('toTimestamp')}>
              Date to Timestamp
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleTimestampConvert('toDate')}>
              Timestamp to Date
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInput(Date.now().toString())}>
              Current Timestamp
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInput(new Date().toISOString())}>
              Current ISO Date
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Input</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={input}
                onChange={setInput}
                language="plaintext"
                height="calc(100vh - 360px)"
              />
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Output</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={output}
                onChange={setOutput}
                language="plaintext"
                height="calc(100vh - 360px)"
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-1">
          <HistoryPanel<ConversionHistoryItem>
            history={conversionHistory.history}
            onSelect={(item) => {
              setInput(item.value.input);
              setOutput(item.value.output);
            }}
            onRemove={conversionHistory.removeFromHistory}
            onClear={conversionHistory.clearHistory}
            renderItem={(item) => (
              <div>
                <div className="text-xs font-medium text-primary">
                  {item.value.fromFormat} → {item.value.toFormat}
                </div>
                <div className="font-mono text-xs truncate text-muted-foreground mt-1">
                  {item.value.input}
                </div>
              </div>
            )}
            renderPreview={(item) => item.value.output}
            title="Conversion History"
            emptyMessage="Your conversions will appear here"
          />
        </div>
      </div>
    </div>
  );
}
