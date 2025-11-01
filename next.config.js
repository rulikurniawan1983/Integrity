/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static optimization for dashboard pages to avoid build-time errors
  experimental: {
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig

