// Text Tools Utility Functions

type ToolResult<T> = { success: boolean; data?: T; error?: string };

// Case Converters
export type CaseType = 
  | 'camelCase'
  | 'PascalCase'
  | 'snake_case'
  | 'kebab-case'
  | 'CONSTANT_CASE'
  | 'lowercase'
  | 'UPPERCASE'
  | 'Title Case'
  | 'Sentence case'
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'snake'
  | 'kebab'
  | 'pascal';

export const caseTypes: { value: CaseType; label: string; example: string }[] = [
  { value: 'camelCase', label: 'camelCase', example: 'helloWorld' },
  { value: 'PascalCase', label: 'PascalCase', example: 'HelloWorld' },
  { value: 'snake_case', label: 'snake_case', example: 'hello_world' },
  { value: 'kebab-case', label: 'kebab-case', example: 'hello-world' },
  { value: 'CONSTANT_CASE', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  { value: 'lowercase', label: 'lowercase', example: 'hello world' },
  { value: 'UPPERCASE', label: 'UPPERCASE', example: 'HELLO WORLD' },
  { value: 'Title Case', label: 'Title Case', example: 'Hello World' },
  { value: 'Sentence case', label: 'Sentence case', example: 'Hello world' },
];

function splitIntoWords(text: string): string[] {
  // Split by common delimiters and camelCase
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // XMLParser -> XML Parser
    .split(/[\s_\-]+/)
    .filter(word => word.length > 0);
}

export function convertCase(text: string, targetCase: CaseType): string {
  const words = splitIntoWords(text);
  
  switch (targetCase) {
    case 'camelCase':
      return words
        .map((word, index) => 
          index === 0 
            ? word.toLowerCase() 
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('');
    
    case 'PascalCase':
      return words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    
    case 'snake_case':
      return words.map(word => word.toLowerCase()).join('_');
    
    case 'kebab-case':
      return words.map(word => word.toLowerCase()).join('-');
    
    case 'CONSTANT_CASE':
      return words.map(word => word.toUpperCase()).join('_');
    
    case 'lowercase':
      return words.map(word => word.toLowerCase()).join(' ');
    
    case 'UPPERCASE':
      return words.map(word => word.toUpperCase()).join(' ');
    
    case 'Title Case':
      return words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    
    case 'Sentence case':
      return words
        .map((word, index) => 
          index === 0 
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase()
        )
        .join(' ');
    
    default:
      return text;
  }
}

// Regex Tester
export interface RegexMatch {
  match: string;
  index: number;
  length: number;
  groups: string[];
}

export interface RegexResult {
  isValid: boolean;
  matches: RegexMatch[];
  matchCount: number;
  error?: string;
}

function testRegexOld(pattern: string, flags: string, text: string): RegexResult {
  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];
    
    if (flags.includes('g')) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.slice(1),
        });
        
        // Prevent infinite loop for zero-length matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(text);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.slice(1),
        });
      }
    }
    
    return {
      isValid: true,
      matches,
      matchCount: matches.length,
    };
  } catch (error) {
    return {
      isValid: false,
      matches: [],
      matchCount: 0,
      error: error instanceof Error ? error.message : 'Invalid regex',
    };
  }
}

// Text Diff
export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
  lineNumber1?: number;
  lineNumber2?: number;
}

export function computeDiff(text1: string, text2: string): DiffLine[] {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const result: DiffLine[] = [];
  
  // Simple LCS-based diff
  const lcs = longestCommonSubsequence(lines1, lines2);
  
  let i = 0, j = 0, k = 0;
  let lineNum1 = 1, lineNum2 = 1;
  
  while (i < lines1.length || j < lines2.length) {
    if (k < lcs.length && i < lines1.length && lines1[i] === lcs[k]) {
      if (j < lines2.length && lines2[j] === lcs[k]) {
        result.push({
          type: 'unchanged',
          content: lcs[k],
          lineNumber1: lineNum1++,
          lineNumber2: lineNum2++,
        });
        i++;
        j++;
        k++;
      } else {
        result.push({
          type: 'added',
          content: lines2[j],
          lineNumber2: lineNum2++,
        });
        j++;
      }
    } else if (i < lines1.length) {
      result.push({
        type: 'removed',
        content: lines1[i],
        lineNumber1: lineNum1++,
      });
      i++;
    } else if (j < lines2.length) {
      result.push({
        type: 'added',
        content: lines2[j],
        lineNumber2: lineNum2++,
      });
      j++;
    }
  }
  
  return result;
}

function longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
}

// Lorem Ipsum Generator
const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

export type LoremType = 'words' | 'sentences' | 'paragraphs';

export function generateLorem(count: number, type: LoremType): string {
  switch (type) {
    case 'words':
      return generateLoremWords(count);
    case 'sentences':
      return generateLoremSentences(count);
    case 'paragraphs':
      return generateLoremParagraphs(count);
    default:
      return '';
  }
}

function generateLoremWords(count: number): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
  }
  return words.join(' ');
}

function generateLoremSentences(count: number): string {
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    const wordCount = Math.floor(Math.random() * 10) + 5; // 5-15 words
    const sentence = generateLoremWords(wordCount);
    sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
  }
  return sentences.join(' ');
}

function generateLoremParagraphs(count: number): string {
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-7 sentences
    paragraphs.push(generateLoremSentences(sentenceCount));
  }
  return paragraphs.join('\n\n');
}

// Text Statistics
export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: string;
}

export function getTextStats(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
  const lines = text.split('\n').length;
  
  // Average reading speed is 200-250 words per minute
  const minutes = Math.ceil(words / 200);
  const readingTime = minutes < 1 ? 'Less than a minute' : `${minutes} min read`;
  
  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingTime,
  };
}

// Find and Replace
export function findAndReplace(
  text: string,
  find: string,
  replace: string,
  options: { caseSensitive: boolean; regex: boolean; wholeWord: boolean }
): { result: string; count: number } {
  let pattern: RegExp;
  let flags = 'g';
  
  if (!options.caseSensitive) {
    flags += 'i';
  }
  
  if (options.regex) {
    try {
      pattern = new RegExp(find, flags);
    } catch {
      return { result: text, count: 0 };
    }
  } else {
    let escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (options.wholeWord) {
      escaped = `\\b${escaped}\\b`;
    }
    pattern = new RegExp(escaped, flags);
  }
  
  let count = 0;
  const result = text.replace(pattern, () => {
    count++;
    return replace;
  });
  
  return { result, count };
}

// ===== NEW WRAPPER FUNCTIONS =====

export function testRegex(pattern: string, text: string, flags: string = 'g'): ToolResult<{ isMatch: boolean; matches: string[] }> {
  try {
    const regex = new RegExp(pattern, flags);
    const matches: string[] = [];
    
    if (flags.includes('g')) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push(match[0]);
        if (match[0].length === 0) regex.lastIndex++;
      }
    } else {
      const match = regex.exec(text);
      if (match) matches.push(match[0]);
    }
    
    return { success: true, data: { isMatch: matches.length > 0, matches } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid regex' };
  }
}

export function changeCase(text: string, targetCase: CaseType): ToolResult<string> {
  try {
    let result: string;
    const words = text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .split(/[\s_\-]+/)
      .filter(word => word.length > 0);
    
    switch (targetCase) {
      case 'upper':
      case 'UPPERCASE':
        result = text.toUpperCase();
        break;
      case 'lower':
      case 'lowercase':
        result = text.toLowerCase();
        break;
      case 'title':
      case 'Title Case':
        result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        break;
      case 'sentence':
      case 'Sentence case':
        result = words.map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join(' ');
        break;
      case 'camel':
      case 'camelCase':
        result = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        break;
      case 'pascal':
      case 'PascalCase':
        result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        break;
      case 'snake':
      case 'snake_case':
        result = words.map(w => w.toLowerCase()).join('_');
        break;
      case 'kebab':
      case 'kebab-case':
        result = words.map(w => w.toLowerCase()).join('-');
        break;
      case 'CONSTANT_CASE':
        result = words.map(w => w.toUpperCase()).join('_');
        break;
      default:
        result = text;
    }
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to change case' };
  }
}

export function generateLoremIpsum(count: number, type: 'paragraphs' | 'sentences' | 'words'): ToolResult<string> {
  const loremWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
  
  try {
    let result: string;
    
    if (type === 'words') {
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        words.push(loremWords[i % loremWords.length]);
      }
      result = words.join(' ');
    } else if (type === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        const wordCount = 8 + Math.floor(Math.random() * 10);
        const sentenceWords: string[] = [];
        for (let j = 0; j < wordCount; j++) {
          sentenceWords.push(loremWords[(i * 7 + j) % loremWords.length]);
        }
        sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
        sentences.push(sentenceWords.join(' ') + '.');
      }
      result = sentences.join(' ');
    } else {
      const paragraphs: string[] = [];
      for (let i = 0; i < count; i++) {
        const sentenceCount = 4 + Math.floor(Math.random() * 4);
        const sentences: string[] = [];
        for (let j = 0; j < sentenceCount; j++) {
          const wordCount = 8 + Math.floor(Math.random() * 10);
          const sentenceWords: string[] = [];
          for (let k = 0; k < wordCount; k++) {
            sentenceWords.push(loremWords[(i * 50 + j * 10 + k) % loremWords.length]);
          }
          sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
          sentences.push(sentenceWords.join(' ') + '.');
        }
        paragraphs.push(sentences.join(' '));
      }
      result = paragraphs.join('\n\n');
    }
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate lorem ipsum' };
  }
}

export function countText(text: string): TextStats {
  const sentences = text ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.ceil(words / 200);
  const readingTime = minutes < 1 ? 'Less than a minute' : `${minutes} min read`;
  
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words,
    lines: text ? text.split('\n').length : 0,
    paragraphs: text ? text.split(/\n\s*\n/).filter(p => p.trim()).length || 1 : 0,
    sentences,
    readingTime,
  };
}

export function compareText(text1: string, text2: string): ToolResult<{ same: boolean; diff: string }> {
  try {
    const same = text1 === text2;
    return { success: true, data: { same, diff: same ? 'Texts are identical' : 'Texts are different' } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to compare' };
  }
}

export function escapeString(text: string): ToolResult<string> {
  try {
    const escaped = text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return { success: true, data: escaped };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to escape' };
  }
}

export function unescapeString(text: string): ToolResult<string> {
  try {
    const unescaped = text
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    return { success: true, data: unescaped };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to unescape' };
  }
}

export function removeExtraSpaces(text: string): ToolResult<string> {
  try {
    const result = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove spaces' };
  }
}

export function removeDuplicateLines(text: string): ToolResult<string> {
  try {
    const lines = text.split('\n');
    const unique = [...new Set(lines)];
    return { success: true, data: unique.join('\n') };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove duplicates' };
  }
}
