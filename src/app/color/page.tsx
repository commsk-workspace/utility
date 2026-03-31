'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Palette,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { useHistory, type ColorHistoryItem } from '@/hooks/use-history';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { ShareButton } from '@/components/share/ShareButton';
import {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  generatePalette,
  generateGradientCss,
  getContrastRatio,
  generateRandomColor,
  type PaletteType,
  type GradientStop,
} from '@/lib/tools/color-tools';

export default function ColorPage() {
  const { toast } = useToast();

  // History
  const colorHistory = useHistory<ColorHistoryItem>({ storageKey: 'color' });

  // Color picker state
  const [pickerColor, setPickerColor] = useState('#6366f1');
  const [rgb, setRgb] = useState({ r: 99, g: 102, b: 241 });
  const [hsl, setHsl] = useState({ h: 239, s: 84, l: 67 });

  // Palette state
  const [paletteBaseColor, setPaletteBaseColor] = useState('#6366f1');
  const [paletteType, setPaletteType] = useState<PaletteType>('analogous');
  const [palette, setPalette] = useState<string[]>([]);

  // Gradient state
  const [gradientColors, setGradientColors] = useState(['#6366f1', '#ec4899']);
  const [gradientDirection, setGradientDirection] = useState('to right');
  const [gradientCss, setGradientCss] = useState('');

  // Contrast state
  const [contrastColor1, setContrastColor1] = useState('#ffffff');
  const [contrastColor2, setContrastColor2] = useState('#000000');
  const [contrastRatio, setContrastRatio] = useState<number | null>(null);

  // Update conversions when picker color changes
  useEffect(() => {
    try {
      const rgbResult = hexToRgb(pickerColor);
      const hslResult = hexToHsl(pickerColor);
      setRgb(rgbResult);
      setHsl(hslResult);
    } catch {
      // Invalid color format
    }
  }, [pickerColor]);

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard.' });
  };

  const handleRandomColor = () => {
    const newColor = generateRandomColor();
    setPickerColor(newColor);
  };

  const handleGeneratePalette = () => {
    try {
      const result = generatePalette(paletteBaseColor, paletteType);
      setPalette(result);
      colorHistory.addToHistory({
        color: paletteBaseColor,
        format: `Palette (${paletteType}): ${result.join(', ')}`,
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate palette', variant: 'destructive' });
    }
  };

  const handleGenerateGradient = () => {
    try {
      const stops: GradientStop[] = gradientColors.map((color, index) => ({
        color,
        position: (index / (gradientColors.length - 1)) * 100,
      }));
      const result = generateGradientCss(stops, 'linear', gradientDirection as 'to right');
      setGradientCss(result);
      colorHistory.addToHistory({
        color: gradientColors.join(' → '),
        format: `Gradient: ${result}`,
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate gradient', variant: 'destructive' });
    }
  };

  const handleCheckContrast = () => {
    try {
      const result = getContrastRatio(contrastColor1, contrastColor2);
      setContrastRatio(result);
      colorHistory.addToHistory({
        color: `${contrastColor1} / ${contrastColor2}`,
        format: `Contrast: ${result.toFixed(2)}:1`,
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to check contrast', variant: 'destructive' });
    }
  };

  const addGradientColor = () => {
    const newColor = generateRandomColor();
    setGradientColors([...gradientColors, newColor]);
  };

  const removeGradientColor = (index: number) => {
    if (gradientColors.length > 2) {
      setGradientColors(gradientColors.filter((_, i) => i !== index));
    }
  };

  const updateGradientColor = (index: number, color: string) => {
    const newColors = [...gradientColors];
    newColors[index] = color;
    setGradientColors(newColors);
  };

  const getContrastLevel = (ratio: number) => {
    if (ratio >= 7) return { level: 'AAA', color: 'text-green-500' };
    if (ratio >= 4.5) return { level: 'AA', color: 'text-yellow-500' };
    if (ratio >= 3) return { level: 'AA Large', color: 'text-orange-500' };
    return { level: 'Fail', color: 'text-red-500' };
  };

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/10">
            <Palette className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Color Tools</h1>
            <p className="text-sm text-muted-foreground">
              Color picker, palette generator, and contrast checker
            </p>
          </div>
        </div>
        <ShareButton
          title="Color Tools - DevTools"
          description="Color picker, palette generator, gradient builder, and contrast checker"
          hashtags={['DevTools', 'ColorTools', 'WebDesign', 'CSS']}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr,300px] gap-6">
        <Tabs defaultValue="picker" className="space-y-4">
          <TabsList>
            <TabsTrigger value="picker">Color Picker</TabsTrigger>
            <TabsTrigger value="palette">Palette Generator</TabsTrigger>
            <TabsTrigger value="gradient">Gradient Generator</TabsTrigger>
            <TabsTrigger value="contrast">Contrast Checker</TabsTrigger>
          </TabsList>

        <TabsContent value="picker">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Color Picker</CardTitle>
                <CardDescription>
                  Pick a color and get various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div
                    className="w-32 h-32 rounded-lg border cursor-pointer"
                    style={{ backgroundColor: pickerColor }}
                    onClick={() => document.getElementById('color-picker')?.click()}
                  />
                  <input
                    id="color-picker"
                    type="color"
                    value={pickerColor}
                    onChange={(e) => setPickerColor(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <Label>HEX</Label>
                      <div className="flex gap-2">
                        <Input
                          value={pickerColor}
                          onChange={(e) => setPickerColor(e.target.value)}
                          className="font-mono"
                        />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(pickerColor)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRandomColor}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Random
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Formats</CardTitle>
                <CardDescription>
                  Various color format representations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>RGB</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>HSL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>CSS Variable</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`--color: ${pickerColor};`}
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(`--color: ${pickerColor};`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="palette">
          <Card>
            <CardHeader>
              <CardTitle>Palette Generator</CardTitle>
              <CardDescription>
                Generate harmonious color palettes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label>Base Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded border cursor-pointer"
                      style={{ backgroundColor: paletteBaseColor }}
                      onClick={() => document.getElementById('palette-picker')?.click()}
                    />
                    <input
                      id="palette-picker"
                      type="color"
                      value={paletteBaseColor}
                      onChange={(e) => setPaletteBaseColor(e.target.value)}
                      className="sr-only"
                    />
                    <Input
                      value={paletteBaseColor}
                      onChange={(e) => setPaletteBaseColor(e.target.value)}
                      className="w-32 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Palette Type</Label>
                  <Select value={paletteType} onValueChange={(v) => setPaletteType(v as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complementary">Complementary</SelectItem>
                      <SelectItem value="analogous">Analogous</SelectItem>
                      <SelectItem value="triadic">Triadic</SelectItem>
                      <SelectItem value="tetradic">Tetradic</SelectItem>
                      <SelectItem value="monochromatic">Monochromatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGeneratePalette}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>

              {palette.length > 0 && (
                <div className="space-y-4">
                  <div className="flex h-24 rounded-lg overflow-hidden">
                    {palette.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 cursor-pointer transition-all hover:flex-[1.5]"
                        style={{ backgroundColor: color }}
                        onClick={() => handleCopy(color)}
                        title={`Click to copy: ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {palette.map((color, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="font-mono"
                        onClick={() => handleCopy(color)}
                      >
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: color }}
                        />
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gradient">
          <Card>
            <CardHeader>
              <CardTitle>Gradient Generator</CardTitle>
              <CardDescription>
                Create beautiful CSS gradients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Colors</Label>
                <div className="space-y-2">
                  {gradientColors.map((color, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div
                        className="w-10 h-10 rounded border cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => document.getElementById(`gradient-color-${index}`)?.click()}
                      />
                      <input
                        id={`gradient-color-${index}`}
                        type="color"
                        value={color}
                        onChange={(e) => updateGradientColor(index, e.target.value)}
                        className="sr-only"
                      />
                      <Input
                        value={color}
                        onChange={(e) => updateGradientColor(index, e.target.value)}
                        className="w-32 font-mono"
                      />
                      {gradientColors.length > 2 && (
                        <Button variant="ghost" size="icon" onClick={() => removeGradientColor(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addGradientColor}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Color
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Direction</Label>
                <Select value={gradientDirection} onValueChange={setGradientDirection}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to right">To Right</SelectItem>
                    <SelectItem value="to left">To Left</SelectItem>
                    <SelectItem value="to bottom">To Bottom</SelectItem>
                    <SelectItem value="to top">To Top</SelectItem>
                    <SelectItem value="to bottom right">To Bottom Right</SelectItem>
                    <SelectItem value="to bottom left">To Bottom Left</SelectItem>
                    <SelectItem value="to top right">To Top Right</SelectItem>
                    <SelectItem value="to top left">To Top Left</SelectItem>
                    <SelectItem value="45deg">45 Degrees</SelectItem>
                    <SelectItem value="90deg">90 Degrees</SelectItem>
                    <SelectItem value="135deg">135 Degrees</SelectItem>
                    <SelectItem value="180deg">180 Degrees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleGenerateGradient}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate CSS
              </Button>

              {gradientCss && (
                <div className="space-y-4">
                  <div
                    className="h-24 rounded-lg"
                    style={{ background: gradientCss }}
                  />
                  <div className="space-y-2">
                    <Label>CSS Code</Label>
                    <div className="flex gap-2">
                      <Input value={gradientCss} readOnly className="font-mono text-sm" />
                      <Button variant="outline" size="icon" onClick={() => handleCopy(gradientCss)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contrast">
          <Card>
            <CardHeader>
              <CardTitle>Contrast Checker</CardTitle>
              <CardDescription>
                Check WCAG color contrast compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Foreground (Text)</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded border cursor-pointer"
                      style={{ backgroundColor: contrastColor1 }}
                      onClick={() => document.getElementById('contrast-color-1')?.click()}
                    />
                    <input
                      id="contrast-color-1"
                      type="color"
                      value={contrastColor1}
                      onChange={(e) => setContrastColor1(e.target.value)}
                      className="sr-only"
                    />
                    <Input
                      value={contrastColor1}
                      onChange={(e) => setContrastColor1(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded border cursor-pointer"
                      style={{ backgroundColor: contrastColor2 }}
                      onClick={() => document.getElementById('contrast-color-2')?.click()}
                    />
                    <input
                      id="contrast-color-2"
                      type="color"
                      value={contrastColor2}
                      onChange={(e) => setContrastColor2(e.target.value)}
                      className="sr-only"
                    />
                    <Input
                      value={contrastColor2}
                      onChange={(e) => setContrastColor2(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleCheckContrast}>
                Check Contrast
              </Button>

              {contrastRatio !== null && (
                <div className="space-y-4">
                  <div
                    className="p-8 rounded-lg text-center"
                    style={{ backgroundColor: contrastColor2, color: contrastColor1 }}
                  >
                    <p className="text-2xl font-bold">Sample Text</p>
                    <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Contrast Ratio</p>
                        <p className="text-3xl font-bold">{contrastRatio.toFixed(2)}:1</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">WCAG Level</p>
                        <p className={`text-2xl font-bold ${getContrastLevel(contrastRatio).color}`}>
                          {getContrastLevel(contrastRatio).level}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                      <div className={contrastRatio >= 3 ? 'text-green-500' : 'text-red-500'}>
                        <p className="font-medium">Large Text</p>
                        <p>{contrastRatio >= 3 ? 'Pass' : 'Fail'}</p>
                      </div>
                      <div className={contrastRatio >= 4.5 ? 'text-green-500' : 'text-red-500'}>
                        <p className="font-medium">Normal Text (AA)</p>
                        <p>{contrastRatio >= 4.5 ? 'Pass' : 'Fail'}</p>
                      </div>
                      <div className={contrastRatio >= 7 ? 'text-green-500' : 'text-red-500'}>
                        <p className="font-medium">Normal Text (AAA)</p>
                        <p>{contrastRatio >= 7 ? 'Pass' : 'Fail'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* History Sidebar */}
      <div className="space-y-4">
        <HistoryPanel<ColorHistoryItem>
          history={colorHistory.history}
          onSelect={(item) => {
            if (item.value.format.startsWith('Palette')) {
              const colors = item.value.format.replace(/Palette \(\w+\): /, '').split(', ');
              setPalette(colors);
              setPaletteBaseColor(item.value.color);
            } else if (item.value.format.startsWith('Gradient')) {
              const colors = item.value.color.split(' → ');
              setGradientColors(colors);
              setGradientCss(item.value.format.replace('Gradient: ', ''));
            } else if (item.value.format.startsWith('Contrast')) {
              const colors = item.value.color.split(' / ');
              setContrastColor1(colors[0]);
              setContrastColor2(colors[1]);
              const ratio = parseFloat(item.value.format.replace('Contrast: ', '').replace(':1', ''));
              setContrastRatio(ratio);
            }
          }}
          onRemove={(id) => colorHistory.removeFromHistory(id)}
          onClear={() => colorHistory.clearHistory()}
          renderItem={(item) => (
            <div className="flex items-center gap-2">
              {item.value.color.includes(' → ') || item.value.color.includes(' / ') ? (
                <div className="flex">
                  {item.value.color.split(/ → | \/ /).slice(0, 3).map((c, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-sm border -ml-1 first:ml-0"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="w-4 h-4 rounded-sm border"
                  style={{ backgroundColor: item.value.color }}
                />
              )}
              <span className="truncate text-xs">{item.value.format.split(':')[0]}</span>
            </div>
          )}
          renderPreview={(item) => `${item.value.format}: ${item.value.color}`}
        />
      </div>
    </div>
    </div>
  );
}
