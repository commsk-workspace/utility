'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Link2,
  Copy,
  Trash2,
  Plus,
  X,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

interface QueryParam {
  key: string;
  value: string;
}

interface ParsedUrl {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
}

export default function UrlPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: '', value: '' }]);
  const [encodeInput, setEncodeInput] = useState('');
  const [encodeOutput, setEncodeOutput] = useState('');

  // Builder state
  const [protocol, setProtocol] = useState('https');
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState('');
  const [pathname, setPathname] = useState('');
  const [hash, setHash] = useState('');
  const [builtUrl, setBuiltUrl] = useState('');

  const parseUrl = () => {
    try {
      const parsed = new URL(url);
      setParsedUrl({
        protocol: parsed.protocol,
        host: parsed.host,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        origin: parsed.origin,
      });
      
      // Parse query params
      const params: QueryParam[] = [];
      parsed.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });
      if (params.length === 0) {
        params.push({ key: '', value: '' });
      }
      setQueryParams(params);
      
      toast({ title: 'Parsed!', description: 'URL parsed successfully.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid URL format',
        variant: 'destructive',
      });
    }
  };

  const buildUrl = () => {
    try {
      let builtUrlString = `${protocol}://${hostname}`;
      if (port) builtUrlString += `:${port}`;
      if (pathname) builtUrlString += pathname.startsWith('/') ? pathname : `/${pathname}`;
      
      const validParams = queryParams.filter(p => p.key);
      if (validParams.length > 0) {
        const searchParams = new URLSearchParams();
        validParams.forEach(p => searchParams.append(p.key, p.value));
        builtUrlString += `?${searchParams.toString()}`;
      }
      
      if (hash) builtUrlString += hash.startsWith('#') ? hash : `#${hash}`;
      
      setBuiltUrl(builtUrlString);
      toast({ title: 'Built!', description: 'URL built successfully.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to build URL',
        variant: 'destructive',
      });
    }
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const removeQueryParam = (index: number) => {
    if (queryParams.length > 1) {
      setQueryParams(queryParams.filter((_, i) => i !== index));
    }
  };

  const updateQueryParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...queryParams];
    updated[index][field] = value;
    setQueryParams(updated);
  };

  const handleEncode = () => {
    setEncodeOutput(encodeURIComponent(encodeInput));
    toast({ title: 'Encoded!', description: 'Text URL encoded.' });
  };

  const handleDecode = () => {
    try {
      setEncodeOutput(decodeURIComponent(encodeInput));
      toast({ title: 'Decoded!', description: 'URL decoded.' });
    } catch {
      toast({
        title: 'Error',
        description: 'Invalid encoded string',
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
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Link2 className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">URL Parser & Builder</h1>
          <p className="text-sm text-muted-foreground">
            Parse URLs, build URLs, and encode/decode URL components
          </p>
        </div>
      </div>

      <Tabs defaultValue="parser" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parser">Parser</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="encoder">Encoder/Decoder</TabsTrigger>
        </TabsList>

        {/* URL Parser */}
        <TabsContent value="parser" className="space-y-4">
          <Card className="p-4">
            <Label className="mb-2 block">Enter URL to parse</Label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/path?query=value#hash"
                className="font-mono"
              />
              <Button onClick={parseUrl}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Parse
              </Button>
            </div>
          </Card>

          {parsedUrl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(parsedUrl).map(([key, value]) => (
                <Card key={key} className="p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground uppercase">{key}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(value)}
                      disabled={!value}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-mono text-sm mt-1 break-all">{value || '(empty)'}</p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* URL Builder */}
        <TabsContent value="builder" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 space-y-4">
              <div>
                <Label>Protocol</Label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full mt-1 rounded-md border bg-background px-3 py-2"
                >
                  <option value="https">https</option>
                  <option value="http">http</option>
                  <option value="ftp">ftp</option>
                  <option value="ws">ws</option>
                  <option value="wss">wss</option>
                </select>
              </div>
              <div>
                <Label>Hostname</Label>
                <Input
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Port (optional)</Label>
                <Input
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="3000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Pathname</Label>
                <Input
                  value={pathname}
                  onChange={(e) => setPathname(e.target.value)}
                  placeholder="/api/users"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Hash (optional)</Label>
                <Input
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="section-1"
                  className="mt-1"
                />
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label>Query Parameters</Label>
                  <Button variant="outline" size="sm" onClick={addQueryParam}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {queryParams.map((param, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={param.key}
                        onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                        placeholder="key"
                        className="flex-1"
                      />
                      <Input
                        value={param.value}
                        onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                        placeholder="value"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQueryParam(index)}
                        disabled={queryParams.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={buildUrl} className="w-full">
                Build URL
              </Button>

              {builtUrl && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Result</Label>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(builtUrl)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-mono text-sm break-all">{builtUrl}</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Encoder/Decoder */}
        <TabsContent value="encoder" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <Label className="mb-2 block">Input</Label>
              <Textarea
                value={encodeInput}
                onChange={(e) => setEncodeInput(e.target.value)}
                placeholder="Enter text to encode or decode..."
                className="min-h-[200px] font-mono"
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleEncode} className="flex-1">
                  Encode
                </Button>
                <Button onClick={handleDecode} variant="secondary" className="flex-1">
                  Decode
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Output</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(encodeOutput)}
                  disabled={!encodeOutput}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={encodeOutput}
                readOnly
                placeholder="Output will appear here..."
                className="min-h-[200px] font-mono bg-muted"
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
