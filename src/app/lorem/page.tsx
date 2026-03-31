'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
];

type GenerationType = 'paragraphs' | 'sentences' | 'words';

export default function LoremPage() {
  const { toast } = useToast();
  const [output, setOutput] = useState('');
  const [count, setCount] = useState(3);
  const [type, setType] = useState<GenerationType>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);

  const getRandomWord = useCallback(() => {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  }, []);

  const generateSentence = useCallback((isFirst: boolean = false): string => {
    const wordCount = Math.floor(Math.random() * 10) + 8;
    const words: string[] = [];
    
    for (let i = 0; i < wordCount; i++) {
      if (i === 0 && isFirst && startWithLorem) {
        words.push('Lorem');
      } else if (i === 1 && isFirst && startWithLorem) {
        words.push('ipsum');
      } else {
        words.push(getRandomWord());
      }
    }
    
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  }, [getRandomWord, startWithLorem]);

  const generateParagraph = useCallback((isFirst: boolean = false): string => {
    const sentenceCount = Math.floor(Math.random() * 4) + 4;
    const sentences: string[] = [];
    
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(i === 0 && isFirst));
    }
    
    return sentences.join(' ');
  }, [generateSentence]);

  const generate = useCallback(() => {
    let result = '';
    
    switch (type) {
      case 'paragraphs':
        const paragraphs: string[] = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph(i === 0));
        }
        result = paragraphs.join('\n\n');
        break;
        
      case 'sentences':
        const sentences: string[] = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence(i === 0));
        }
        result = sentences.join(' ');
        break;
        
      case 'words':
        const words: string[] = [];
        for (let i = 0; i < count; i++) {
          if (i === 0 && startWithLorem) {
            words.push('Lorem');
          } else if (i === 1 && startWithLorem) {
            words.push('ipsum');
          } else {
            words.push(getRandomWord());
          }
        }
        result = words.join(' ');
        break;
    }
    
    setOutput(result);
    toast({ title: 'Generated!', description: `${count} ${type} generated.` });
  }, [type, count, startWithLorem, generateParagraph, generateSentence, getRandomWord, toast]);

  const handleCopy = async () => {
    await copyToClipboard(output);
    toast({ title: 'Copied!', description: 'Text copied to clipboard.' });
  };

  const stats = {
    words: output.split(/\s+/).filter(w => w).length,
    characters: output.length,
    sentences: (output.match(/\./g) || []).length,
    paragraphs: output.split(/\n\n/).filter(p => p).length,
  };

  return (
    <div className="container mx-auto max-w-4xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <FileText className="h-6 w-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Lorem Ipsum Generator</h1>
          <p className="text-sm text-muted-foreground">
            Generate placeholder text for your designs
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Generate</Label>
            <Input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-20"
              min={1}
              max={100}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={type === 'paragraphs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('paragraphs')}
            >
              Paragraphs
            </Button>
            <Button
              variant={type === 'sentences' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('sentences')}
            >
              Sentences
            </Button>
            <Button
              variant={type === 'words' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('words')}
            >
              Words
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="startWithLorem"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="startWithLorem" className="font-normal cursor-pointer">
              Start with "Lorem ipsum"
            </Label>
          </div>
          
          <div className="flex-1" />
          
          <Button onClick={generate}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </Card>

      {/* Output */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Label>Generated Text</Label>
          <div className="flex items-center gap-2">
            {output && (
              <div className="flex gap-2">
                <Badge variant="secondary">{stats.words} words</Badge>
                <Badge variant="secondary">{stats.characters} chars</Badge>
              </div>
            )}
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
        </div>
        <Textarea
          value={output}
          readOnly
          placeholder="Click Generate to create Lorem Ipsum text..."
          className="min-h-[300px] font-serif"
        />
      </Card>
    </div>
  );
}
