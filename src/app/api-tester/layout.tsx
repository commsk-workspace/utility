import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.api;

export default function ApiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
