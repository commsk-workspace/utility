import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.svg;

export default function SvgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
