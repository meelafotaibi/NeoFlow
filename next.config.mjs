import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(import.meta.dirname || '.'),
  },
  allowedDevOrigins: ['192.168.8.99'],
}

export default nextConfig


