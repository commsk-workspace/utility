import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.minify;

export default function MinifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
