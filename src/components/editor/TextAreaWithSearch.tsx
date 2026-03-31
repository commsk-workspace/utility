'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { SearchBox } from '@/components/editor/SearchBox';
import { findAllMatches, SearchMatch } from '@/lib/tools/search-tools';
import { cn } from '@/lib/utils';

interface TextAreaWithSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  readOnly?: boolean;
}

export function TextAreaWithSearch({
  value,
  onChange,
  placeholder,
  className,
  rows = 10,
  readOnly = false,
}: TextAreaWithSearchProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSearch = useCallback(
    (query: string, options: { caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }) => {
      if (!query) {
        setMatches([]);
        setCurrentMatchIndex(-1);
        return;
      }

      const result = findAllMatches(value, query, options);
      setMatches(result.matches);
      setCurrentMatchIndex(result.matches.length > 0 ? 0 : -1);
    },
    [value]
  );

  const handleNavigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (matches.length === 0) return;

      let newIndex: number;
      if (direction === 'next') {
        newIndex = currentMatchIndex >= matches.length - 1 ? 0 : currentMatchIndex + 1;
      } else {
        newIndex = currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1;
      }

      setCurrentMatchIndex(newIndex);

      // Scroll to match position in textarea
      if (textareaRef.current && matches[newIndex]) {
        const match = matches[newIndex];
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(match.index, match.index + match.length);
        
        // Scroll into view
        const lineHeight = 20; // approximate
        const scrollTop = (match.line - 1) * lineHeight;
        textareaRef.current.scrollTop = Math.max(0, scrollTop - 100);
      }
    },
    [matches, currentMatchIndex]
  );

  // Keyboard shortcut: Ctrl+F to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Re-search when value changes
  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery, {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      });
    }
  }, [value, searchQuery, handleSearch]);

  return (
    <div className="space-y-2">
      {showSearch && (
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          onNavigate={handleNavigate}
          onClose={() => {
            setShowSearch(false);
            setSearchQuery('');
            setMatches([]);
            setCurrentMatchIndex(-1);
          }}
          totalMatches={matches.length}
          currentMatch={currentMatchIndex}
        />
      )}

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn('font-mono', className)}
          rows={rows}
          readOnly={readOnly}
        />
        
        {!showSearch && !readOnly && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setShowSearch(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Search (Ctrl+F)"
            >
              Press Ctrl+F to search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
