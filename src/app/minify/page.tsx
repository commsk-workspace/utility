'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Minimize2,
  Copy,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

type CodeType = 'html' | 'css' | 'javascript';

export default function MinifyPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [codeType, setCodeType] = useState<CodeType>('html');

  const minifyHtml = (code: string): string => {
    return code
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove whitespace between tags
      .replace(/>\s+</g, '><')
      // Remove leading/trailing whitespace
      .replace(/^\s+|\s+$/gm, '')
      // Collapse multiple spaces
      .replace(/\s{2,}/g, ' ')
      // Remove newlines
      .replace(/\n/g, '')
      .trim();
  };

  const minifyCss = (code: string): string => {
    return code
      // Remove CSS comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove whitespace around special characters
      .replace(/\s*([{}:;,>~+])\s*/g, '$1')
      // Remove last semicolon before closing brace
      .replace(/;}/g, '}')
      // Remove newlines and multiple spaces
      .replace(/\s+/g, ' ')
      // Remove spaces around colons in pseudo-selectors
      .replace(/:\s+/g, ':')
      .trim();
  };

  const minifyJs = (code: string): string => {
    // Simple JS minification (for basic use cases)
    // For production, use a proper minifier like terser
    return code
      // Remove single-line comments (but not URLs)
      .replace(/(?<!:)\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove leading/trailing whitespace per line
      .replace(/^\s+|\s+$/gm, '')
      // Collapse multiple newlines
      .replace(/\n+/g, '\n')
      // Remove newlines (basic - doesn't handle all cases)
      .replace(/\n/g, '')
      // Collapse multiple spaces
      .replace(/\s{2,}/g, ' ')
      // Remove spaces around operators (basic)
      .replace(/\s*([=+\-*/<>!&|,;{}()[\]])\s*/g, '$1')
      .trim();
  };

  const handleMinify = () => {
    try {
      let minified = '';
      
      switch (codeType) {
        case 'html':
          minified = minifyHtml(input);
          break;
        case 'css':
          minified = minifyCss(input);
          break;
        case 'javascript':
          minified = minifyJs(input);
          break;
      }
      
      setOutput(minified);
      
      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
      
      toast({
        title: 'Minified!',
        description: `Reduced by ${savings}% (${originalSize} → ${minifiedSize} bytes)`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to minify code',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    toast({ title: 'Copied!', description: 'Minified code copied to clipboard.' });
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const getStats = () => {
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([output]).size;
    const savings = originalSize > 0 ? ((1 - minifiedSize / originalSize) * 100).toFixed(1) : '0';
    return { originalSize, minifiedSize, savings };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-teal-500/10">
          <Minimize2 className="h-6 w-6 text-teal-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Code Minifier</h1>
          <p className="text-sm text-muted-foreground">
            Minify HTML, CSS, and JavaScript code
          </p>
        </div>
      </div>

      {/* Code Type Selector */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={codeType === 'html' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCodeType('html')}
            >
              HTML
            </Button>
            <Button
              variant={codeType === 'css' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCodeType('css')}
            >
              CSS
            </Button>
            <Button
              variant={codeType === 'javascript' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCodeType('javascript')}
            >
              JavaScript
            </Button>
          </div>
          
          {output && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.originalSize}B</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="default">{stats.minifiedSize}B</Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                -{stats.savings}%
              </Badge>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Input ({codeType.toUpperCase()})</Label>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${codeType.toUpperCase()} code here...`}
            className="min-h-[400px] font-mono text-sm"
          />
          <Button onClick={handleMinify} className="w-full mt-4" disabled={!input}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Minify
          </Button>
        </Card>

        {/* Output */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Minified Output</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!output}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Minified code will appear here..."
            className="min-h-[400px] font-mono text-sm bg-muted"
          />
        </Card>
      </div>
    </div>
  );
}
