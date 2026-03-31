import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.placeholder;

export default function PlaceholderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
