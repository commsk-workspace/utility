'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Binary,
  Copy,
  ArrowDown,
  ArrowUp,
  Trash2,
  Upload,
  Download,
  FileImage,
  FileText,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard, downloadFile } from '@/lib/utils';
import { useHistory, type Base64HistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';

export default function Base64Page() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // History
  const base64History = useHistory<Base64HistoryItem>({ storageKey: 'base64' });

  const handleEncode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
      base64History.addToHistory({ input, output: encoded, mode: 'encode' });
      toast({ title: 'Encoded!', description: 'Text encoded to Base64.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to encode text',
        variant: 'destructive',
      });
    }
  };

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
      base64History.addToHistory({ input, output: decoded, mode: 'decode' });
      toast({ title: 'Decoded!', description: 'Base64 decoded to text.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid Base64 string',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      setOutput(base64);
      setFilePreview(e.target?.result as string);
      toast({ title: 'File encoded!', description: `${file.name} converted to Base64.` });
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    toast({ title: 'Copied!', description: 'Output copied to clipboard.' });
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setFilePreview(null);
  };

  const handleSwap = () => {
    setInput(output);
    setOutput('');
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-orange-500/10">
          <Binary className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Base64 Encoder/Decoder</h1>
          <p className="text-sm text-muted-foreground">
            Encode text or files to Base64 and decode Base64 strings
          </p>
        </div>
      </div>

      <Tabs defaultValue="text" className="space-y-4">
        <TabsList>
          <TabsTrigger value="text" className="gap-2">
            <FileText className="h-4 w-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="file" className="gap-2">
            <FileImage className="h-4 w-4" />
            File/Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Input</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSwap}>
                    <ArrowDown className="h-4 w-4 mr-1" />
                    Swap
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to encode or Base64 to decode..."
                className="min-h-[300px] font-mono text-sm"
              />
            </Card>

            {/* Output */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Output</Label>
                <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Output will appear here..."
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleEncode} className="gap-2">
              <ArrowUp className="h-4 w-4" />
              Encode to Base64
            </Button>
            <Button onClick={handleDecode} variant="secondary" className="gap-2">
              <ArrowDown className="h-4 w-4" />
              Decode from Base64
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* File Upload */}
            <Card className="p-4">
              <Label className="mb-2 block">Upload File</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Any file type supported
                  </p>
                </label>
              </div>
              {filePreview && filePreview.startsWith('data:image') && (
                <div className="mt-4">
                  <Label className="mb-2 block">Preview</Label>
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-[200px] rounded-lg mx-auto"
                  />
                </div>
              )}
            </Card>

            {/* Base64 Output */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Base64 Output</Label>
                <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Base64 output will appear here..."
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
            <HistoryPanel<Base64HistoryItem>
              history={base64History.history}
              onSelect={(item) => {
                setInput(item.value.input);
                setOutput(item.value.output);
                setMode(item.value.mode);
              }}
              onRemove={(id) => base64History.removeFromHistory(id)}
              onClear={() => base64History.clearHistory()}
              renderItem={(item) => (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">{item.value.mode === 'encode' ? 'Encode' : 'Decode'}</span>
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
