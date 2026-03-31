import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://util.commsk.dev';

interface PageMetaOptions {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  path?: string;
}

export function generatePageMeta({
  title,
  description,
  keywords = [],
  image = '/og-image.png',
  path = '',
}: PageMetaOptions): Metadata {
  const fullTitle = `${title} | Utility Tools`;
  const url = `${BASE_URL}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: ['developer tools', 'devtools', 'utilities', ...keywords],
    authors: [{ name: 'Commsk.dev', url: 'https://commsk.dev' }],
    creator: 'Commsk.dev',
    publisher: 'Commsk.dev',
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title: fullTitle,
      description,
      siteName: 'Utility Tools',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
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
  };
}

// Pre-defined metadata for each tool page
export const toolPageMeta = {
  json: generatePageMeta({
    title: 'JSON Tools',
    description: 'Format, validate, minify, and convert JSON. Features JSON to TypeScript, JSON diff, flatten/unflatten, and more.',
    keywords: ['json formatter', 'json validator', 'json minify', 'json to typescript', 'json diff'],
    path: '/json',
  }),
  
  sql: generatePageMeta({
    title: 'SQL Tools',
    description: 'Format, beautify, and convert SQL queries. Convert SQL to Prisma, TypeORM, and Drizzle ORM schemas.',
    keywords: ['sql formatter', 'sql beautifier', 'sql to prisma', 'sql to typeorm', 'sql converter'],
    path: '/sql',
  }),
  
  mermaid: generatePageMeta({
    title: 'Mermaid Diagram Editor',
    description: 'Create and edit Mermaid diagrams with live preview. Export as PNG, SVG, or share online.',
    keywords: ['mermaid editor', 'diagram editor', 'flowchart', 'sequence diagram', 'gantt chart'],
    path: '/mermaid',
  }),
  
  markdown: generatePageMeta({
    title: 'Markdown Editor',
    description: 'Write and preview Markdown with live rendering. Features syntax highlighting and export options.',
    keywords: ['markdown editor', 'markdown preview', 'markdown writer', 'md editor'],
    path: '/markdown',
  }),
  
  crypto: generatePageMeta({
    title: 'Crypto & Security Tools',
    description: 'Generate hashes, UUIDs, passwords, and JWT tokens. Secure cryptographic utilities for developers.',
    keywords: ['hash generator', 'uuid generator', 'password generator', 'jwt encoder', 'sha256', 'md5'],
    path: '/crypto',
  }),
  
  converter: generatePageMeta({
    title: 'Data Converter',
    description: 'Convert between JSON, CSV, XML, YAML, Base64, and URL encoding. Universal data format converter.',
    keywords: ['json to csv', 'csv to json', 'base64 encoder', 'url encoder', 'yaml converter'],
    path: '/converter',
  }),
  
  text: generatePageMeta({
    title: 'Text Tools',
    description: 'Text manipulation utilities including case conversion, regex tester, diff comparison, and lorem ipsum generator.',
    keywords: ['text converter', 'regex tester', 'text diff', 'lorem ipsum', 'case converter'],
    path: '/text',
  }),
  
  color: generatePageMeta({
    title: 'Color Tools',
    description: 'Color picker, palette generator, contrast checker, and gradient generator. Convert between HEX, RGB, HSL formats.',
    keywords: ['color picker', 'color palette', 'contrast checker', 'gradient generator', 'hex to rgb'],
    path: '/color',
  }),

  // New tools
  base64: generatePageMeta({
    title: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings. Convert text and files to Base64 format.',
    keywords: ['base64 encoder', 'base64 decoder', 'base64 converter', 'file to base64'],
    path: '/base64',
  }),

  url: generatePageMeta({
    title: 'URL Parser & Builder',
    description: 'Parse, build, and encode URLs. Extract URL components and build query strings.',
    keywords: ['url parser', 'url builder', 'url encoder', 'query string builder'],
    path: '/url',
  }),

  jwt: generatePageMeta({
    title: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens. View JWT header, payload, and expiration.',
    keywords: ['jwt decoder', 'jwt parser', 'json web token', 'jwt inspector'],
    path: '/jwt',
  }),

  password: generatePageMeta({
    title: 'Password Generator',
    description: 'Generate secure random passwords with customizable options. Includes strength indicator.',
    keywords: ['password generator', 'random password', 'secure password', 'strong password'],
    path: '/password',
  }),

  regex: generatePageMeta({
    title: 'Regex Tester',
    description: 'Test regular expressions with real-time matching and highlighting. Includes common patterns.',
    keywords: ['regex tester', 'regex validator', 'regular expression', 'pattern matching'],
    path: '/regex',
  }),

  diff: generatePageMeta({
    title: 'Diff Checker',
    description: 'Compare text and code side-by-side. Find differences between two texts.',
    keywords: ['diff checker', 'text compare', 'code diff', 'text difference'],
    path: '/diff',
  }),

  csv: generatePageMeta({
    title: 'CSV ↔ JSON Converter',
    description: 'Convert between CSV and JSON formats. Parse CSV files and export to JSON.',
    keywords: ['csv to json', 'json to csv', 'csv converter', 'csv parser'],
    path: '/csv',
  }),

  yaml: generatePageMeta({
    title: 'YAML ↔ JSON Converter',
    description: 'Convert between YAML and JSON formats. Validate and format YAML files.',
    keywords: ['yaml to json', 'json to yaml', 'yaml converter', 'yaml parser'],
    path: '/yaml',
  }),

  gradient: generatePageMeta({
    title: 'CSS Gradient Generator',
    description: 'Create beautiful CSS gradients with visual editor. Export ready-to-use CSS code.',
    keywords: ['gradient generator', 'css gradient', 'linear gradient', 'radial gradient'],
    path: '/gradient',
  }),

  lorem: generatePageMeta({
    title: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for your designs. Create paragraphs, sentences, or words.',
    keywords: ['lorem ipsum', 'placeholder text', 'dummy text', 'filler text'],
    path: '/lorem',
  }),

  minify: generatePageMeta({
    title: 'Code Minifier',
    description: 'Minify HTML, CSS, and JavaScript code. Reduce file size and optimize performance.',
    keywords: ['minifier', 'html minify', 'css minify', 'javascript minify'],
    path: '/minify',
  }),

  api: generatePageMeta({
    title: 'API Tester',
    description: 'Test REST APIs with ease. Send HTTP requests and inspect responses.',
    keywords: ['api tester', 'rest client', 'http client', 'postman alternative'],
    path: '/api-tester',
  }),

  placeholder: generatePageMeta({
    title: 'Placeholder Image Generator',
    description: 'Generate placeholder images for your designs. Customizable size, color, and text.',
    keywords: ['placeholder image', 'dummy image', 'image generator', 'placeholder generator'],
    path: '/placeholder',
  }),

  svg: generatePageMeta({
    title: 'SVG Optimizer',
    description: 'Optimize and minify SVG files. Remove unnecessary data and reduce file size.',
    keywords: ['svg optimizer', 'svg minify', 'svgo', 'svg compressor'],
    path: '/svg',
  }),

  image: generatePageMeta({
    title: 'Image Optimizer',
    description: 'Resize and compress images. Convert between formats and optimize for web.',
    keywords: ['image optimizer', 'image compressor', 'image resize', 'image converter'],
    path: '/image',
  }),
};
