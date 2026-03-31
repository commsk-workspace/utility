import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.mermaid;

export default function MermaidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
