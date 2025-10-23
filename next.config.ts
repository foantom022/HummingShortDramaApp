import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.maimn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cnbj1.fds.api.mi-img.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qiniu.rongjuwh.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pro.vjread.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
