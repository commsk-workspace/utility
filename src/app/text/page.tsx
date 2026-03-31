'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TextAreaWithSearch } from '@/components/editor/TextAreaWithSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Type,
  Copy,
  RefreshCw,
  Search,
  CaseSensitive,
  AlignLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { useHistory, type TextHistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { ShareButton } from '@/components/share/ShareButton';
import {
  testRegex,
  changeCase,
  generateLoremIpsum,
  countText,
  compareText,
  escapeString,
  unescapeString,
  removeExtraSpaces,
  removeDuplicateLines,
} from '@/lib/tools/text-tools';

export default function TextPage() {
  const { toast } = useToast();

  // History
  const textHistory = useHistory<TextHistoryItem>({ storageKey: 'text' });

  // Regex state
  const [regexPattern, setRegexPattern] = useState('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestText, setRegexTestText] = useState('Contact us at hello@example.com or support@test.org');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);

  // Case converter state
  const [caseInput, setCaseInput] = useState('hello world example text');
  const [caseType, setCaseType] = useState<'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab' | 'pascal'>('upper');
  const [caseOutput, setCaseOutput] = useState('');

  // Lorem ipsum state
  const [loremCount, setLoremCount] = useState(3);
  const [loremType, setLoremType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [loremOutput, setLoremOutput] = useState('');

  // Text utilities state
  const [utilsInput, setUtilsInput] = useState('');
  const [utilsOutput, setUtilsOutput] = useState('');

  // Text stats
  const textStats = useMemo(() => {
    return countText(utilsInput);
  }, [utilsInput]);

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
  };

  const handleTestRegex = () => {
    const result = testRegex(regexPattern, regexTestText, regexFlags);
    if (result.success && result.data) {
      setRegexMatches(result.data.matches);
      textHistory.addToHistory({
        input: `/${regexPattern}/${regexFlags}`,
        output: result.data.matches.join(', '),
        action: `Regex: ${result.data.matches.length} matches`,
      });
      toast({
        title: result.data.isMatch ? 'Matches found!' : 'No matches',
        description: `Found ${result.data.matches.length} match(es)`,
      });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleChangeCase = () => {
    const result = changeCase(caseInput, caseType);
    if (result.success && result.data) {
      setCaseOutput(result.data);
      textHistory.addToHistory({
        input: caseInput,
        output: result.data,
        action: `Case: ${caseType}`,
      });
    }
  };

  const handleGenerateLorem = () => {
    const result = generateLoremIpsum(loremCount, loremType);
    if (result.success && result.data) {
      setLoremOutput(result.data);
      textHistory.addToHistory({
        input: `${loremCount} ${loremType}`,
        output: result.data.substring(0, 100) + '...',
        action: 'Lorem Ipsum',
      });
    }
  };

  const handleEscape = () => {
    const result = escapeString(utilsInput);
    if (result.success && result.data) {
      setUtilsOutput(result.data);
      textHistory.addToHistory({
        input: utilsInput.substring(0, 50),
        output: result.data.substring(0, 50),
        action: 'Escape String',
      });
      toast({ title: 'Escaped!', description: 'String has been escaped.' });
    }
  };

  const handleUnescape = () => {
    const result = unescapeString(utilsInput);
    if (result.success && result.data) {
      setUtilsOutput(result.data);
      textHistory.addToHistory({
        input: utilsInput.substring(0, 50),
        output: result.data.substring(0, 50),
        action: 'Unescape String',
      });
      toast({ title: 'Unescaped!', description: 'String has been unescaped.' });
    }
  };

  const handleRemoveSpaces = () => {
    const result = removeExtraSpaces(utilsInput);
    if (result.success && result.data) {
      setUtilsOutput(result.data);
      textHistory.addToHistory({
        input: utilsInput.substring(0, 50),
        output: result.data.substring(0, 50),
        action: 'Remove Extra Spaces',
      });
      toast({ title: 'Done!', description: 'Extra spaces removed.' });
    }
  };

  const handleRemoveDuplicates = () => {
    const result = removeDuplicateLines(utilsInput);
    if (result.success && result.data) {
      setUtilsOutput(result.data);
      textHistory.addToHistory({
        input: utilsInput.substring(0, 50),
        output: result.data.substring(0, 50),
        action: 'Remove Duplicates',
      });
      toast({ title: 'Done!', description: 'Duplicate lines removed.' });
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Type className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Text Tools</h1>
            <p className="text-sm text-muted-foreground">
              Regex tester, case converter, and text utilities
            </p>
          </div>
        </div>
        <ShareButton
          title="Text Tools - DevTools"
          description="Regex tester, case converter, lorem ipsum generator, and text utilities"
          hashtags={['DevTools', 'TextTools', 'Regex', 'Developer']}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr,300px] gap-6">
        <Tabs defaultValue="regex" className="space-y-4">
          <TabsList>
            <TabsTrigger value="regex">Regex Tester</TabsTrigger>
            <TabsTrigger value="case">Case Converter</TabsTrigger>
            <TabsTrigger value="lorem">Lorem Ipsum</TabsTrigger>
            <TabsTrigger value="utils">Text Utilities</TabsTrigger>
          </TabsList>

        <TabsContent value="regex">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Regex Tester
              </CardTitle>
              <CardDescription>
                Test regular expressions and find matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-[1fr_100px] gap-4">
                <div className="space-y-2">
                  <Label>Pattern</Label>
                  <Input
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    placeholder="Enter regex pattern..."
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Flags</Label>
                  <Input
                    value={regexFlags}
                    onChange={(e) => setRegexFlags(e.target.value)}
                    placeholder="g, i, m..."
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Test String</Label>
                <Textarea
                  value={regexTestText}
                  onChange={(e) => setRegexTestText(e.target.value)}
                  rows={4}
                  placeholder="Enter text to test..."
                />
              </div>

              <Button onClick={handleTestRegex}>
                <Search className="h-4 w-4 mr-2" />
                Test Regex
              </Button>

              {regexMatches.length > 0 && (
                <div className="space-y-2">
                  <Label>Matches ({regexMatches.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {regexMatches.map((match, index) => (
                      <Badge key={index} variant="secondary" className="font-mono">
                        {match}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="case">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CaseSensitive className="h-5 w-5" />
                Case Converter
              </CardTitle>
              <CardDescription>
                Convert text between different cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Input Text</Label>
                <Textarea
                  value={caseInput}
                  onChange={(e) => setCaseInput(e.target.value)}
                  rows={3}
                  placeholder="Enter text to convert..."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Case Type</Label>
                  <Select value={caseType} onValueChange={(v) => setCaseType(v as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upper">UPPERCASE</SelectItem>
                      <SelectItem value="lower">lowercase</SelectItem>
                      <SelectItem value="title">Title Case</SelectItem>
                      <SelectItem value="sentence">Sentence case</SelectItem>
                      <SelectItem value="camel">camelCase</SelectItem>
                      <SelectItem value="pascal">PascalCase</SelectItem>
                      <SelectItem value="snake">snake_case</SelectItem>
                      <SelectItem value="kebab">kebab-case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-6">
                  <Button onClick={handleChangeCase}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Convert
                  </Button>
                </div>
              </div>

              {caseOutput && (
                <div className="space-y-2">
                  <Label>Output</Label>
                  <div className="flex gap-2">
                    <Textarea value={caseOutput} readOnly rows={3} />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(caseOutput)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lorem">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlignLeft className="h-5 w-5" />
                Lorem Ipsum Generator
              </CardTitle>
              <CardDescription>
                Generate placeholder text for your designs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Select value={loremCount.toString()} onValueChange={(v) => setLoremCount(parseInt(v))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 10, 15, 20].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={loremType} onValueChange={(v) => setLoremType(v as any)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraphs">Paragraphs</SelectItem>
                      <SelectItem value="sentences">Sentences</SelectItem>
                      <SelectItem value="words">Words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-6">
                  <Button onClick={handleGenerateLorem}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              {loremOutput && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated Text</Label>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(loremOutput)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea value={loremOutput} readOnly rows={10} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utils">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Text Utilities
              </CardTitle>
              <CardDescription>
                Various text manipulation tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Input Text</Label>
                <TextAreaWithSearch
                  value={utilsInput}
                  onChange={setUtilsInput}
                  rows={6}
                  placeholder="Enter text... (Press Ctrl+F to search)"
                />
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <span className="text-sm text-muted-foreground">Characters:</span>
                  <span className="ml-2 font-mono">{textStats.characters}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">No spaces:</span>
                  <span className="ml-2 font-mono">{textStats.charactersNoSpaces}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Words:</span>
                  <span className="ml-2 font-mono">{textStats.words}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Lines:</span>
                  <span className="ml-2 font-mono">{textStats.lines}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Paragraphs:</span>
                  <span className="ml-2 font-mono">{textStats.paragraphs}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleEscape}>
                  Escape String
                </Button>
                <Button variant="outline" size="sm" onClick={handleUnescape}>
                  Unescape String
                </Button>
                <Button variant="outline" size="sm" onClick={handleRemoveSpaces}>
                  Remove Extra Spaces
                </Button>
                <Button variant="outline" size="sm" onClick={handleRemoveDuplicates}>
                  Remove Duplicate Lines
                </Button>
              </div>

              {utilsOutput && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Output</Label>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(utilsOutput)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea value={utilsOutput} readOnly rows={6} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* History Sidebar */}
      <div className="space-y-4">
        <HistoryPanel<TextHistoryItem>
          history={textHistory.history}
          onSelect={(item) => {
            if (item.value.action.startsWith('Regex')) {
              setRegexPattern(item.value.input.replace(/^\/|\/[gim]*$/g, ''));
            } else if (item.value.action.startsWith('Case')) {
              setCaseInput(item.value.input);
              setCaseOutput(item.value.output);
            } else if (item.value.action === 'Lorem Ipsum') {
              setLoremOutput(item.value.output);
            } else {
              setUtilsInput(item.value.input);
              setUtilsOutput(item.value.output);
            }
          }}
          onRemove={(id) => textHistory.removeFromHistory(id)}
          onClear={() => textHistory.clearHistory()}
          renderItem={(item) => (
            <div className="flex flex-col gap-1">
              <Badge variant="outline" className="text-xs w-fit">{item.value.action}</Badge>
              <code className="text-xs text-muted-foreground truncate">{item.value.input}</code>
            </div>
          )}
          renderPreview={(item) => `${item.value.action}: ${item.value.input} → ${item.value.output}`}
        />
      </div>
    </div>
    </div>
  );
}
