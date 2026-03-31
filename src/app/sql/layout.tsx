import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.sql;

export default function SqlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
