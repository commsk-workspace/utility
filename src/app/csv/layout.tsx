import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.csv;

export default function CsvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
