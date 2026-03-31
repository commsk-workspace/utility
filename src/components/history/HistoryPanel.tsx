'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { History, Trash2, Copy, Clock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';
import type { HistoryItem } from '@/hooks/use-history';

interface HistoryPanelProps<T> {
  history: HistoryItem<T>[];
  onSelect: (item: HistoryItem<T>) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  renderItem: (item: HistoryItem<T>) => React.ReactNode;
  renderPreview?: (item: HistoryItem<T>) => string;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function HistoryPanel<T>({
  history,
  onSelect,
  onRemove,
  onClear,
  renderItem,
  renderPreview,
  title = 'History',
  emptyMessage = 'No history yet',
  className = '',
}: HistoryPanelProps<T>) {
  const { toast } = useToast();

  const handleCopy = async (item: HistoryItem<T>) => {
    const text = renderPreview ? renderPreview(item) : String(item.value);
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            {title}
            {history.length > 0 && (
              <span className="text-xs text-muted-foreground">({history.length})</span>
            )}
          </CardTitle>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear History</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to clear all history? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClear}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            {emptyMessage}
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group relative p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <div className="pr-16">
                    {renderItem(item)}
                  </div>
                  <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(item.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    {formatTime(item.timestamp)}
                    {item.label && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Compact inline history for smaller spaces
interface InlineHistoryProps<T> {
  history: HistoryItem<T>[];
  onSelect: (item: HistoryItem<T>) => void;
  renderLabel: (item: HistoryItem<T>) => string;
  maxVisible?: number;
}

export function InlineHistory<T>({
  history,
  onSelect,
  renderLabel,
  maxVisible = 5,
}: InlineHistoryProps<T>) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      <span className="text-xs text-muted-foreground py-1">Recent:</span>
      {history.slice(0, maxVisible).map((item) => (
        <Button
          key={item.id}
          variant="outline"
          size="sm"
          className="h-6 text-xs px-2"
          onClick={() => onSelect(item)}
        >
          {renderLabel(item)}
        </Button>
      ))}
    </div>
  );
}
