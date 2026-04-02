import Link from 'next/link';
import {
  FileJson,
  Database,
  ArrowLeftRight,
  Lock,
  Type,
  Palette,
  GitBranch,
  FileText,
  Search,
  Sparkles,
  Link2,
  Regex,
  GitCompare,
  KeyRound,
  Table,
  Paintbrush,
  AlignLeft,
  Send,
  Minimize2,
  ImageIcon,
  RectangleHorizontal,
  Pen,
  Key,
  FileCode,
  Binary,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const tools = [
  {
    name: 'Mermaid Editor',
    description: 'Create and preview Mermaid diagrams with live rendering. Export to PNG, SVG, or PDF.',
    icon: GitBranch,
    href: '/mermaid',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    tags: ['Diagram', 'Flowchart', 'Preview'],
    featured: true,
  },
  {
    name: 'Markdown Editor',
    description: 'Write and preview Markdown with GitHub Flavored syntax support. Share with others.',
    icon: FileText,
    href: '/markdown',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    tags: ['Editor', 'Preview', 'GFM'],
    featured: true,
  },
  {
    name: 'JSON Tools',
    description: 'Format, validate, and transform JSON data. Compare two JSON objects side by side.',
    icon: FileJson,
    href: '/json',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    tags: ['Format', 'Validate', 'Diff'],
  },
  {
    name: 'SQL Tools',
    description: 'Format SQL queries, validate syntax, and convert SQL to Prisma schema.',
    icon: Database,
    href: '/sql',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    tags: ['Format', 'Prisma', 'Validate'],
  },
  {
    name: 'Data Converter',
    description: 'Convert between JSON, CSV, XML, YAML. Encode/decode Base64 and URL.',
    icon: ArrowLeftRight,
    href: '/converter',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    tags: ['CSV', 'XML', 'YAML', 'Base64'],
  },
  {
    name: 'Crypto Tools',
    description: 'Generate hashes, decode JWT tokens, create passwords and UUIDs.',
    icon: Lock,
    href: '/crypto',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    tags: ['Hash', 'JWT', 'UUID'],
  },
  {
    name: 'Text Tools',
    description: 'Test regex patterns, convert text case, generate lorem ipsum, compare texts.',
    icon: Type,
    href: '/text',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    tags: ['Regex', 'Case', 'Diff'],
  },
  {
    name: 'Color Tools',
    description: 'Pick colors, convert between HEX/RGB/HSL, generate palettes and gradients.',
    icon: Palette,
    href: '/color',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    tags: ['Picker', 'Palette', 'Gradient'],
  },
  {
    name: 'URL Tools',
    description: 'Parse, build, and encode/decode URL components and query parameters.',
    icon: Link2,
    href: '/url',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    tags: ['Parse', 'Encode', 'Query'],
  },
  {
    name: 'Regex Tester',
    description: 'Test regex patterns with live matching, group capture, and common patterns library.',
    icon: Regex,
    href: '/regex',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    tags: ['Pattern', 'Match', 'Test'],
  },
  {
    name: 'Diff Checker',
    description: 'Compare two texts side by side with highlighted differences.',
    icon: GitCompare,
    href: '/diff',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    tags: ['Compare', 'Diff', 'Text'],
  },
  {
    name: 'Password Generator',
    description: 'Generate secure passwords with customizable length and character options.',
    icon: KeyRound,
    href: '/password',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    tags: ['Security', 'Generate', 'Random'],
  },
  {
    name: 'CSV Converter',
    description: 'Convert between CSV and JSON formats with custom delimiter support.',
    icon: Table,
    href: '/csv',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    tags: ['CSV', 'JSON', 'Table'],
  },
  {
    name: 'Gradient Generator',
    description: 'Create CSS gradients with visual editor, presets, and live preview.',
    icon: Paintbrush,
    href: '/gradient',
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-500/10',
    tags: ['CSS', 'Gradient', 'Design'],
  },
  {
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text in paragraphs, sentences, or words.',
    icon: AlignLeft,
    href: '/lorem',
    color: 'text-stone-500',
    bgColor: 'bg-stone-500/10',
    tags: ['Placeholder', 'Text', 'Generate'],
  },
  {
    name: 'API Tester',
    description: 'Test REST APIs with custom headers, body, and response timing.',
    icon: Send,
    href: '/api-tester',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    tags: ['HTTP', 'REST', 'Test'],
  },
  {
    name: 'Code Minifier',
    description: 'Minify HTML, CSS, and JavaScript with size reduction stats.',
    icon: Minimize2,
    href: '/minify',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    tags: ['HTML', 'CSS', 'JS'],
  },
  {
    name: 'Image Optimizer',
    description: 'Resize, compress, and convert images between JPEG, PNG, and WebP.',
    icon: ImageIcon,
    href: '/image',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    tags: ['Resize', 'Compress', 'Convert'],
  },
  {
    name: 'Placeholder Image',
    description: 'Generate placeholder images with custom dimensions and colors.',
    icon: RectangleHorizontal,
    href: '/placeholder',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    tags: ['Image', 'Placeholder', 'SVG'],
  },
  {
    name: 'SVG Optimizer',
    description: 'Optimize and minify SVG files with configurable options.',
    icon: Pen,
    href: '/svg',
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-500/10',
    tags: ['SVG', 'Optimize', 'Minify'],
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens. Check expiration status.',
    icon: Key,
    href: '/jwt',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    tags: ['JWT', 'Decode', 'Token'],
  },
  {
    name: 'YAML Tools',
    description: 'Parse and convert YAML data to other formats.',
    icon: FileCode,
    href: '/yaml',
    color: 'text-lime-500',
    bgColor: 'bg-lime-500/10',
    tags: ['YAML', 'Parse', 'Convert'],
  },
  {
    name: 'Base64',
    description: 'Encode and decode text and files in Base64 format.',
    icon: Binary,
    href: '/base64',
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-500/10',
    tags: ['Encode', 'Decode', 'File'],
  },
];

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-7xl py-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            DevTools
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Your Swiss Army Knife for Development. A collection of useful tools for formatting,
          converting, and generating code.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Select a tool below to get started</span>
        </div>
      </div>

      {/* Featured Tools */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Featured Tools
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tools
            .filter((tool) => tool.featured)
            .map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.href}>
                  <Card className="h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-primary/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                          <Icon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <Badge variant="secondary">Featured</Badge>
                      </div>
                      <CardTitle className="mt-4">{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tool.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>

      {/* All Tools */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools
            .filter((tool) => !tool.featured)
            .map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.href}>
                  <Card className="h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-primary/50">
                    <CardHeader className="pb-2">
                      <div className={`p-2 rounded-lg ${tool.bgColor} w-fit`}>
                        <Icon className={`h-5 w-5 ${tool.color}`} />
                      </div>
                      <CardTitle className="text-lg mt-3">{tool.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-12 p-6 rounded-lg bg-muted/50 border">
        <h3 className="font-semibold mb-2">Quick Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use the Mermaid or Markdown editors to create and share documents with others</li>
          <li>• All tools support dark mode - toggle with the moon/sun icon in the header</li>
          <li>• Your work is auto-saved to your browser&#39;s local storage</li>
          <li>• Share documents with view-only or edit access using password protection</li>
        </ul>
      </div>
    </div>
  );
}
