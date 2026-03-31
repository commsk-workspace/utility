import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.text;

export default function TextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
