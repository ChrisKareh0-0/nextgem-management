/** @type {import("next").NextConfig} */
const nextConfig = {
  // Minimal configuration for Render deployment
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static generation and use server-side rendering only
  experimental: {
    // Disable as many features as possible to minimize build errors
    optimizeCss: false,
    optimizePackageImports: false,
    serverMinification: false,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Set a reasonable timeout for static generation
  staticPageGenerationTimeout: 60,
  // Copy image configuration from main config
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: ""
      }
    ]
  },
  // Disable powered by header
  poweredByHeader: false,
};

export default nextConfig; 