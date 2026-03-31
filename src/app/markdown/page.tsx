'use client';

import { useState } from 'react';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { MarkdownPreview } from '@/components/editor/MarkdownPreview';
import { ShareDialog } from '@/components/share/ShareDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Share2,
  Download,
  Copy,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Table,
  History,
  FileCode,
  FileType,
  FileOutput,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { copyToClipboard } from '@/lib/utils';
import { useHistory } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { ShareButton } from '@/components/share/ShareButton';
import {
  exportToMarkdown,
  exportToHtml,
  exportToDocx,
  exportToPdf,
  exportToTxt,
} from '@/lib/tools/markdown-export';

const markdownTemplates = {
  blank: '',
  readme: `# Project Name

A brief description of what this project does.

## Installation

\`\`\`bash
npm install my-project
\`\`\`

## Usage

\`\`\`javascript
import { myFunction } from 'my-project';

myFunction();
\`\`\`

## Features

- Feature 1
- Feature 2
- Feature 3

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

[MIT](https://choosealicense.com/licenses/mit/)`,
  documentation: `# Documentation

## Overview

This document provides an overview of the system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Configuration](#configuration)
3. [API Reference](#api-reference)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| port | number | 3000 | Server port |
| debug | boolean | false | Enable debug mode |

## API Reference

### GET /api/users

Returns a list of users.

\`\`\`json
{
  "users": [
    { "id": 1, "name": "John" }
  ]
}
\`\`\``,
  changelog: `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature X

### Changed
- Updated dependency Y

### Fixed
- Bug fix Z

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Core functionality
- Documentation`,
  notes: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 

## Agenda

1. Topic 1
2. Topic 2
3. Topic 3

## Discussion

### Topic 1

Notes about topic 1...

### Topic 2

Notes about topic 2...

## Action Items

- [ ] Task 1 - @person - Due: 
- [ ] Task 2 - @person - Due: 

## Next Meeting

Date: TBD`,
};

export default function MarkdownPage() {
  const { toast } = useToast();
  const [code, setCode] = useLocalStorage('markdown-code', markdownTemplates.readme);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // History
  const markdownHistory = useHistory<string>({ storageKey: 'markdown' });

  const handleTemplateChange = (template: string) => {
    const newCode = markdownTemplates[template as keyof typeof markdownTemplates] || '';
    setCode(newCode);
    markdownHistory.addToHistory(newCode, `Template: ${template}`);
  };

  const handleCopy = async () => {
    await copyToClipboard(code);
    toast({
      title: 'Copied!',
      description: 'Markdown copied to clipboard.',
    });
  };

  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportFormat = async (format: 'md' | 'html' | 'docx' | 'pdf' | 'txt') => {
    setExporting(format);
    try {
      const filename = 'document';
      
      switch (format) {
        case 'md':
          exportToMarkdown(code, filename);
          markdownHistory.addToHistory(code, 'Export .md');
          toast({ title: 'Exported!', description: 'Markdown file downloaded.' });
          break;
        case 'html':
          exportToHtml(code, filename);
          markdownHistory.addToHistory(code, 'Export .html');
          toast({ title: 'Exported!', description: 'HTML file downloaded.' });
          break;
        case 'docx':
          await exportToDocx(code, filename);
          markdownHistory.addToHistory(code, 'Export .docx');
          toast({ title: 'Exported!', description: 'Word document downloaded.' });
          break;
        case 'pdf':
          await exportToPdf(code, filename);
          markdownHistory.addToHistory(code, 'Export .pdf');
          toast({ title: 'Exported!', description: 'PDF file downloaded.' });
          break;
        case 'txt':
          exportToTxt(code, filename);
          markdownHistory.addToHistory(code, 'Export .txt');
          toast({ title: 'Exported!', description: 'Text file downloaded.' });
          break;
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: `Failed to export as ${format.toUpperCase()}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setExporting(null);
    }
  };

  const handleClear = () => {
    setCode('');
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const newCode = code + before + after;
    setCode(newCode);
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Markdown Editor</h1>
            <p className="text-sm text-muted-foreground">
              Write and preview Markdown with GFM support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShareButton
            title="Markdown Editor - DevTools"
            description="Write and preview Markdown with GFM support, export to .md file"
            hashtags={['DevTools', 'Markdown', 'Documentation', 'Writing']}
            content={code}
          />
          <Select onValueChange={handleTemplateChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blank">Blank</SelectItem>
              <SelectItem value="readme">README</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="changelog">Changelog</SelectItem>
              <SelectItem value="notes">Meeting Notes</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('**', '**')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('*', '*')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('\n- ')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('\n1. ')}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('[', '](url)')}>
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('![alt](', ')')}>
            <Image className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('`', '`')}>
            <Code className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('\n> ')}>
            <Quote className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertMarkdown('\n| Header | Header |\n|--------|--------|\n| Cell   | Cell   |\n')}>
            <Table className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        
        {/* Export Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={exporting !== null}>
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleExportFormat('md')}>
              <FileText className="h-4 w-4 mr-2" />
              Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportFormat('html')}>
              <FileCode className="h-4 w-4 mr-2" />
              HTML (.html)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExportFormat('docx')}>
              <FileType className="h-4 w-4 mr-2" />
              Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportFormat('pdf')}>
              <FileOutput className="h-4 w-4 mr-2" />
              PDF (.pdf)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExportFormat('txt')}>
              <FileText className="h-4 w-4 mr-2" />
              Plain Text (.txt)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button size="sm" onClick={() => setShowShareDialog(true)}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Editor and Preview */}
      <div className="grid gap-4" style={{ gridTemplateColumns: showSidebar ? '1fr 1fr' : '1fr' }}>
        {showSidebar && (
          <Card className="overflow-hidden">
            <MonacoEditor
              value={code}
              onChange={setCode}
              language="markdown"
              height="calc(100vh - 280px)"
            />
          </Card>
        )}
        <Card className="overflow-auto p-6" style={{ height: 'calc(100vh - 280px)' }}>
          <MarkdownPreview content={code} />
        </Card>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        content={code}
        type="markdown"
        title="Markdown Document"
      />

      {/* History FAB & Panel */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {showHistory && (
          <div className="w-80 mb-2">
            <HistoryPanel<string>
              history={markdownHistory.history}
              onSelect={(item) => {
                setCode(item.value);
              }}
              onRemove={(id) => markdownHistory.removeFromHistory(id)}
              onClear={() => markdownHistory.clearHistory()}
              renderItem={(item) => (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">{item.label || 'Document'}</span>
                  <code className="text-xs text-muted-foreground truncate">{item.value.substring(0, 30)}...</code>
                </div>
              )}
              renderPreview={(item) => item.value}
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
