'use client';

import { marked, Marked } from 'marked';
import { downloadFile } from '@/lib/utils';

// Create a configured marked instance
const markedInstance = new Marked({
  gfm: true,
  breaks: true,
});

// Convert markdown to HTML using marked library
export function markdownToHtml(markdown: string): string {
  if (!markdown || markdown.trim() === '') {
    return '<p>No content</p>';
  }
  try {
    const result = markedInstance.parse(markdown);
    return typeof result === 'string' ? result : '';
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return `<p>${markdown}</p>`;
  }
}

// CSS styles for exported documents
const documentStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    color: #333;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.25;
  }
  h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1em; }
  h5 { font-size: 0.875em; }
  h6 { font-size: 0.85em; color: #666; }
  p { margin-bottom: 1em; }
  code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
  }
  pre {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 1em;
  }
  pre code {
    background: none;
    padding: 0;
    font-size: 0.85em;
    line-height: 1.45;
  }
  blockquote {
    border-left: 4px solid #ddd;
    margin: 1em 0;
    padding: 0.5em 1em;
    color: #666;
    background-color: #f9f9f9;
  }
  blockquote p {
    margin: 0;
  }
  ul, ol {
    margin-bottom: 1em;
    padding-left: 2em;
  }
  li { margin-bottom: 0.25em; }
  li > ul, li > ol { margin-bottom: 0; }
  a { color: #0366d6; text-decoration: none; }
  a:hover { text-decoration: underline; }
  img { max-width: 100%; height: auto; }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1em;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
  }
  th { background-color: #f4f4f4; font-weight: 600; }
  tr:nth-child(even) { background-color: #f9f9f9; }
  hr {
    border: none;
    border-top: 1px solid #eee;
    margin: 2em 0;
  }
  del { color: #999; text-decoration: line-through; }
  strong { font-weight: 600; }
  em { font-style: italic; }
  .task-list-item { list-style-type: none; }
  .task-list-item input { margin-right: 0.5em; }
`;

// Generate full HTML document with styles
export function generateHtmlDocument(markdown: string, title: string = 'Document'): string {
  const content = markdownToHtml(markdown);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${documentStyles}</style>
</head>
<body>
  ${content}
</body>
</html>`;
}

// Export to HTML file
export function exportToHtml(markdown: string, filename: string = 'document'): void {
  console.log('exportToHtml called with markdown length:', markdown?.length);
  console.log('markdown content preview:', markdown?.substring(0, 100));
  const html = generateHtmlDocument(markdown, filename);
  console.log('Generated HTML length:', html?.length);
  downloadFile(html, `${filename}.html`, 'text/html');
}

// Export to plain text (strip markdown syntax)
export function exportToTxt(markdown: string, filename: string = 'document'): void {
  const plainText = markdown
    // Remove headers syntax
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/___(.+?)___/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove strikethrough
    .replace(/~~(.+?)~~/g, '$1')
    // Remove code blocks markers
    .replace(/```\w*\n?/g, '')
    // Remove inline code markers
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquote markers
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^---$/gm, '---')
    .replace(/^\*\*\*$/gm, '---')
    // Convert links to text with URL
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    // Remove image syntax
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[Image: $1]')
    // Clean up list markers
    .replace(/^\s*[-*+]\s+/gm, '• ')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n');

  downloadFile(plainText, `${filename}.txt`, 'text/plain');
}

// Export to DOCX using html-docx-js-typescript
export async function exportToDocx(markdown: string, filename: string = 'document'): Promise<void> {
  try {
    const { asBlob } = await import('html-docx-js-typescript');
    const html = generateHtmlDocument(markdown, filename);
    
    // Convert HTML to DOCX blob
    const docxBlob = await asBlob(html, {
      orientation: 'portrait',
      margins: { top: 720, right: 720, bottom: 720, left: 720 },
    }) as Blob;
    
    // Download the file
    const url = URL.createObjectURL(docxBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    throw new Error('Failed to export to DOCX');
  }
}

// Export to PDF using html2pdf.js
export async function exportToPdf(markdown: string, filename: string = 'document'): Promise<void> {
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    const content = markdownToHtml(markdown);
    
    // Create a styled container for PDF
    const container = document.createElement('div');
    container.innerHTML = content;
    container.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      max-width: 100%;
    `;
    
    // Apply inline styles to elements
    container.querySelectorAll('h1').forEach(el => {
      (el as HTMLElement).style.cssText = 'font-size: 1.8em; font-weight: 600; margin: 1em 0 0.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em;';
    });
    container.querySelectorAll('h2').forEach(el => {
      (el as HTMLElement).style.cssText = 'font-size: 1.4em; font-weight: 600; margin: 1em 0 0.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em;';
    });
    container.querySelectorAll('h3').forEach(el => {
      (el as HTMLElement).style.cssText = 'font-size: 1.2em; font-weight: 600; margin: 1em 0 0.5em;';
    });
    container.querySelectorAll('p').forEach(el => {
      (el as HTMLElement).style.cssText = 'margin-bottom: 1em;';
    });
    container.querySelectorAll('pre').forEach(el => {
      (el as HTMLElement).style.cssText = 'background-color: #f6f8fa; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 0.85em;';
    });
    container.querySelectorAll('code').forEach(el => {
      if (!(el as HTMLElement).closest('pre')) {
        (el as HTMLElement).style.cssText = 'background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em;';
      }
    });
    container.querySelectorAll('blockquote').forEach(el => {
      (el as HTMLElement).style.cssText = 'border-left: 4px solid #ddd; margin: 1em 0; padding: 0.5em 1em; color: #666; background-color: #f9f9f9;';
    });
    container.querySelectorAll('ul, ol').forEach(el => {
      (el as HTMLElement).style.cssText = 'margin-bottom: 1em; padding-left: 2em;';
    });
    container.querySelectorAll('table').forEach(el => {
      (el as HTMLElement).style.cssText = 'border-collapse: collapse; width: 100%; margin-bottom: 1em;';
    });
    container.querySelectorAll('th, td').forEach(el => {
      (el as HTMLElement).style.cssText = 'border: 1px solid #ddd; padding: 8px 12px; text-align: left;';
    });
    container.querySelectorAll('th').forEach(el => {
      (el as HTMLElement).style.cssText += 'background-color: #f4f4f4; font-weight: 600;';
    });
    container.querySelectorAll('a').forEach(el => {
      (el as HTMLElement).style.cssText = 'color: #0366d6;';
    });

    // Temporarily add to DOM
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    document.body.appendChild(container);

    // Generate PDF
    const options = {
      margin: 15,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    await html2pdf().set(options).from(container).save();
    
    // Clean up
    document.body.removeChild(container);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
}

// Export to Markdown (original function)
export function exportToMarkdown(markdown: string, filename: string = 'document'): void {
  downloadFile(markdown, `${filename}.md`, 'text/markdown');
}
