'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Wrench,
  Moon,
  Sun,
  FileJson,
  Database,
  ArrowLeftRight,
  Lock,
  Type,
  Palette,
  GitBranch,
  FileText,
  Home,
  Menu,
  X,
  Binary,
  Link2,
  Key,
  KeyRound,
  Regex,
  GitCompare,
  Table,
  FileCode,
  Paintbrush,
  AlignLeft,
  Minimize2,
  Send,
  Image,
  Sparkles,
  ImageIcon,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const mainNavigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Mermaid', href: '/mermaid', icon: GitBranch },
  { name: 'Markdown', href: '/markdown', icon: FileText },
  { name: 'JSON', href: '/json', icon: FileJson },
  { name: 'SQL', href: '/sql', icon: Database },
];

const moreTools = [
  { name: 'Converter', href: '/converter', icon: ArrowLeftRight },
  { name: 'Crypto', href: '/crypto', icon: Lock },
  { name: 'Text', href: '/text', icon: Type },
  { name: 'Color', href: '/color', icon: Palette },
  { name: 'Base64', href: '/base64', icon: Binary },
  { name: 'URL Parser', href: '/url', icon: Link2 },
  { name: 'JWT Decoder', href: '/jwt', icon: Key },
  { name: 'Password', href: '/password', icon: KeyRound },
  { name: 'Regex', href: '/regex', icon: Regex },
  { name: 'Diff', href: '/diff', icon: GitCompare },
  { name: 'CSV ↔ JSON', href: '/csv', icon: Table },
  { name: 'YAML ↔ JSON', href: '/yaml', icon: FileCode },
  { name: 'Gradient', href: '/gradient', icon: Paintbrush },
  { name: 'Lorem Ipsum', href: '/lorem', icon: AlignLeft },
  { name: 'Minifier', href: '/minify', icon: Minimize2 },
  { name: 'API Tester', href: '/api-tester', icon: Send },
  { name: 'Placeholder', href: '/placeholder', icon: ImageIcon },
  { name: 'SVG Optimizer', href: '/svg', icon: Sparkles },
  { name: 'Image', href: '/image', icon: Image },
];

const allNavigation = [...mainNavigation, ...moreTools];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-14 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">DevTools</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* More Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 px-3 py-2"
              >
                More
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel>More Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {moreTools.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 cursor-pointer',
                        isActive && 'bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 space-y-2 max-h-[70vh] overflow-y-auto">
            {allNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
