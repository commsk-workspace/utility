'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { MermaidPreview, exportMermaidToSvg, exportMermaidToPng } from '@/components/editor/MermaidPreview';
import { MarkdownPreview } from '@/components/editor/MarkdownPreview';
import { PasswordDialog } from '@/components/share/PasswordDialog';
import { ShareDialog } from '@/components/share/ShareDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GitBranch,
  FileText,
  Braces,
  Database,
  Copy,
  Download,
  Edit,
  Eye,
  Save,
  Loader2,
  AlertCircle,
  Clock,
  FileImage,
  FileCode,
  Share2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard, downloadFile, downloadBlob, formatDate } from '@/lib/utils';

interface Document {
  id: string;
  type: string;
  title: string;
  content: string;
  language?: string;
  isPublic: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  mermaid: <GitBranch className="h-5 w-5" />,
  markdown: <FileText className="h-5 w-5" />,
  json: <Braces className="h-5 w-5" />,
  sql: <Database className="h-5 w-5" />,
};

const typeColors: Record<string, string> = {
  mermaid: 'bg-purple-500/10 text-purple-500',
  markdown: 'bg-blue-500/10 text-blue-500',
  json: 'bg-yellow-500/10 text-yellow-500',
  sql: 'bg-green-500/10 text-green-500',
};

export default function SharePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();

  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<'view' | 'edit'>('view');
  const [saving, setSaving] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      console.log('Fetching document ID:', id);
      
      const response = await fetch(`/api/documents/${id}`);
      const data = await response.json();
      
      console.log('API Response:', { status: response.status, data });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Document not found');
        } else if (response.status === 410) {
          setIsExpired(true);
          setError('This document has expired');
        } else if (response.status === 401) {
          // Password required
          setPendingMode('view');
          setShowPasswordDialog(true);
        } else {
          setError(data.error || 'Failed to load document');
        }
        return;
      }

      // Check if API wrapped response in { success, data }
      const document = data.data || data;
      
      console.log('Document loaded:', document);
      console.log('Content length:', document.content?.length || 0);
      console.log('Content preview:', document.content?.substring(0, 100));
      
      setDocument(document);
      setContent(document.content || '');
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordVerify = async (password: string, requestedMode: 'view' | 'edit') => {
    try {
      const response = await fetch(`/api/documents/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, mode: requestedMode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      // Fetch document with password
      const docResponse = await fetch(`/api/documents/${id}?password=${encodeURIComponent(password)}&mode=${requestedMode}`);
      const docData = await docResponse.json();

      if (!docResponse.ok) {
        throw new Error(docData.error || 'Failed to load document');
      }

      // Check if API wrapped response
      const document = docData.data || docData;

      setDocument(document);
      setContent(document.content || '');
      setMode(requestedMode);
      setShowPasswordDialog(false);
      setLoading(false);
    } catch (err) {
      throw err;
    }
  };

  const handleSave = async () => {
    if (!document) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      const updatedDoc = await response.json();
      setDocument(updatedDoc);
      toast({ title: 'Saved!', description: 'Document has been saved.' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(content);
    toast({ title: 'Copied!', description: 'Content copied to clipboard.' });
  };

  const handleDownload = () => {
    if (!document) return;
    const extension = document.type === 'markdown' ? 'md' : document.type;
    downloadFile(content, `${document.title}.${extension}`, 'text/plain');
    toast({ title: 'Downloaded!', description: 'File has been downloaded.' });
  };

  const handleExportSvg = async () => {
    if (!document || document.type !== 'mermaid') return;
    try {
      const svg = await exportMermaidToSvg(content);
      downloadFile(svg, `${document.title}.svg`, 'image/svg+xml');
      toast({ title: 'Exported!', description: 'SVG file downloaded.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export SVG',
        variant: 'destructive',
      });
    }
  };

  const handleExportPng = async () => {
    if (!document || document.type !== 'mermaid') return;
    try {
      const blob = await exportMermaidToPng(content);
      downloadBlob(blob, `${document.title}.png`);
      toast({ title: 'Exported!', description: 'PNG file downloaded.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export PNG',
        variant: 'destructive',
      });
    }
  };

  const handleEditMode = () => {
    if (document && !document.isPublic) {
      setPendingMode('edit');
      setShowPasswordDialog(true);
    } else {
      setMode('edit');
    }
  };

  if (loading && !showPasswordDialog) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center">
        <div className={`p-4 rounded-full ${isExpired ? 'bg-orange-500/10' : 'bg-destructive/10'}`}>
          {isExpired ? (
            <Clock className="h-10 w-10 text-orange-500" />
          ) : (
            <AlertCircle className="h-10 w-10 text-destructive" />
          )}
        </div>
        <h1 className="mt-4 text-2xl font-bold">{error}</h1>
        <p className="mt-2 text-muted-foreground">
          {isExpired
            ? 'The sharing link for this document has expired.'
            : 'The document you are looking for does not exist or has been deleted.'}
        </p>
        <Button className="mt-6" onClick={() => router.push('/')}>
          Go Home
        </Button>
      </div>
    );
  }

  if (!document) {
    return (
      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onVerify={handlePasswordVerify}
        mode={pendingMode}
      />
    );
  }

  const renderPreview = () => {
    switch (document.type) {
      case 'mermaid':
        return (
          <Card className="overflow-hidden bg-[#1e1e1e]">
            <MermaidPreview code={content} className="h-[calc(100vh-280px)]" />
          </Card>
        );
      case 'markdown':
        return (
          <Card className="overflow-auto p-6" style={{ height: 'calc(100vh - 280px)' }}>
            <MarkdownPreview content={content} />
          </Card>
        );
      default:
        return (
          <Card className="overflow-hidden">
            <MonacoEditor
              value={content}
              onChange={() => {}}
              language={document.language || document.type}
              height="calc(100vh - 280px)"
            />
          </Card>
        );
    }
  };

  const renderEditor = () => {
    return (
      <div className="grid gap-4" style={{ gridTemplateColumns: document.type === 'mermaid' || document.type === 'markdown' ? '1fr 1fr' : '1fr' }}>
        <Card className="overflow-hidden">
          <MonacoEditor
            value={content}
            onChange={setContent}
            language={document.language || document.type}
            height="calc(100vh - 280px)"
          />
        </Card>
        {document.type === 'mermaid' && (
          <Card className="overflow-hidden bg-[#1e1e1e]">
            <MermaidPreview code={content} className="h-[calc(100vh-280px)]" />
          </Card>
        )}
        {document.type === 'markdown' && (
          <Card className="overflow-auto p-6" style={{ height: 'calc(100vh - 280px)' }}>
            <MarkdownPreview content={content} />
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${typeColors[document.type] || 'bg-muted'}`}>
            {typeIcons[document.type] || <FileText className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Created {formatDate(document.createdAt)}</span>
              {document.expiresAt && (
                <>
                  <span>•</span>
                  <span>Expires {formatDate(document.expiresAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={mode === 'edit' ? 'default' : 'secondary'}>
            {mode === 'edit' ? (
              <>
                <Edit className="h-3 w-3 mr-1" />
                Editing
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Viewing
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {document.type === 'mermaid' && mode === 'view' && (
          <>
            <Button variant="outline" size="sm" onClick={handleExportSvg}>
              <FileCode className="h-4 w-4 mr-2" />
              Export SVG
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPng}>
              <FileImage className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
          </>
        )}
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowShareDialog(true)}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        {mode === 'view' ? (
          <Button size="sm" onClick={handleEditMode}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => setMode('view')}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      {mode === 'view' ? renderPreview() : renderEditor()}

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        content={content}
        type={document.type}
        title={document.title}
      />

      {/* Password Dialog */}
      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onVerify={handlePasswordVerify}
        mode={pendingMode}
      />
    </div>
  );
}
