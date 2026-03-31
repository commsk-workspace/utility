'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, Loader2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MermaidPreviewProps {
  code: string;
  className?: string;
}

export function MermaidPreview({ code, className = '' }: MermaidPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  
  // Pan & Zoom states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const renderDiagram = useCallback(async () => {
    if (!code.trim() || !containerRef.current) {
      setSvgContent('');
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize mermaid with custom config
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'inherit',
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
        },
      });

      // Validate syntax first
      await mermaid.parse(code);

      // Generate unique ID
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Render the diagram
      const { svg } = await mermaid.render(id, code);
      setSvgContent(svg);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
      setError(errorMessage);
      setSvgContent('');
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [renderDiagram]);

  // Zoom handlers - simple and stable
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // Simple zoom: scroll down = zoom out, scroll up = zoom in
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prevZoom) => {
      const newZoom = prevZoom * zoomFactor;
      return Math.min(Math.max(newZoom, 0.1), 5);
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.2, 0.1));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan handlers - using refs for instant updates (no re-render lag)
  const panRef = useRef(pan);
  const startPanRef = useRef(startPan);
  const isPanningRef = useRef(isPanning);
  const rafRef = useRef<number | null>(null);

  // Keep refs in sync
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsPanning(true);
      isPanningRef.current = true;
      const newStartPan = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
      setStartPan(newStartPan);
      startPanRef.current = newStartPan;
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    
    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Use requestAnimationFrame for smooth updates
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    rafRef.current = requestAnimationFrame(() => {
      const newPan = {
        x: clientX - startPanRef.current.x,
        y: clientY - startPanRef.current.y,
      };
      panRef.current = newPan;
      setPan(newPan);
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    isPanningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    isPanningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-4 ${className}`}>
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-destructive text-center max-w-md">
          {error}
        </p>
      </div>
    );
  }

  if (!code.trim()) {
    return (
      <div className={`flex items-center justify-center h-full text-muted-foreground ${className}`}>
        <p>Enter Mermaid code to see preview</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom In"
          className="h-8 w-8 shadow-lg"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="h-8 w-8 shadow-lg"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleReset}
          title="Reset View"
          className="h-8 w-8 shadow-lg"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Level Display */}
      <div className="absolute top-4 left-4 z-10 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-lg">
        {Math.round(zoom * 100)}%
      </div>

      {/* Pan & Zoom Container */}
      <div
        ref={containerRef}
        className="flex items-center justify-center overflow-hidden p-4 h-full"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <div
          ref={contentRef}
          className="mermaid-content"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </div>
  );
}

export async function exportMermaidToSvg(code: string): Promise<string> {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
  });

  const id = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const { svg } = await mermaid.render(id, code);
  return svg;
}

export async function exportMermaidToPng(code: string, scale: number = 4): Promise<Blob> {
  // Get the SVG content
  const svgString = await exportMermaidToSvg(code);

  // Create a temporary container to properly measure SVG
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.visibility = 'hidden';
  tempContainer.style.left = '-9999px';
  tempContainer.innerHTML = svgString;
  document.body.appendChild(tempContainer);

  const svgElement = tempContainer.querySelector('svg');
  if (!svgElement) {
    document.body.removeChild(tempContainer);
    throw new Error('Invalid SVG content');
  }

  // Get actual rendered dimensions
  let width = 800;
  let height = 600;

  try {
    // Method 1: Try getBBox for actual content size
    const bbox = svgElement.getBBox();
    if (bbox.width > 0 && bbox.height > 0) {
      width = Math.ceil(bbox.width);
      height = Math.ceil(bbox.height);
      console.log(`Using getBBox: ${width}x${height}`);
    }
  } catch (e) {
    console.warn('getBBox failed, trying alternative methods');
    
    // Method 2: Try viewBox
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(parseFloat);
      if (parts.length === 4 && parts.every(n => !isNaN(n))) {
        // viewBox: minX minY width height
        width = Math.ceil(parts[2] - parts[0]);
        height = Math.ceil(parts[3] - parts[1]);
        console.log(`Using viewBox: ${width}x${height}`);
      }
    }
    
    // Method 3: Try width/height attributes
    if (width === 800 || height === 600) {
      const widthAttr = svgElement.getAttribute('width');
      const heightAttr = svgElement.getAttribute('height');
      if (widthAttr && !widthAttr.includes('%')) {
        const w = parseFloat(widthAttr);
        if (!isNaN(w) && w > 0) width = Math.ceil(w);
      }
      if (heightAttr && !heightAttr.includes('%')) {
        const h = parseFloat(heightAttr);
        if (!isNaN(h) && h > 0) height = Math.ceil(h);
      }
      console.log(`Using attributes: ${width}x${height}`);
    }
  }

  // Clean up temporary container
  document.body.removeChild(tempContainer);

  // Minimum size
  width = Math.max(width, 200);
  height = Math.max(height, 200);

  // Maximum total pixels for canvas - HIGHER for crispy output!
  const MAX_TOTAL_PIXELS = 50000000; // 50 million pixels for maximum clarity!
  
  // First, check if SVG itself is larger than our budget at scale 1
  const basePixels = width * height;
  if (basePixels > MAX_TOTAL_PIXELS) {
    // Need to shrink SVG proportionally
    const shrinkRatio = Math.sqrt(MAX_TOTAL_PIXELS / basePixels);
    width = Math.floor(width * shrinkRatio);
    height = Math.floor(height * shrinkRatio);
    console.log(`SVG dimensions shrunk to: ${width}x${height} (ratio: ${shrinkRatio.toFixed(2)})`);
  }

  // Target scale = 2x for crispy text (unless limited by canvas size)
  const targetScale = 2;
  
  // Calculate optimal scale based on pixel budget
  const newBasePixels = width * height;
  const maxAffordableScale = Math.floor(Math.sqrt(MAX_TOTAL_PIXELS / newBasePixels));
  let adjustedScale = Math.min(targetScale, maxAffordableScale);
  adjustedScale = Math.max(adjustedScale, 1);

  // Check individual dimension limits  
  const MAX_CANVAS_SIZE = 16384; // Browser max
  if (width * adjustedScale > MAX_CANVAS_SIZE || height * adjustedScale > MAX_CANVAS_SIZE) {
    adjustedScale = Math.floor(Math.min(MAX_CANVAS_SIZE / width, MAX_CANVAS_SIZE / height));
    adjustedScale = Math.max(adjustedScale, 1);
  }

  console.log(`Final dimensions: SVG ${width}x${height}, Canvas ${width * adjustedScale}x${height * adjustedScale}, Scale ${adjustedScale}x`);

  // Parse the SVG again for export
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
  const exportSvgElement = svgDoc.documentElement;

  // Set explicit dimensions for export
  exportSvgElement.setAttribute('width', `${width}`);
  exportSvgElement.setAttribute('height', `${height}`);

  // Add xmlns if missing
  if (!exportSvgElement.getAttribute('xmlns')) {
    exportSvgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  // Inline all styles to avoid external dependency issues
  const styleElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleElement.textContent = `
    * { font-family: arial, sans-serif; }
    .node rect, .node circle, .node ellipse, .node polygon, .node path { fill: #1f2937; stroke: #6366f1; stroke-width: 1px; }
    .edgePath .path { stroke: #9ca3af; stroke-width: 2px; }
    .edgeLabel { background-color: #1e1e1e; }
    .label { color: #e5e7eb; }
    text { fill: #e5e7eb; }
  `;
  exportSvgElement.insertBefore(styleElement, exportSvgElement.firstChild);

  const modifiedSvg = new XMLSerializer().serializeToString(exportSvgElement);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const finalWidth = Math.floor(width * adjustedScale);
    const finalHeight = Math.floor(height * adjustedScale);
    
    canvas.width = finalWidth;
    canvas.height = finalHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    // Fill background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create image from SVG
    const img = new Image();
    let loadTimeout: NodeJS.Timeout;

    img.onload = () => {
      clearTimeout(loadTimeout);
      try {
        console.log('Image loaded successfully, drawing to canvas...');
        
        // Draw scaled image with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        console.log('Image drawn to canvas, creating blob...');

        // Use higher quality PNG export
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`PNG blob created successfully: ${(blob.size / 1024).toFixed(2)} KB`);
              resolve(blob);
            } else {
              reject(new Error('Failed to create PNG blob. Canvas size may be too large.'));
            }
          },
          'image/png',
          0.95
        );
      } catch (error) {
        console.error('PNG export error:', error);
        reject(new Error(`Failed to export PNG: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    img.onerror = (error) => {
      clearTimeout(loadTimeout);
      console.error('Image load error:', error);
      reject(new Error('Failed to load SVG image. The diagram may be too complex.'));
    };

    // Set timeout for image loading (10 seconds)
    loadTimeout = setTimeout(() => {
      reject(new Error('Image loading timeout. Please try again.'));
    }, 10000);

    // Use Data URL - ensure SVG is properly encoded
    try {
      const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(modifiedSvg);
      console.log(`Setting image source (${svgDataUrl.length} chars)...`);
      img.src = svgDataUrl;
    } catch (error) {
      clearTimeout(loadTimeout);
      reject(new Error('Failed to encode SVG data'));
    }
  });
}
