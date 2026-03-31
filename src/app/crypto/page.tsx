'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  Copy,
  RefreshCw,
  Key,
  Hash,
  Lock,
  Fingerprint,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';
import {
  generateHash,
  generateHashAsync,
  generateUUID,
  generatePassword,
  generateJWT,
  decodeJWT,
  generateRandomBytes,
} from '@/lib/tools/crypto-tools';
import { useHistory, type PasswordHistoryItem, type HashHistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { ShareButton } from '@/components/share/ShareButton';

export default function CryptoPage() {
  const { toast } = useToast();

  // History hooks
  const passwordHistory = useHistory<PasswordHistoryItem>({ storageKey: 'password' });
  const hashHistory = useHistory<HashHistoryItem>({ storageKey: 'hash' });
  const uuidHistory = useHistory<string>({ storageKey: 'uuid' });

  // Hash state
  const [hashInput, setHashInput] = useState('');
  const [hashAlgorithm, setHashAlgorithm] = useState('sha256');
  const [hashOutput, setHashOutput] = useState('');

  // UUID state
  const [uuids, setUuids] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState(5);

  // Password state
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [passwords, setPasswords] = useState<string[]>([]);

  // JWT state
  const [jwtPayload, setJwtPayload] = useState('{\n  "userId": 123,\n  "role": "admin"\n}');
  const [jwtSecret, setJwtSecret] = useState('your-secret-key');
  const [jwtToken, setJwtToken] = useState('');
  const [jwtDecoded, setJwtDecoded] = useState('');
  const [jwtDecodeInput, setJwtDecodeInput] = useState('');

  // Random bytes state
  const [bytesLength, setBytesLength] = useState(32);
  const [bytesFormat, setBytesFormat] = useState<'hex' | 'base64'>('hex');
  const [randomBytes, setRandomBytes] = useState('');

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
  };

  const handleGenerateHash = async () => {
    const result = await generateHashAsync(hashInput, hashAlgorithm as any);
    if (result.success && result.data) {
      setHashOutput(result.data);
      // Add to history
      hashHistory.addToHistory({
        input: hashInput.substring(0, 50) + (hashInput.length > 50 ? '...' : ''),
        output: result.data,
        algorithm: hashAlgorithm,
      }, hashAlgorithm.toUpperCase());
    }
  };

  const handleGenerateUUIDs = () => {
    const newUuids = Array.from({ length: uuidCount }, () => {
      const result = generateUUID();
      return result.data || '';
    });
    setUuids(newUuids);
    // Add first UUID to history
    if (newUuids[0]) {
      uuidHistory.addToHistory(newUuids[0], `${uuidCount} UUIDs`);
    }
  };

  const handleGeneratePasswords = () => {
    const options = {
      uppercase: includeUppercase,
      lowercase: includeLowercase,
      numbers: includeNumbers,
      symbols: includeSymbols,
    };
    const newPasswords = Array.from({ length: 5 }, () => {
      const result = generatePassword(passwordLength, options);
      return result.data || '';
    });
    setPasswords(newPasswords);
    // Add to history
    if (newPasswords[0]) {
      passwordHistory.addToHistory({
        password: newPasswords[0],
        length: passwordLength,
        options,
      }, `${passwordLength} chars`);
    }
  };

  const handleGenerateJWT = () => {
    const result = generateJWT(jwtPayload, jwtSecret);
    if (result.success && result.data) {
      setJwtToken(result.data);
      toast({ title: 'Generated!', description: 'JWT token generated.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDecodeJWT = () => {
    const result = decodeJWT(jwtDecodeInput);
    if (result.success && result.data) {
      setJwtDecoded(JSON.stringify(result.data, null, 2));
      toast({ title: 'Decoded!', description: 'JWT token decoded.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleGenerateBytes = () => {
    const result = generateRandomBytes(bytesLength, bytesFormat);
    if (result.success && result.data) {
      setRandomBytes(result.data);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Crypto Tools</h1>
            <p className="text-sm text-muted-foreground">
              Hash, UUID, password, and JWT generators
            </p>
          </div>
        </div>
        <ShareButton
          title="Crypto Tools - DevTools"
          description="Generate hashes, UUIDs, passwords, and JWT tokens"
          hashtags={['DevTools', 'Crypto', 'Password', 'UUID']}
        />
      </div>

      <Tabs defaultValue="hash" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="hash">Hash</TabsTrigger>
          <TabsTrigger value="uuid">UUID</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="jwt">JWT</TabsTrigger>
          <TabsTrigger value="bytes">Random Bytes</TabsTrigger>
        </TabsList>

        <TabsContent value="hash">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Hash Generator
                </CardTitle>
                <CardDescription>
                  Generate hash from text using various algorithms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Input Text</Label>
                  <Textarea
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Enter text to hash..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label>Algorithm</Label>
                    <Select value={hashAlgorithm} onValueChange={setHashAlgorithm}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="md5">MD5</SelectItem>
                        <SelectItem value="sha1">SHA-1</SelectItem>
                        <SelectItem value="sha256">SHA-256</SelectItem>
                        <SelectItem value="sha512">SHA-512</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-6">
                    <Button onClick={handleGenerateHash}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Hash
                    </Button>
                  </div>
                </div>

                {hashOutput && (
                  <div className="space-y-2">
                    <Label>Hash Output</Label>
                    <div className="flex gap-2">
                      <Input value={hashOutput} readOnly className="font-mono" />
                      <Button variant="outline" size="icon" onClick={() => handleCopy(hashOutput)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hash History */}
            <HistoryPanel<HashHistoryItem>
              history={hashHistory.history}
              onSelect={(item) => {
                setHashInput(item.value.input);
                setHashAlgorithm(item.value.algorithm);
                setHashOutput(item.value.output);
              }}
              onRemove={hashHistory.removeFromHistory}
              onClear={hashHistory.clearHistory}
              renderItem={(item) => (
                <div>
                  <div className="font-mono text-xs truncate text-muted-foreground">{item.value.input}</div>
                  <div className="font-mono text-sm truncate mt-1">{item.value.output}</div>
                </div>
              )}
              renderPreview={(item) => item.value.output}
              title="Hash History"
              emptyMessage="Generated hashes will appear here"
            />
          </div>
        </TabsContent>

        <TabsContent value="uuid">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                UUID Generator
              </CardTitle>
              <CardDescription>
                Generate random UUIDs (v4)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Select value={uuidCount.toString()} onValueChange={(v) => setUuidCount(parseInt(v))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-6">
                  <Button onClick={handleGenerateUUIDs}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate UUIDs
                  </Button>
                </div>
              </div>

              {uuids.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated UUIDs</Label>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(uuids.join('\n'))}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {uuids.map((uuid, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={uuid} readOnly className="font-mono" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(uuid)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password Generator
                </CardTitle>
                <CardDescription>
                  Generate secure random passwords
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Length: {passwordLength}</Label>
                    </div>
                    <Slider
                      value={[passwordLength]}
                      onValueChange={(v) => setPasswordLength(v[0])}
                      min={8}
                      max={64}
                      step={1}
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="uppercase"
                        checked={includeUppercase}
                        onCheckedChange={(c) => setIncludeUppercase(c as boolean)}
                      />
                      <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="lowercase"
                        checked={includeLowercase}
                        onCheckedChange={(c) => setIncludeLowercase(c as boolean)}
                      />
                      <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="numbers"
                        checked={includeNumbers}
                        onCheckedChange={(c) => setIncludeNumbers(c as boolean)}
                      />
                      <Label htmlFor="numbers">Numbers (0-9)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="symbols"
                        checked={includeSymbols}
                        onCheckedChange={(c) => setIncludeSymbols(c as boolean)}
                      />
                      <Label htmlFor="symbols">Symbols (!@#$...)</Label>
                    </div>
                  </div>

                  <Button onClick={handleGeneratePasswords}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Passwords
                  </Button>
                </div>

                {passwords.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Generated Passwords</Label>
                      <Button variant="outline" size="sm" onClick={() => handleCopy(passwords.join('\n'))}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {passwords.map((password, index) => (
                        <div key={index} className="flex gap-2">
                          <Input value={password} readOnly className="font-mono" />
                          <Button variant="outline" size="icon" onClick={() => handleCopy(password)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password History */}
            <HistoryPanel<PasswordHistoryItem>
              history={passwordHistory.history}
              onSelect={(item) => {
                setPasswordLength(item.value.length);
                setIncludeUppercase(item.value.options.uppercase);
                setIncludeLowercase(item.value.options.lowercase);
                setIncludeNumbers(item.value.options.numbers);
                setIncludeSymbols(item.value.options.symbols);
                setPasswords([item.value.password]);
              }}
              onRemove={passwordHistory.removeFromHistory}
              onClear={passwordHistory.clearHistory}
              renderItem={(item) => (
                <div className="font-mono text-sm truncate">{item.value.password}</div>
              )}
              renderPreview={(item) => item.value.password}
              title="Password History"
              emptyMessage="Generated passwords will appear here"
            />
          </div>
        </TabsContent>

        <TabsContent value="jwt">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  JWT Generator
                </CardTitle>
                <CardDescription>
                  Generate JWT tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payload (JSON)</Label>
                  <Textarea
                    value={jwtPayload}
                    onChange={(e) => setJwtPayload(e.target.value)}
                    rows={4}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <Input
                    value={jwtSecret}
                    onChange={(e) => setJwtSecret(e.target.value)}
                    type="password"
                  />
                </div>
                <Button onClick={handleGenerateJWT}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate JWT
                </Button>
                {jwtToken && (
                  <div className="space-y-2">
                    <Label>Token</Label>
                    <div className="flex gap-2">
                      <Textarea value={jwtToken} readOnly className="font-mono text-xs" rows={3} />
                      <Button variant="outline" size="icon" onClick={() => handleCopy(jwtToken)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  JWT Decoder
                </CardTitle>
                <CardDescription>
                  Decode and inspect JWT tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Token to Decode</Label>
                  <Textarea
                    value={jwtDecodeInput}
                    onChange={(e) => setJwtDecodeInput(e.target.value)}
                    placeholder="Paste JWT token here..."
                    rows={3}
                    className="font-mono text-xs"
                  />
                </div>
                <Button onClick={handleDecodeJWT}>
                  Decode JWT
                </Button>
                {jwtDecoded && (
                  <div className="space-y-2">
                    <Label>Decoded</Label>
                    <Textarea value={jwtDecoded} readOnly className="font-mono text-xs" rows={8} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bytes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Random Bytes Generator
              </CardTitle>
              <CardDescription>
                Generate cryptographically secure random bytes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Length (bytes)</Label>
                  <Select value={bytesLength.toString()} onValueChange={(v) => setBytesLength(parseInt(v))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="64">64</SelectItem>
                      <SelectItem value="128">128</SelectItem>
                      <SelectItem value="256">256</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={bytesFormat} onValueChange={(v) => setBytesFormat(v as 'hex' | 'base64')}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hex">Hex</SelectItem>
                      <SelectItem value="base64">Base64</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-6">
                  <Button onClick={handleGenerateBytes}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              {randomBytes && (
                <div className="space-y-2">
                  <Label>Random Bytes</Label>
                  <div className="flex gap-2">
                    <Textarea value={randomBytes} readOnly className="font-mono text-xs" rows={3} />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(randomBytes)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
