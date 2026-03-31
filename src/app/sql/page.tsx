'use client';

import { useState } from 'react';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Database,
  Copy,
  Trash2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { copyToClipboard } from '@/lib/utils';
import { useHistory, type SqlHistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { ShareButton } from '@/components/share/ShareButton';
import {
  formatSql,
  minifySql,
  sqlToPrisma,
  sqlToTypeORM,
  sqlToDrizzle,
  validateSql,
} from '@/lib/tools/sql-tools';

const sampleSql = `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id INTEGER REFERENCES users(id),
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

export default function SqlPage() {
  const { toast } = useToast();
  const [sql, setSql] = useLocalStorage('sql-code', sampleSql);
  const [output, setOutput] = useState('');
  const [outputLang, setOutputLang] = useState('typescript');

  // History
  const sqlHistory = useHistory<SqlHistoryItem>({ storageKey: 'sql' });

  const handleFormat = () => {
    const result = formatSql(sql);
    if (result.success && result.data) {
      setSql(result.data);
      sqlHistory.addToHistory({
        input: sql.substring(0, 100),
        output: result.data.substring(0, 100),
        action: 'Format SQL',
      });
      toast({
        title: 'Formatted!',
        description: 'SQL has been formatted.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleMinify = () => {
    const result = minifySql(sql);
    if (result.success && result.data) {
      setSql(result.data);
      sqlHistory.addToHistory({
        input: sql.substring(0, 100),
        output: result.data.substring(0, 100),
        action: 'Minify SQL',
      });
      toast({
        title: 'Minified!',
        description: 'SQL has been minified.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleToPrisma = () => {
    const result = sqlToPrisma(sql);
    if (result.success && result.data) {
      setOutput(result.data);
      setOutputLang('prisma');
      sqlHistory.addToHistory({
        input: sql.substring(0, 100),
        output: result.data.substring(0, 100),
        action: 'To Prisma',
      });
      toast({
        title: 'Converted!',
        description: 'SQL converted to Prisma schema.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleToTypeORM = () => {
    const result = sqlToTypeORM(sql);
    if (result.success && result.data) {
      setOutput(result.data);
      setOutputLang('typescript');
      sqlHistory.addToHistory({
        input: sql.substring(0, 100),
        output: result.data.substring(0, 100),
        action: 'To TypeORM',
      });
      toast({
        title: 'Converted!',
        description: 'SQL converted to TypeORM entities.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleToDrizzle = () => {
    const result = sqlToDrizzle(sql);
    if (result.success && result.data) {
      setOutput(result.data);
      setOutputLang('typescript');
      sqlHistory.addToHistory({
        input: sql.substring(0, 100),
        output: result.data.substring(0, 100),
        action: 'To Drizzle',
      });
      toast({
        title: 'Converted!',
        description: 'SQL converted to Drizzle schema.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({
      title: 'Copied!',
      description: 'Copied to clipboard.',
    });
  };

  const handleClear = () => {
    setSql('');
    setOutput('');
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Database className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SQL Tools</h1>
            <p className="text-sm text-muted-foreground">
              Format SQL and convert to ORM schemas
            </p>
          </div>
        </div>
        <ShareButton
          title="SQL Tools - DevTools"
          description="Format SQL and convert to Prisma, TypeORM, and Drizzle schemas"
          hashtags={['DevTools', 'SQL', 'Prisma', 'TypeORM', 'Drizzle']}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr,300px] gap-6">
        <Tabs defaultValue="format" className="space-y-4">
          <TabsList>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="convert">Convert to ORM</TabsTrigger>
          </TabsList>

        <TabsContent value="format" className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleFormat}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Format
            </Button>
            <Button variant="outline" size="sm" onClick={handleMinify}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Minify
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => handleCopy(sql)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Editor */}
          <Card className="overflow-hidden">
            <MonacoEditor
              value={sql}
              onChange={setSql}
              language="sql"
              height="calc(100vh - 320px)"
            />
          </Card>
        </TabsContent>

        <TabsContent value="convert" className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleToPrisma}>
              To Prisma
            </Button>
            <Button variant="outline" size="sm" onClick={handleToTypeORM}>
              To TypeORM
            </Button>
            <Button variant="outline" size="sm" onClick={handleToDrizzle}>
              To Drizzle
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => handleCopy(output)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Output
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Input SQL</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={sql}
                onChange={setSql}
                language="sql"
                height="calc(100vh - 360px)"
              />
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="py-2 px-4 border-b">
                <CardTitle className="text-sm">Output</CardTitle>
              </CardHeader>
              <MonacoEditor
                value={output}
                onChange={setOutput}
                language={outputLang}
                height="calc(100vh - 360px)"
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* History Sidebar */}
      <div className="space-y-4">
        <HistoryPanel<SqlHistoryItem>
          history={sqlHistory.history}
          onSelect={(item) => {
            setSql(item.value.input);
            if (item.value.output) {
              setOutput(item.value.output);
            }
          }}
          onRemove={(id) => sqlHistory.removeFromHistory(id)}
          onClear={() => sqlHistory.clearHistory()}
          renderItem={(item) => (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium">{item.value.action}</span>
              <code className="text-xs text-muted-foreground truncate">{item.value.input.substring(0, 30)}...</code>
            </div>
          )}
          renderPreview={(item) => `${item.value.action}: ${item.value.input}`}
        />
      </div>
    </div>
    </div>
  );
}
