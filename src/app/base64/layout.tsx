import { toolPageMeta } from '@/lib/metadata';

export const metadata = toolPageMeta.base64;

export default function Base64Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
