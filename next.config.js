/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.placeholder.com',
      },
    ],
  },
  async rewrites() {
    // Rewrites don't work with static export, API calls will be handled by Netlify redirects
    return []
  },
}

module.exports = nextConfig