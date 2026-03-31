'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Palette,
  Copy,
  Plus,
  X,
  RotateCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

interface ColorStop {
  color: string;
  position: number;
}

const PRESET_GRADIENTS = [
  { name: 'Sunset', colors: ['#f093fb', '#f5576c'] },
  { name: 'Ocean', colors: ['#667eea', '#764ba2'] },
  { name: 'Forest', colors: ['#11998e', '#38ef7d'] },
  { name: 'Fire', colors: ['#f12711', '#f5af19'] },
  { name: 'Sky', colors: ['#2193b0', '#6dd5ed'] },
  { name: 'Purple', colors: ['#8e2de2', '#4a00e0'] },
  { name: 'Midnight', colors: ['#232526', '#414345'] },
  { name: 'Rainbow', colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'] },
];

export default function GradientPage() {
  const { toast } = useToast();
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(90);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: '#6366f1', position: 0 },
    { color: '#8b5cf6', position: 100 },
  ]);

  const gradientCSS = useMemo(() => {
    const stops = colorStops
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');

    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stops})`;
    }
    return `radial-gradient(circle, ${stops})`;
  }, [gradientType, angle, colorStops]);

  const fullCSS = `background: ${gradientCSS};`;

  const addColorStop = () => {
    if (colorStops.length >= 8) {
      toast({
        title: 'Limit reached',
        description: 'Maximum 8 color stops allowed',
        variant: 'destructive',
      });
      return;
    }
    setColorStops([...colorStops, { color: '#ffffff', position: 50 }]);
  };

  const removeColorStop = (index: number) => {
    if (colorStops.length <= 2) {
      toast({
        title: 'Minimum required',
        description: 'At least 2 color stops required',
        variant: 'destructive',
      });
      return;
    }
    setColorStops(colorStops.filter((_, i) => i !== index));
  };

  const updateColorStop = (index: number, field: 'color' | 'position', value: string | number) => {
    const updated = [...colorStops];
    if (field === 'color') {
      updated[index].color = value as string;
    } else {
      updated[index].position = value as number;
    }
    setColorStops(updated);
  };

  const applyPreset = (colors: string[]) => {
    const stops = colors.map((color, i) => ({
      color,
      position: Math.round((i / (colors.length - 1)) * 100),
    }));
    setColorStops(stops);
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'CSS copied to clipboard.' });
  };

  const randomize = () => {
    const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setColorStops([
      { color: randomColor(), position: 0 },
      { color: randomColor(), position: 100 },
    ]);
    setAngle(Math.floor(Math.random() * 360));
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-pink-500/10">
          <Palette className="h-6 w-6 text-pink-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gradient Generator</h1>
          <p className="text-sm text-muted-foreground">
            Create beautiful CSS gradients
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="space-y-4">
          <Card className="p-4">
            <Label className="mb-2 block">Preview</Label>
            <div
              className="w-full h-64 rounded-lg"
              style={{ background: gradientCSS }}
            />
          </Card>

          {/* CSS Output */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Label>CSS Code</Label>
              <Button variant="outline" size="sm" onClick={() => handleCopy(fullCSS)}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
              {fullCSS}
            </div>
          </Card>

          {/* Presets */}
          <Card className="p-4">
            <Label className="mb-3 block">Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_GRADIENTS.map((preset, index) => (
                <button
                  key={index}
                  className="aspect-square rounded-lg border-2 border-transparent hover:border-primary transition-colors"
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                  }}
                  onClick={() => applyPreset(preset.colors)}
                  title={preset.name}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Type & Angle */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="mb-2 block">Gradient Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={gradientType === 'linear' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGradientType('linear')}
                    className="flex-1"
                  >
                    Linear
                  </Button>
                  <Button
                    variant={gradientType === 'radial' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGradientType('radial')}
                    className="flex-1"
                  >
                    Radial
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={randomize}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            {gradientType === 'linear' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Angle</Label>
                  <span className="text-sm text-muted-foreground">{angle}°</span>
                </div>
                <Slider
                  value={[angle]}
                  onValueChange={([v]) => setAngle(v)}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
            )}
          </Card>

          {/* Color Stops */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label>Color Stops</Label>
              <Button variant="outline" size="sm" onClick={addColorStop}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {colorStops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={stop.color}
                    onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  <div className="w-20">
                    <Input
                      type="number"
                      value={stop.position}
                      onChange={(e) => updateColorStop(index, 'position', Number(e.target.value))}
                      min={0}
                      max={100}
                      className="text-sm"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeColorStop(index)}
                    disabled={colorStops.length <= 2}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
