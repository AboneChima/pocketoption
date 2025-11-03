/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Only apply rewrites in production when NEXT_PUBLIC_API_URL is set
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
      ]
    }
    return []
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.placeholder.com',
      },
    ],
  },
}

module.exports = nextConfig