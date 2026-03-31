import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.yaml;

export default function YamlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
