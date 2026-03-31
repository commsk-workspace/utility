/**
 * Export search components and utilities
 */
export { SearchBox } from './SearchBox';
export type { SearchMatch, SearchOptions, SearchResult } from '@/lib/tools/search-tools';
export {
  findAllMatches,
  highlightMatches,
  getNextMatchIndex,
  replaceMatches,
} from '@/lib/tools/search-tools';
