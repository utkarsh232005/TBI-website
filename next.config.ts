
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable font optimization to prevent 403 errors
  optimizeFonts: false,
  images: {
    domains: ['placehold.co', 'landingfoliocom.imgix.net', 'www.freepik.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'landingfoliocom.imgix.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.freepik.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Fix for server action errors
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:9002', '127.0.0.1:55436']
    }
  }
};

export default nextConfig;
