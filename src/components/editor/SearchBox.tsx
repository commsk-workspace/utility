'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  CaseSensitive,
  WholeWord,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string, options: SearchOptions) => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  onClose?: () => void;
  totalMatches?: number;
  currentMatch?: number;
  className?: string;
  showOptions?: boolean;
}

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export function SearchBox({
  value,
  onChange,
  onSearch,
  onNavigate,
  onClose,
  totalMatches = 0,
  currentMatch = -1,
  className,
  showOptions = true,
}: SearchBoxProps) {
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onNavigate('prev');
      } else {
        onNavigate('next');
      }
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  const toggleOption = (key: keyof SearchOptions) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: !prev[key] };
      // Trigger search with new options
      setTimeout(() => onSearch(value, newOptions), 0);
      return newOptions;
    });
  };

  // Trigger search when value changes
  useEffect(() => {
    onSearch(value, options);
  }, [value]);

  const matchText =
    totalMatches === 0
      ? 'No matches'
      : `${currentMatch + 1} of ${totalMatches}`;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-3 border rounded-lg bg-background shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find in text..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-4"
            autoFocus
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('prev')}
            disabled={totalMatches === 0}
            title="Previous match (Shift+Enter)"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('next')}
            disabled={totalMatches === 0}
            title="Next match (Enter)"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <Badge variant={totalMatches > 0 ? 'default' : 'secondary'}>
          {matchText}
        </Badge>

        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} title="Close (Esc)">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showOptions && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Checkbox
              id="case-sensitive"
              checked={options.caseSensitive}
              onCheckedChange={() => toggleOption('caseSensitive')}
            />
            <Label
              htmlFor="case-sensitive"
              className="flex items-center gap-1 cursor-pointer text-xs"
            >
              <CaseSensitive className="h-3 w-3" />
              Case sensitive
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="whole-word"
              checked={options.wholeWord}
              onCheckedChange={() => toggleOption('wholeWord')}
            />
            <Label
              htmlFor="whole-word"
              className="flex items-center gap-1 cursor-pointer text-xs"
            >
              <WholeWord className="h-3 w-3" />
              Whole word
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="use-regex"
              checked={options.useRegex}
              onCheckedChange={() => toggleOption('useRegex')}
            />
            <Label
              htmlFor="use-regex"
              className="cursor-pointer text-xs"
            >
              .*  Regex
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
