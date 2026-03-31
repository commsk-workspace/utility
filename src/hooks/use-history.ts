'use client';

import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem<T = string> {
  id: string;
  value: T;
  label?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface UseHistoryOptions {
  maxItems?: number;
  storageKey: string;
}

export function useHistory<T = string>(options: UseHistoryOptions) {
  const { maxItems = 50, storageKey } = options;
  const fullKey = `devtools-history-${storageKey}`;
  
  const [history, setHistory] = useState<HistoryItem<T>[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(fullKey);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem<T>[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
    setIsLoaded(true);
  }, [fullKey]);

  // Save to localStorage when history changes
  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(fullKey, JSON.stringify(history));
      } catch (error) {
        console.error('Error saving history:', error);
      }
    }
  }, [history, fullKey, isLoaded]);

  const addToHistory = useCallback((value: T, label?: string, metadata?: Record<string, unknown>) => {
    const newItem: HistoryItem<T> = {
      id: crypto.randomUUID(),
      value,
      label,
      timestamp: Date.now(),
      metadata,
    };

    setHistory(prev => {
      // Remove duplicate if exists (by value)
      const filtered = prev.filter(item => 
        JSON.stringify(item.value) !== JSON.stringify(value)
      );
      // Add new item at the beginning, limit to maxItems
      return [newItem, ...filtered].slice(0, maxItems);
    });
  }, [maxItems]);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getLatest = useCallback((count: number = 10) => {
    return history.slice(0, count);
  }, [history]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getLatest,
    isLoaded,
  };
}

// Specific history types for different tools
export interface PasswordHistoryItem {
  password: string;
  length: number;
  options: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

export interface HashHistoryItem {
  input: string;
  output: string;
  algorithm: string;
}

export interface ConversionHistoryItem {
  input: string;
  output: string;
  fromFormat: string;
  toFormat: string;
}

export interface JsonHistoryItem {
  input: string;
  output: string;
  action: string;
}

export interface TextHistoryItem {
  input: string;
  output: string;
  action: string;
}

export interface ColorHistoryItem {
  color: string;
  format: string;
}

export interface SqlHistoryItem {
  input: string;
  output: string;
  action: string;
}

export interface MermaidHistoryItem {
  code: string;
  title?: string;
}

export interface MarkdownHistoryItem {
  content: string;
  title?: string;
}

export interface Base64HistoryItem {
  input: string;
  output: string;
  mode: 'encode' | 'decode';
}

export interface JwtHistoryItem {
  token: string;
}

export interface YamlHistoryItem {
  input: string;
  output: string;
  type: 'yaml-to-json' | 'json-to-yaml';
}

export interface DiffHistoryItem {
  left: string;
  right: string;
  title?: string;
}

export interface RegexHistoryItem {
  pattern: string;
  flags: string;
  testString: string;
}

export interface UrlHistoryItem {
  url: string;
  action: string;
}

export interface CsvHistoryItem {
  input: string;
  output: string;
  action: string;
}

