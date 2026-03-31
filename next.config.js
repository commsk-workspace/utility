/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['picsum.photos'],
  },
  experimental: {
    serverComponentsExternalPackages: ['mermaid'],
  },
};

module.exports = nextConfig;
