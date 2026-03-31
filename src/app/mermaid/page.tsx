'use client';

import { useState, useEffect } from 'react';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { MermaidPreview, exportMermaidToPng, exportMermaidToSvg } from '@/components/editor/MermaidPreview';
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
  GitBranch,
  Share2,
  Download,
  FileImage,
  FileCode,
  Copy,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Maximize2,
  Minimize2,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { copyToClipboard, downloadFile, downloadBlob } from '@/lib/utils';
import { useHistory, type MermaidHistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { ShareButton } from '@/components/share/ShareButton';

const diagramTemplates = {
  flowchart: `flowchart TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]
    D --> B`,
  sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop HealthCheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,
  classDiagram: `classDiagram
    class Animal {
        +int age
        +String gender
        +isMammal()
        +mate()
    }
    class Duck {
        +String beakColor
        +swim()
        +quack()
    }
    Animal <|-- Duck`,
  stateDiagram: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
  erDiagram: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER ||--|{ LINE-ITEM : contains
    ORDER {
        int orderNumber
        string deliveryAddress
    }
    LINE-ITEM {
        string productCode
        int quantity
        float pricePerUnit
    }`,
  gantt: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2024-01-01, 30d
    Another task     :after a1, 20d
    section Another
    Task in sec      :2024-01-12, 12d
    another task     :24d`,
  pie: `pie showData
    title Key elements in Product X
    "Calcium" : 42.96
    "Potassium" : 50.05
    "Magnesium" : 10.01
    "Iron" : 5`,
  mindmap: `mindmap
  root((DevTools))
    Origins
      Long history
      Popularization
    Research
      On effectiveness
      On features
    Tools
      Mermaid
      JSON
      SQL`,
};

export default function MermaidPage() {
  const { toast } = useToast();
  const [code, setCode] = useLocalStorage('mermaid-code', diagramTemplates.flowchart);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // History
  const mermaidHistory = useHistory<MermaidHistoryItem>({ storageKey: 'mermaid' });

  const handleTemplateChange = (template: string) => {
    const newCode = diagramTemplates[template as keyof typeof diagramTemplates] || '';
    setCode(newCode);
    mermaidHistory.addToHistory({
      code: newCode,
      title: `Template: ${template}`,
    });
  };

  const handleCopy = async () => {
    await copyToClipboard(code);
    toast({
      title: 'Copied!',
      description: 'Mermaid code copied to clipboard.',
    });
  };

  const handleExportSvg = async () => {
    try {
      const svg = await exportMermaidToSvg(code);
      downloadFile(svg, 'diagram.svg', 'image/svg+xml');
      mermaidHistory.addToHistory({
        code: code,
        title: 'Export SVG',
      });
      toast({
        title: 'Exported!',
        description: 'SVG file downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export SVG',
        variant: 'destructive',
      });
    }
  };

  const handleExportPng = async () => {
    try {
      const blob = await exportMermaidToPng(code);
      downloadBlob(blob, 'diagram.png');
      mermaidHistory.addToHistory({
        code: code,
        title: 'Export PNG',
      });
      toast({
        title: 'Exported!',
        description: 'PNG file downloaded.',
      });
    } catch (error) {
      console.error('PNG Export Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export PNG',
        variant: 'destructive',
      });
    }
  };

  const handleClear = () => {
    setCode('');
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <GitBranch className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mermaid Editor</h1>
            <p className="text-sm text-muted-foreground">
              Create and preview Mermaid diagrams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShareButton
            title="Mermaid Editor - DevTools"
            description="Create flowcharts, sequence diagrams, class diagrams, and more with Mermaid"
            hashtags={['DevTools', 'Mermaid', 'Diagrams', 'Flowchart']}
            content={code}
          />
          <Select onValueChange={handleTemplateChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flowchart">Flowchart</SelectItem>
              <SelectItem value="sequence">Sequence Diagram</SelectItem>
              <SelectItem value="classDiagram">Class Diagram</SelectItem>
              <SelectItem value="stateDiagram">State Diagram</SelectItem>
              <SelectItem value="erDiagram">ER Diagram</SelectItem>
              <SelectItem value="gantt">Gantt Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="mindmap">Mind Map</SelectItem>
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
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Code
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportSvg}>
          <FileCode className="h-4 w-4 mr-2" />
          Export SVG
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPng}>
          <FileImage className="h-4 w-4 mr-2" />
          Export PNG
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
          <Maximize2 className="h-4 w-4 mr-2" />
          Fullscreen
        </Button>
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
        <Card className="overflow-hidden bg-[#1e1e1e]">
          <MermaidPreview
            code={code}
            className="h-[calc(100vh-280px)]"
          />
        </Card>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        content={code}
        type="mermaid"
        title="Mermaid Diagram"
      />

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-purple-500" />
                Mermaid Diagram - Fullscreen
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportSvg}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Export SVG
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPng}>
                  <FileImage className="h-4 w-4 mr-2" />
                  Export PNG
                </Button>
                <Button variant="outline" size="icon" onClick={() => setIsFullscreen(false)}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Fullscreen Preview */}
            <div className="flex-1 bg-[#1e1e1e] overflow-auto">
              <MermaidPreview
                code={code}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* History FAB & Panel */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {/* History Panel */}
        {showHistory && (
          <div className="w-80 mb-2">
            <HistoryPanel<MermaidHistoryItem>
              history={mermaidHistory.history}
              onSelect={(item) => {
                setCode(item.value.code);
              }}
              onRemove={(id) => mermaidHistory.removeFromHistory(id)}
              onClear={() => mermaidHistory.clearHistory()}
              renderItem={(item) => (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">{item.value.title || 'Diagram'}</span>
                  <code className="text-xs text-muted-foreground truncate">{item.value.code.substring(0, 30)}...</code>
                </div>
              )}
              renderPreview={(item) => item.value.code}
            />
          </div>
        )}
        
        {/* FAB Button */}
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
