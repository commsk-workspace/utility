import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.lorem;

export default function LoremLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
