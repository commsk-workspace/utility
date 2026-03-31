import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.json;

export default function JsonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
