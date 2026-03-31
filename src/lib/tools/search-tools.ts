export interface SearchMatch {
  index: number;
  length: number;
  text: string;
  line: number;
  column: number;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  useRegex?: boolean;
}

export interface SearchResult {
  matches: SearchMatch[];
  totalMatches: number;
}

/**
 * Find all matches in text
 */
export function findAllMatches(
  text: string,
  query: string,
  options: SearchOptions = {}
): SearchResult {
  const matches: SearchMatch[] = [];
  
  if (!query || !text) {
    return { matches: [], totalMatches: 0 };
  }

  try {
    let pattern: RegExp;

    if (options.useRegex) {
      // Use regex pattern
      const flags = options.caseSensitive ? 'g' : 'gi';
      pattern = new RegExp(query, flags);
    } else {
      // Escape special regex characters
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      if (options.wholeWord) {
        // Match whole word only
        const flags = options.caseSensitive ? 'g' : 'gi';
        pattern = new RegExp(`\\b${escapedQuery}\\b`, flags);
      } else {
        // Simple text search
        const flags = options.caseSensitive ? 'g' : 'gi';
        pattern = new RegExp(escapedQuery, flags);
      }
    }

    // Find all matches
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const index = match.index;
      const matchText = match[0];
      
      // Calculate line and column
      const beforeMatch = text.substring(0, index);
      const lines = beforeMatch.split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      matches.push({
        index,
        length: matchText.length,
        text: matchText,
        line,
        column,
      });

      // Prevent infinite loop on zero-length matches
      if (match.index === pattern.lastIndex) {
        pattern.lastIndex++;
      }
    }

    return {
      matches,
      totalMatches: matches.length,
    };
  } catch (error) {
    // Invalid regex or other error
    return { matches: [], totalMatches: 0 };
  }
}

/**
 * Highlight matches in text with HTML
 */
export function highlightMatches(
  text: string,
  matches: SearchMatch[],
  className: string = 'bg-yellow-200 dark:bg-yellow-600'
): string {
  if (matches.length === 0) return text;

  // Sort matches by index in reverse order
  const sortedMatches = [...matches].sort((a, b) => b.index - a.index);

  let result = text;
  
  // Replace from end to start to maintain indices
  for (const match of sortedMatches) {
    const before = result.substring(0, match.index);
    const highlighted = result.substring(match.index, match.index + match.length);
    const after = result.substring(match.index + match.length);
    
    result = `${before}<mark class="${className}">${highlighted}</mark>${after}`;
  }

  return result;
}

/**
 * Navigate to next/previous match
 */
export function getNextMatchIndex(
  currentIndex: number,
  totalMatches: number,
  direction: 'next' | 'prev'
): number {
  if (totalMatches === 0) return -1;

  if (direction === 'next') {
    return currentIndex >= totalMatches - 1 ? 0 : currentIndex + 1;
  } else {
    return currentIndex <= 0 ? totalMatches - 1 : currentIndex - 1;
  }
}

/**
 * Replace matches in text
 */
export function replaceMatches(
  text: string,
  matches: SearchMatch[],
  replacement: string,
  replaceAll: boolean = false
): string {
  if (matches.length === 0) return text;

  if (!replaceAll) {
    // Replace only first match
    const match = matches[0];
    return (
      text.substring(0, match.index) +
      replacement +
      text.substring(match.index + match.length)
    );
  }

  // Replace all matches from end to start
  const sortedMatches = [...matches].sort((a, b) => b.index - a.index);
  let result = text;

  for (const match of sortedMatches) {
    result =
      result.substring(0, match.index) +
      replacement +
      result.substring(match.index + match.length);
  }

  return result;
}
