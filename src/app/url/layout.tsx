import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.url;

export default function UrlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
