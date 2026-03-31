'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  ImageIcon,
  Upload,
  Download,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageInfo {
  file: File;
  url: string;
  width: number;
  height: number;
  size: number;
}

export default function ImagePage() {
  const { toast } = useToast();
  const [image, setImage] = useState<ImageInfo | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [newWidth, setNewWidth] = useState(0);
  const [newHeight, setNewHeight] = useState(0);
  const [quality, setQuality] = useState(80);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    
    img.onload = () => {
      setImage({
        file,
        url,
        width: img.width,
        height: img.height,
        size: file.size,
      });
      setNewWidth(img.width);
      setNewHeight(img.height);
      setOutputUrl(null);
    };
    
    img.src = url;
  }, [toast]);

  const handleWidthChange = (width: number) => {
    setNewWidth(width);
    if (maintainAspect && image) {
      setNewHeight(Math.round((width / image.width) * image.height));
    }
  };

  const handleHeightChange = (height: number) => {
    setNewHeight(height);
    if (maintainAspect && image) {
      setNewWidth(Math.round((height / image.height) * image.width));
    }
  };

  const processImage = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = newWidth;
    canvas.height = newHeight;

    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const mimeType = `image/${format}`;
      const qualityValue = format === 'png' ? undefined : quality / 100;
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setOutputUrl(url);
            setOutputSize(blob.size);

            const savings = ((1 - blob.size / image.size) * 100).toFixed(1);
            toast({
              title: 'Processed!',
              description: `Size reduced by ${savings}% (${formatBytes(image.size)} → ${formatBytes(blob.size)})`,
            });
          }
        },
        mimeType,
        qualityValue
      );
    };
    img.src = image.url;
  }, [image, newWidth, newHeight, quality, format, toast]);

  const handleDownload = () => {
    if (!outputUrl) return;

    const link = document.createElement('a');
    link.download = `optimized-${newWidth}x${newHeight}.${format}`;
    link.href = outputUrl;
    link.click();

    toast({ title: 'Downloaded!', description: 'Image downloaded.' });
  };

  const handleClear = () => {
    if (image?.url) URL.revokeObjectURL(image.url);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setImage(null);
    setOutputUrl(null);
    setNewWidth(0);
    setNewHeight(0);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-lime-500/10">
          <ImageIcon className="h-6 w-6 text-lime-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Image Optimizer</h1>
          <p className="text-sm text-muted-foreground">
            Resize and compress images
          </p>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Upload Image</Label>
              {image && (
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!image ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WEBP supported
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image.url}
                    alt="Original"
                    className="max-w-full max-h-[300px] mx-auto"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Original:</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{image.width} x {image.height}</Badge>
                    <Badge variant="secondary">{formatBytes(image.size)}</Badge>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Controls */}
          {image && (
            <Card className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Width</Label>
                  <Input
                    type="number"
                    value={newWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    min={1}
                    max={4000}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Height</Label>
                  <Input
                    type="number"
                    value={newHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    min={1}
                    max={4000}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aspect"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="aspect" className="font-normal cursor-pointer">
                  Maintain aspect ratio
                </Label>
              </div>

              <div>
                <Label className="mb-2 block">Output Format</Label>
                <div className="flex gap-2">
                  {(['jpeg', 'png', 'webp'] as const).map((f) => (
                    <Button
                      key={f}
                      variant={format === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormat(f)}
                    >
                      {f.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {format !== 'png' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Quality</Label>
                    <span className="text-sm text-muted-foreground">{quality}%</span>
                  </div>
                  <Slider
                    value={[quality]}
                    onValueChange={([v]) => setQuality(v)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
              )}

              <Button onClick={processImage} className="w-full">
                Process Image
              </Button>
            </Card>
          )}
        </div>

        {/* Output */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Output</Label>
              {outputUrl && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
            </div>

            {outputUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={outputUrl}
                    alt="Optimized"
                    className="max-w-full max-h-[300px] mx-auto"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Optimized:</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{newWidth} x {newHeight}</Badge>
                    <Badge variant="default">{formatBytes(outputSize)}</Badge>
                  </div>
                </div>

                {image && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
                    <Badge variant="secondary">{formatBytes(image.size)}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="default">{formatBytes(outputSize)}</Badge>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 border-green-500/20"
                    >
                      -{((1 - outputSize / image.size) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Upload and process an image to see the result
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
