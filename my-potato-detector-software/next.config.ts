/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true  // Required for static export
  },
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig