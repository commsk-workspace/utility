import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.markdown;

export default function MarkdownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
