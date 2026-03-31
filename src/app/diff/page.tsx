'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  GitCompare,
  Copy,
  Trash2,
  ArrowLeftRight,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard, downloadFile } from '@/lib/utils';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: { left: number | null; right: number | null };
}

export default function DiffPage() {
  const { toast } = useToast();
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const diffResult = useMemo(() => {
    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');

    const processLine = (line: string) => {
      let processed = line;
      if (ignoreWhitespace) processed = processed.trim();
      if (ignoreCase) processed = processed.toLowerCase();
      return processed;
    };

    // Simple diff algorithm (LCS-based)
    const lcs = (a: string[], b: string[]): Set<number>[] => {
      const m = a.length;
      const n = b.length;
      const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (processLine(a[i - 1]) === processLine(b[j - 1])) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }

      // Backtrack to find LCS indices
      const leftIndices = new Set<number>();
      const rightIndices = new Set<number>();
      let i = m, j = n;
      while (i > 0 && j > 0) {
        if (processLine(a[i - 1]) === processLine(b[j - 1])) {
          leftIndices.add(i - 1);
          rightIndices.add(j - 1);
          i--;
          j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
          i--;
        } else {
          j--;
        }
      }

      return [leftIndices, rightIndices];
    };

    const [leftMatched, rightMatched] = lcs(leftLines, rightLines);

    const result: DiffLine[] = [];
    let leftIndex = 0;
    let rightIndex = 0;
    let leftLineNum = 1;
    let rightLineNum = 1;

    while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
      if (leftIndex < leftLines.length && !leftMatched.has(leftIndex)) {
        result.push({
          type: 'removed',
          content: leftLines[leftIndex],
          lineNumber: { left: leftLineNum++, right: null },
        });
        leftIndex++;
      } else if (rightIndex < rightLines.length && !rightMatched.has(rightIndex)) {
        result.push({
          type: 'added',
          content: rightLines[rightIndex],
          lineNumber: { left: null, right: rightLineNum++ },
        });
        rightIndex++;
      } else if (leftIndex < leftLines.length && rightIndex < rightLines.length) {
        result.push({
          type: 'unchanged',
          content: leftLines[leftIndex],
          lineNumber: { left: leftLineNum++, right: rightLineNum++ },
        });
        leftIndex++;
        rightIndex++;
      } else {
        break;
      }
    }

    return result;
  }, [leftText, rightText, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    const added = diffResult.filter(l => l.type === 'added').length;
    const removed = diffResult.filter(l => l.type === 'removed').length;
    const unchanged = diffResult.filter(l => l.type === 'unchanged').length;
    return { added, removed, unchanged };
  }, [diffResult]);

  const handleSwap = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const handleClear = () => {
    setLeftText('');
    setRightText('');
  };

  const handleExport = () => {
    const output = diffResult
      .map(line => {
        const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
        return `${prefix} ${line.content}`;
      })
      .join('\n');
    downloadFile(output, 'diff.txt', 'text/plain');
    toast({ title: 'Exported!', description: 'Diff exported to file.' });
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <GitCompare className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Diff Checker</h1>
            <p className="text-sm text-muted-foreground">
              Compare text and find differences
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSwap}>
            <ArrowLeftRight className="h-4 w-4 mr-1" />
            Swap
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={diffResult.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Options */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={ignoreWhitespace}
              onCheckedChange={setIgnoreWhitespace}
            />
            <Label className="font-normal">Ignore whitespace</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={ignoreCase}
              onCheckedChange={setIgnoreCase}
            />
            <Label className="font-normal">Ignore case</Label>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              -{stats.removed}
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              +{stats.added}
            </Badge>
            <Badge variant="secondary">
              {stats.unchanged} unchanged
            </Badge>
          </div>
        </div>
      </Card>

      {/* Input Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-4">
          <Label className="mb-2 block">Original Text</Label>
          <Textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="Paste original text here..."
            className="min-h-[200px] font-mono text-sm"
          />
        </Card>
        <Card className="p-4">
          <Label className="mb-2 block">Changed Text</Label>
          <Textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="Paste changed text here..."
            className="min-h-[200px] font-mono text-sm"
          />
        </Card>
      </div>

      {/* Diff Result */}
      <Card className="p-4">
        <Label className="mb-2 block">Diff Result</Label>
        <div className="bg-muted rounded-lg overflow-hidden">
          <div className="max-h-[400px] overflow-auto font-mono text-sm">
            {diffResult.length > 0 ? (
              diffResult.map((line, index) => (
                <div
                  key={index}
                  className={`flex ${
                    line.type === 'added'
                      ? 'bg-green-500/10'
                      : line.type === 'removed'
                      ? 'bg-red-500/10'
                      : ''
                  }`}
                >
                  <div className="w-12 px-2 py-1 text-right text-muted-foreground border-r border-border/50 select-none shrink-0">
                    {line.lineNumber.left ?? ''}
                  </div>
                  <div className="w-12 px-2 py-1 text-right text-muted-foreground border-r border-border/50 select-none shrink-0">
                    {line.lineNumber.right ?? ''}
                  </div>
                  <div className="w-6 px-1 py-1 text-center shrink-0">
                    {line.type === 'added' && (
                      <span className="text-green-500">+</span>
                    )}
                    {line.type === 'removed' && (
                      <span className="text-red-500">-</span>
                    )}
                  </div>
                  <div className="flex-1 px-2 py-1 whitespace-pre">
                    {line.content || ' '}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Enter text in both fields to see differences
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
