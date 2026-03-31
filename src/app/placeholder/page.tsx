'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Image,
  Copy,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

const PRESET_SIZES = [
  { name: 'Thumbnail', width: 150, height: 150 },
  { name: 'Square', width: 300, height: 300 },
  { name: 'Banner', width: 728, height: 90 },
  { name: 'Card', width: 400, height: 300 },
  { name: 'HD', width: 1280, height: 720 },
  { name: 'Full HD', width: 1920, height: 1080 },
  { name: 'Social', width: 1200, height: 630 },
  { name: 'Avatar', width: 200, height: 200 },
];

const COLORS = [
  { name: 'Gray', bg: '#6b7280', text: '#ffffff' },
  { name: 'Blue', bg: '#3b82f6', text: '#ffffff' },
  { name: 'Green', bg: '#22c55e', text: '#ffffff' },
  { name: 'Purple', bg: '#8b5cf6', text: '#ffffff' },
  { name: 'Pink', bg: '#ec4899', text: '#ffffff' },
  { name: 'Orange', bg: '#f97316', text: '#ffffff' },
  { name: 'Cyan', bg: '#06b6d4', text: '#ffffff' },
  { name: 'Dark', bg: '#1f2937', text: '#ffffff' },
];

export default function PlaceholderPage() {
  const { toast } = useToast();
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [bgColor, setBgColor] = useState('#6b7280');
  const [textColor, setTextColor] = useState('#ffffff');
  const [text, setText] = useState('');

  const displayText = text || `${width} x ${height}`;

  const svgContent = useMemo(() => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 10}">${displayText}</text>
</svg>`;
  }, [width, height, bgColor, textColor, displayText]);

  const dataUrl = useMemo(() => {
    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }, [svgContent]);

  const picsumUrl = `https://picsum.photos/${width}/${height}`;
  const placeholderUrl = `https://via.placeholder.com/${width}x${height}/${bgColor.slice(1)}/${textColor.slice(1)}?text=${encodeURIComponent(displayText)}`;

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'URL copied to clipboard.' });
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = textColor;
    ctx.font = `${Math.min(width, height) / 10}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, width / 2, height / 2);

    const link = document.createElement('a');
    link.download = `placeholder-${width}x${height}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast({ title: 'Downloaded!', description: 'Image downloaded.' });
  };

  const applyPreset = (preset: { width: number; height: number }) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const applyColor = (color: { bg: string; text: string }) => {
    setBgColor(color.bg);
    setTextColor(color.text);
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-sky-500/10">
          <Image className="h-6 w-6 text-sky-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Placeholder Image Generator</h1>
          <p className="text-sm text-muted-foreground">
            Generate placeholder images for your designs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="space-y-4">
          <Card className="p-4">
            <Label className="mb-2 block">Preview</Label>
            <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[300px]">
              <img
                src={dataUrl}
                alt="Placeholder"
                className="max-w-full max-h-[280px] rounded shadow-lg"
              />
            </div>
          </Card>

          {/* URLs */}
          <Card className="p-4 space-y-3">
            <Label>Image URLs</Label>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="shrink-0">SVG</Badge>
                <Input value={dataUrl} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="sm" onClick={() => handleCopy(dataUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="shrink-0">Picsum</Badge>
                <Input value={picsumUrl} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="sm" onClick={() => handleCopy(picsumUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Size */}
          <Card className="p-4 space-y-4">
            <Label>Dimensions</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Width</Label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={4000}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Height</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={4000}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Presets</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_SIZES.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Colors */}
          <Card className="p-4 space-y-4">
            <Label>Colors</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Background</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Text</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Color Presets</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    className="w-8 h-8 rounded-full border-2 border-transparent hover:border-primary transition-colors"
                    style={{ backgroundColor: color.bg }}
                    onClick={() => applyColor(color)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Custom Text */}
          <Card className="p-4">
            <Label className="mb-2 block">Custom Text (optional)</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Default: ${width} x ${height}`}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
