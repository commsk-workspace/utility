import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://util.commsk.dev'),
  title: {
    default: 'Utility Tools - Developer Swiss Knife',
    template: '%s | Utility Tools',
  },
  description: 'Free online developer tools: JSON formatter, SQL beautifier, Mermaid diagrams, Markdown editor, Base64, JWT, Password generator, and 20+ more utilities.',
  keywords: ['developer tools', 'json formatter', 'sql formatter', 'mermaid', 'markdown', 'converter', 'base64', 'jwt decoder', 'password generator', 'text diff', 'crypto tools'],
  authors: [{ name: 'Commsk.dev', url: 'https://commsk.dev' }],
  creator: 'Commsk.dev',
  publisher: 'Commsk.dev',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://util.commsk.dev',
    title: 'Utility Tools - Developer Swiss Knife',
    description: 'Free online developer tools: JSON formatter, SQL beautifier, Mermaid diagrams, Markdown editor, Base64, JWT, Password generator, and 20+ more utilities.',
    siteName: 'Utility Tools',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Utility Tools - Developer Swiss Knife',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Utility Tools - Developer Swiss Knife',
    description: 'Free online developer tools: JSON formatter, SQL beautifier, Mermaid diagrams, Markdown editor, Base64, JWT, Password generator, and 20+ more utilities.',
    images: ['/og-image.png'],
    creator: '@commsk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
