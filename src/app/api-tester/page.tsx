'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Send,
  Copy,
  Trash2,
  Plus,
  X,
  Loader2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-green-500',
  POST: 'bg-blue-500',
  PUT: 'bg-amber-500',
  PATCH: 'bg-purple-500',
  DELETE: 'bg-red-500',
};

export default function ApiTesterPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
  ]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useProxy, setUseProxy] = useState(false);

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: keyof Header, value: string | boolean) => {
    const updated = [...headers];
    (updated[index] as any)[field] = value;
    setHeaders(updated);
  };

  const sendRequest = async () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const requestHeaders: Record<string, string> = {};
      headers
        .filter(h => h.enabled && h.key)
        .forEach(h => {
          requestHeaders[h.key] = h.value;
        });

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
      }

      const targetUrl = useProxy ? `/api/proxy?url=${encodeURIComponent(url)}` : url;
      const res = await fetch(targetUrl, options);
      const endTime = performance.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody = '';
      try {
        const text = await res.text();
        // Try to format as JSON
        try {
          responseBody = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          responseBody = text;
        }
      } catch {
        responseBody = 'Unable to read response body';
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: Math.round(endTime - startTime),
      });

      toast({
        title: 'Request completed',
        description: `${res.status} ${res.statusText} in ${Math.round(endTime - startTime)}ms`,
      });
    } catch (error) {
      const endTime = performance.now();
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      const isCorsError = errorMessage === 'Failed to fetch' || errorMessage.includes('CORS');
      const displayMessage = isCorsError && !useProxy
        ? 'CORS error: The target server does not allow cross-origin requests from the browser. Try enabling the "Use Proxy" option above.'
        : errorMessage;

      setResponse({
        status: 0,
        statusText: isCorsError ? 'CORS Error' : 'Error',
        headers: {},
        body: displayMessage,
        time: Math.round(endTime - startTime),
      });

      toast({
        title: isCorsError ? 'CORS Error' : 'Request failed',
        description: isCorsError && !useProxy ? 'Enable "Use Proxy" to bypass CORS restrictions' : errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-blue-500';
    if (status >= 400 && status < 500) return 'bg-amber-500';
    if (status >= 500) return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-violet-500/10">
          <Send className="h-6 w-6 text-violet-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">API Tester</h1>
          <p className="text-sm text-muted-foreground">
            Test REST APIs with ease
          </p>
        </div>
      </div>

      {/* CORS Info Banner */}
      <Card className="p-3 mb-4 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Browser CORS policy may block requests to external APIs. Enable <strong>Use Proxy</strong> to route requests through the server.
            </p>
          </div>
          <label className="flex items-center gap-2 shrink-0 cursor-pointer">
            <span className="text-sm font-medium">Use Proxy</span>
            <input
              type="checkbox"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="rounded"
            />
          </label>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request */}
        <div className="space-y-4">
          {/* URL & Method */}
          <Card className="p-4">
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className={`rounded-md px-3 py-2 text-sm font-medium text-white ${METHOD_COLORS[method]}`}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="flex-1 font-mono"
              />
              <Button onClick={sendRequest} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </Card>

          {/* Headers & Body */}
          <Card className="p-4">
            <Tabs defaultValue="headers">
              <TabsList className="mb-4">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>

              <TabsContent value="headers" className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <Input
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      placeholder="Header name"
                      className="flex-1 font-mono text-sm"
                    />
                    <Input
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeader(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addHeader}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Header
                </Button>
              </TabsContent>

              <TabsContent value="body">
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="min-h-[200px] font-mono text-sm"
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Response */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Label>Response</Label>
              {response && (
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(response.status)}>
                    {response.status} {response.statusText}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {response.time}ms
                  </Badge>
                </div>
              )}
            </div>

            <Tabs defaultValue="body">
              <TabsList className="mb-4">
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
              </TabsList>

              <TabsContent value="body">
                <div className="relative">
                  {response && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(response.body)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  <Textarea
                    value={response?.body || ''}
                    readOnly
                    placeholder="Response will appear here..."
                    className="min-h-[300px] font-mono text-sm bg-muted"
                  />
                </div>
              </TabsContent>

              <TabsContent value="headers">
                <div className="bg-muted rounded-lg p-3 min-h-[300px] font-mono text-sm overflow-auto">
                  {response && Object.entries(response.headers).length > 0 ? (
                    Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="py-1">
                        <span className="text-muted-foreground">{key}:</span>{' '}
                        <span>{value}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No headers</span>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
