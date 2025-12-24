/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd'],
  // rewrites are handled by middleware.ts now to verify trailing slash preservation
  // async rewrites() { ... }
};

module.exports = nextConfig;
