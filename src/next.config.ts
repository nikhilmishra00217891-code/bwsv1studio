
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'postimg.org',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas', 'konva/lib/index-node');
    }
    return config;
  },
};

export default nextConfig;
