import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.jwt;

export default function JwtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
