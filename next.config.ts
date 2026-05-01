import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack stops climbing parent directories
  // (and stops grabbing stray lockfiles like ~/Desktop/package-lock.json).
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      // Seed images from Lorem Picsum (replaceable later with real photos).
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      // User-uploaded images stored in Supabase (Phase 4 inspections, profile, etc.)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
