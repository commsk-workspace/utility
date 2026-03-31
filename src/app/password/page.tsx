'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  KeyRound,
  Copy,
  RefreshCw,
  Check,
  Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

export default function PasswordPage() {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let charset = '';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const ambiguous = 'Il1O0';

    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (excludeAmbiguous) {
      charset = charset.split('').filter(c => !ambiguous.includes(c)).join('');
    }

    if (!charset) {
      toast({
        title: 'Error',
        description: 'Please select at least one character type',
        variant: 'destructive',
      });
      return;
    }

    let newPassword = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    setPassword(newPassword);
    setCopied(false);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous, toast]);

  const handleCopy = async () => {
    await copyToClipboard(password);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Password copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const getPasswordStrength = (): { label: string; color: string; score: number } => {
    if (!password) return { label: 'None', color: 'bg-muted', score: 0 };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', score: 25 };
    if (score <= 4) return { label: 'Fair', color: 'bg-yellow-500', score: 50 };
    if (score <= 5) return { label: 'Strong', color: 'bg-blue-500', score: 75 };
    return { label: 'Very Strong', color: 'bg-green-500', score: 100 };
  };

  const strength = getPasswordStrength();

  return (
    <div className="container mx-auto max-w-3xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-green-500/10">
          <KeyRound className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Password Generator</h1>
          <p className="text-sm text-muted-foreground">
            Generate secure, random passwords
          </p>
        </div>
      </div>

      {/* Password Display */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Input
            value={password}
            readOnly
            placeholder="Click Generate to create a password"
            className="font-mono text-lg h-12"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12"
            onClick={handleCopy}
            disabled={!password}
          >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
          </Button>
          <Button
            size="icon"
            className="h-12 w-12"
            onClick={generatePassword}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Strength Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Password Strength</span>
            <Badge variant={strength.score === 100 ? 'default' : 'secondary'}>
              <Shield className="h-3 w-3 mr-1" />
              {strength.label}
            </Badge>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Options */}
      <Card className="p-6 space-y-6">
        {/* Length */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Password Length</Label>
            <Badge variant="outline">{length} characters</Badge>
          </div>
          <Slider
            value={[length]}
            onValueChange={([value]) => setLength(value)}
            min={4}
            max={64}
            step={1}
          />
        </div>

        {/* Character Types */}
        <div className="space-y-4">
          <Label>Character Types</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-normal">Uppercase Letters</Label>
              <p className="text-xs text-muted-foreground">A-Z</p>
            </div>
            <Switch
              checked={includeUppercase}
              onCheckedChange={setIncludeUppercase}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-normal">Lowercase Letters</Label>
              <p className="text-xs text-muted-foreground">a-z</p>
            </div>
            <Switch
              checked={includeLowercase}
              onCheckedChange={setIncludeLowercase}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-normal">Numbers</Label>
              <p className="text-xs text-muted-foreground">0-9</p>
            </div>
            <Switch
              checked={includeNumbers}
              onCheckedChange={setIncludeNumbers}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-normal">Symbols</Label>
              <p className="text-xs text-muted-foreground">!@#$%^&*()_+-=[]{}|;:,.</p>
            </div>
            <Switch
              checked={includeSymbols}
              onCheckedChange={setIncludeSymbols}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label className="font-normal">Exclude Ambiguous Characters</Label>
              <p className="text-xs text-muted-foreground">I, l, 1, O, 0</p>
            </div>
            <Switch
              checked={excludeAmbiguous}
              onCheckedChange={setExcludeAmbiguous}
            />
          </div>
        </div>

        <Button onClick={generatePassword} className="w-full" size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Password
        </Button>
      </Card>
    </div>
  );
}
