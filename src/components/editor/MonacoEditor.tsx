'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import type { editor } from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  minimap?: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
}

export interface MonacoEditorRef {
  focus: () => void;
  getEditor: () => editor.IStandaloneCodeEditor | null;
  find: (query: string) => void;
  findNext: () => void;
  findPrevious: () => void;
  closeFindWidget: () => void;
}

export const MonacoEditor = forwardRef<MonacoEditorRef, MonacoEditorProps>(
  function MonacoEditor(
    {
      value,
      onChange,
      language = 'plaintext',
      readOnly = false,
      height = '500px',
      minimap = false,
      lineNumbers = true,
      wordWrap = true,
      fontSize = 14,
    }: MonacoEditorProps,
    ref
  ) {
    const { theme } = useTheme();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus();
      },
      getEditor: () => {
        return editorRef.current;
      },
      find: (query: string) => {
        if (editorRef.current && query) {
          const action = editorRef.current.getAction('actions.find');
          action?.run();
        }
      },
      findNext: () => {
        const action = editorRef.current?.getAction('editor.action.nextMatchFindAction');
        action?.run();
      },
      findPrevious: () => {
        const action = editorRef.current?.getAction('editor.action.previousMatchFindAction');
        action?.run();
      },
      closeFindWidget: () => {
        const action = editorRef.current?.getAction('closeFindWidget');
        action?.run();
      },
    }));

    const handleEditorDidMount: OnMount = (editorInstance) => {
      editorRef.current = editorInstance;
      editorInstance.focus();
    };

    const handleEditorChange = (value: string | undefined) => {
      onChange(value || '');
    };

    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.updateOptions({
          theme: theme === 'dark' ? 'vs-dark' : 'light',
        });
      }
    }, [theme]);

    return (
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        loading={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: minimap },
          lineNumbers: lineNumbers ? 'on' : 'off',
          wordWrap: wordWrap ? 'on' : 'off',
          fontSize,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'mouseover',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 16, bottom: 16 },
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: 'never',
            seedSearchStringFromSelection: 'always',
          },
        }}
      />
    );
  }
);
