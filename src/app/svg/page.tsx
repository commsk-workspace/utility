'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Sparkles,
  Copy,
  Trash2,
  ArrowRight,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard, downloadFile } from '@/lib/utils';

// [system] Sanitize SVG to prevent XSS via event handlers and script tags
function sanitizeSvg(svg: string): string {
  // Remove all event handler attributes (on*)
  let clean = svg.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
  // Remove <script> tags and their content
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<script[^>]*\/>/gi, '');
  // Remove javascript: URIs in href/xlink:href/src attributes
  clean = clean.replace(/(href|src)\s*=\s*["']?\s*javascript:[^"'>]*/gi, '$1=""');
  // Remove <foreignObject> (can embed arbitrary HTML)
  clean = clean.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
  clean = clean.replace(/<foreignObject[^>]*\/>/gi, '');
  // Remove data: URIs in href (potential XSS vector)
  clean = clean.replace(/(href)\s*=\s*["']?\s*data:[^"'>]*/gi, '$1=""');
  return clean;
}

export default function SvgPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState({
    removeComments: true,
    removeMetadata: true,
    removeEmptyAttrs: true,
    removeUselessDefs: true,
    collapseGroups: true,
    removeWhitespace: true,
    removeXmlDeclaration: true,
    shortenIds: false,
  });

  const optimize = () => {
    try {
      let svg = input;

      // Remove XML declaration
      if (options.removeXmlDeclaration) {
        svg = svg.replace(/<\?xml[^?]*\?>/gi, '');
      }

      // Remove comments
      if (options.removeComments) {
        svg = svg.replace(/<!--[\s\S]*?-->/g, '');
      }

      // Remove metadata
      if (options.removeMetadata) {
        svg = svg.replace(/<metadata[^>]*>[\s\S]*?<\/metadata>/gi, '');
        svg = svg.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
        svg = svg.replace(/<desc[^>]*>[\s\S]*?<\/desc>/gi, '');
      }

      // Remove empty attributes
      if (options.removeEmptyAttrs) {
        svg = svg.replace(/\s+[a-zA-Z-]+=""/g, '');
      }

      // Remove useless defs
      if (options.removeUselessDefs) {
        svg = svg.replace(/<defs>\s*<\/defs>/gi, '');
      }

      // Collapse empty groups
      if (options.collapseGroups) {
        svg = svg.replace(/<g>\s*<\/g>/gi, '');
        svg = svg.replace(/<g\s*\/>/gi, '');
      }

      // Remove whitespace between tags
      if (options.removeWhitespace) {
        svg = svg.replace(/>\s+</g, '><');
        svg = svg.replace(/\n/g, '');
        svg = svg.replace(/\s{2,}/g, ' ');
      }

      // Remove unnecessary attributes
      svg = svg.replace(/\s*xmlns:xlink="[^"]*"/g, '');
      svg = svg.replace(/\s*xml:space="[^"]*"/g, '');
      
      // Clean up extra spaces in tags
      svg = svg.replace(/\s+>/g, '>');
      svg = svg.replace(/\s+\/>/g, '/>');

      setOutput(svg.trim());

      const originalSize = new Blob([input]).size;
      const optimizedSize = new Blob([svg]).size;
      const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

      toast({
        title: 'Optimized!',
        description: `Reduced by ${savings}% (${originalSize} → ${optimizedSize} bytes)`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to optimize SVG',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(output);
    toast({ title: 'Copied!', description: 'SVG copied to clipboard.' });
  };

  const handleDownload = () => {
    downloadFile(output, 'optimized.svg', 'image/svg+xml');
    toast({ title: 'Downloaded!', description: 'SVG file downloaded.' });
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const getStats = () => {
    const originalSize = new Blob([input]).size;
    const optimizedSize = new Blob([output]).size;
    const savings = originalSize > 0 ? ((1 - optimizedSize / originalSize) * 100).toFixed(1) : '0';
    return { originalSize, optimizedSize, savings };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-fuchsia-500/10">
          <Sparkles className="h-6 w-6 text-fuchsia-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">SVG Optimizer</h1>
          <p className="text-sm text-muted-foreground">
            Optimize and minify SVG files
          </p>
        </div>
      </div>

      {/* Options */}
      <Card className="p-4 mb-4">
        <Label className="mb-3 block">Optimization Options</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(options).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Switch
                checked={value}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, [key]: checked })
                }
              />
              <Label className="font-normal text-sm">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats */}
      {output && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary">{stats.originalSize}B</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default">{stats.optimizedSize}B</Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              -{stats.savings}%
            </Badge>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Input SVG</Label>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SVG code here..."
            className="min-h-[350px] font-mono text-sm"
          />
          <Button onClick={optimize} className="w-full mt-4" disabled={!input}>
            <Sparkles className="h-4 w-4 mr-2" />
            Optimize SVG
          </Button>
        </Card>

        {/* Output */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Optimized SVG</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!output}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!output}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Optimized SVG will appear here..."
            className="min-h-[350px] font-mono text-sm bg-muted"
          />

          {/* Preview */}
          {output && (
            <div className="mt-4">
              <Label className="mb-2 block">Preview</Label>
              <div
                className="border rounded-lg p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3QgZmlsbD0iI2ZmZiIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iI2ZmZiIgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48cmVjdCBmaWxsPSIjY2NjIiB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iI2NjYyIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjwvc3ZnPg==')]"
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(output) }}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
