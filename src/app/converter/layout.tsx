import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.converter;

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
