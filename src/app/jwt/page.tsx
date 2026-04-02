'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { useHistory, type JwtHistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export default function JwtPage() {
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [isExpired, setIsExpired] = useState<boolean | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // History
  const jwtHistory = useHistory<JwtHistoryItem>({ storageKey: 'jwt' });

  const decodeBase64Url = (str: string): string => {
    // Replace URL-safe characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' if necessary
    while (base64.length % 4) {
      base64 += '=';
    }
    return atob(base64);
  };

  const handleDecode = () => {
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(decodeBase64Url(parts[0]));
      const payload = JSON.parse(decodeBase64Url(parts[1]));
      const signature = parts[2];

      setDecoded({ header, payload, signature });

      // Check expiration
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        setExpiryDate(expDate.toLocaleString());
        setIsExpired(expDate < new Date());
      } else {
        setExpiryDate(null);
        setIsExpired(null);
      }

      jwtHistory.addToHistory({ token });

      toast({ title: 'Decoded!', description: 'JWT decoded successfully.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to decode JWT',
        variant: 'destructive',
      });
      setDecoded(null);
      setIsExpired(null);
      setExpiryDate(null);
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
  };

  const handleClear = () => {
    setToken('');
    setDecoded(null);
    setIsExpired(null);
    setExpiryDate(null);
  };

  const formatJson = (obj: Record<string, unknown>): string => {
    return JSON.stringify(obj, null, 2);
  };

  const getClaimLabel = (key: string): string => {
    const labels: Record<string, string> = {
      iss: 'Issuer',
      sub: 'Subject',
      aud: 'Audience',
      exp: 'Expiration Time',
      nbf: 'Not Before',
      iat: 'Issued At',
      jti: 'JWT ID',
    };
    return labels[key] || key;
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Key className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">JWT Decoder</h1>
          <p className="text-sm text-muted-foreground">
            Decode and inspect JSON Web Tokens
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label>JWT Token</Label>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here..."
            className="min-h-[200px] font-mono text-sm"
          />
          <Button onClick={handleDecode} className="w-full mt-4">
            Decode Token
          </Button>

          {/* Expiry Status */}
          {isExpired !== null && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              isExpired ? 'bg-destructive/10' : 'bg-green-500/10'
            }`}>
              {isExpired ? (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Token Expired</p>
                    <p className="text-sm text-muted-foreground">{expiryDate}</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-500">Token Valid</p>
                    <p className="text-sm text-muted-foreground">Expires: {expiryDate}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </Card>

        {/* Decoded Output */}
        <div className="space-y-4">
          {/* Header */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Label>Header</Label>
                <Badge variant="secondary">ALGORITHM & TOKEN TYPE</Badge>
              </div>
              {decoded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(formatJson(decoded.header))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-auto max-h-[200px]">
              {decoded ? formatJson(decoded.header) : '// Header will appear here'}
            </pre>
          </Card>

          {/* Payload */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Label>Payload</Label>
                <Badge variant="secondary">DATA</Badge>
              </div>
              {decoded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(formatJson(decoded.payload))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-auto max-h-[300px]">
              {decoded ? formatJson(decoded.payload) : '// Payload will appear here'}
            </pre>

            {/* Claims */}
            {decoded && (
              <div className="mt-4 space-y-2">
                <Label className="text-xs text-muted-foreground">Standard Claims</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'].map((claim) => {
                    const value = decoded.payload[claim];
                    if (!value) return null;
                    return (
                      <div key={claim} className="p-2 bg-muted rounded text-xs">
                        <span className="text-muted-foreground">{getClaimLabel(claim)}:</span>
                        <span className="ml-1 font-mono">
                          {['exp', 'nbf', 'iat'].includes(claim)
                            ? new Date((value as number) * 1000).toLocaleString()
                            : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Signature */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Label>Signature</Label>
                <Badge variant="outline">ENCODED SIGNATURE</Badge>
              </div>
              {decoded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(decoded.signature)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-auto break-all">
              {decoded ? decoded.signature : '// Signature will appear here'}
            </pre>
            {decoded && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                This tool only decodes the token. Signature verification requires the secret key and should be done server-side.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* History FAB & Panel */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {showHistory && (
          <div className="w-80 mb-2">
            <HistoryPanel<JwtHistoryItem>
              history={jwtHistory.history}
              onSelect={(item) => {
                setToken(item.value.token);
              }}
              onRemove={(id) => jwtHistory.removeFromHistory(id)}
              onClear={() => jwtHistory.clearHistory()}
              renderItem={(item) => (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">JWT Token</span>
                  <code className="text-xs text-muted-foreground truncate">{item.value.token.substring(0, 30)}...</code>
                </div>
              )}
              renderPreview={(item) => item.value.token}
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
