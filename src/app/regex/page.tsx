'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Regex,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

const COMMON_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: 'URL', pattern: 'https?:\\/\\/[^\\s]+' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
  { name: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: 'Hex Color', pattern: '#[0-9A-Fa-f]{6}' },
  { name: 'Number', pattern: '-?\\d+\\.?\\d*' },
];

export default function RegexPage() {
  const { toast } = useToast();
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (!pattern || !testString) {
      setMatches([]);
      setError(null);
      setHighlightedText(testString);
      return;
    }

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join('');
      
      const regex = new RegExp(pattern, flagString);
      const results: MatchResult[] = [];
      let match;

      if (flags.g) {
        while ((match = regex.exec(testString)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(results);
      setError(null);

      // Create highlighted text
      if (results.length > 0) {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        results.forEach((result, i) => {
          if (result.index > lastIndex) {
            parts.push(
              <span key={`text-${i}`}>
                {testString.slice(lastIndex, result.index)}
              </span>
            );
          }
          parts.push(
            <mark key={`match-${i}`} className="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded">
              {result.match}
            </mark>
          );
          lastIndex = result.index + result.match.length;
        });

        if (lastIndex < testString.length) {
          parts.push(
            <span key="text-end">{testString.slice(lastIndex)}</span>
          );
        }

        setHighlightedText(<>{parts}</>);
      } else {
        setHighlightedText(testString);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex');
      setMatches([]);
      setHighlightedText(testString);
    }
  }, [pattern, testString, flags]);

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
  };

  const handleClear = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setError(null);
  };

  const applyPattern = (p: string) => {
    setPattern(p);
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Regex className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Regex Tester</h1>
          <p className="text-sm text-muted-foreground">
            Test regular expressions with real-time matching
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pattern Input */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Regular Expression</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="font-mono"
              />
              <span className="text-muted-foreground">/</span>
              <div className="flex gap-1">
                {Object.entries(flags).map(([flag, enabled]) => (
                  <Button
                    key={flag}
                    variant={enabled ? 'default' : 'outline'}
                    size="sm"
                    className="w-8"
                    onClick={() => setFlags({ ...flags, [flag]: !enabled })}
                  >
                    {flag}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </Card>

          {/* Test String */}
          <Card className="p-4">
            <Label className="mb-2 block">Test String</Label>
            <Textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against the regex..."
              className="min-h-[150px] font-mono"
            />
          </Card>

          {/* Highlighted Result */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Result</Label>
              <Badge variant={matches.length > 0 ? 'default' : 'secondary'}>
                {matches.length} match{matches.length !== 1 ? 'es' : ''}
              </Badge>
            </div>
            <div className="p-3 bg-muted rounded-lg min-h-[100px] font-mono text-sm whitespace-pre-wrap break-all">
              {highlightedText || 'Enter a pattern and test string to see results'}
            </div>
          </Card>

          {/* Matches */}
          {matches.length > 0 && (
            <Card className="p-4">
              <Label className="mb-2 block">Match Details</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {matches.map((match, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div>
                      <span className="font-mono text-sm">{match.match}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        at index {match.index}
                      </span>
                      {match.groups.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Groups: {match.groups.join(', ')}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(match.match)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Panel - Common Patterns */}
        <div className="space-y-4">
          <Card className="p-4">
            <Label className="mb-3 block">Common Patterns</Label>
            <div className="space-y-2">
              {COMMON_PATTERNS.map((p, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start font-normal"
                  onClick={() => applyPattern(p.pattern)}
                >
                  <span className="truncate">{p.name}</span>
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <Label>Flags</Label>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <Badge variant="outline" className="mr-2">g</Badge>
                <span className="text-muted-foreground">Global - find all matches</span>
              </div>
              <div>
                <Badge variant="outline" className="mr-2">i</Badge>
                <span className="text-muted-foreground">Case insensitive</span>
              </div>
              <div>
                <Badge variant="outline" className="mr-2">m</Badge>
                <span className="text-muted-foreground">Multiline mode</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
