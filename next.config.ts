import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // pdf-parse reads files at load time; treat it as an external server package
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
