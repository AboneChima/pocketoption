/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.placeholder.com',
      },
    ],
  },
  typescript: {
    // Exclude functions directory from TypeScript compilation
    ignoreBuildErrors: false,
  },
  // Next.js 16: use serverExternalPackages at the root
  serverExternalPackages: ['firebase-admin', 'jsonwebtoken', 'semver'],
}

module.exports = nextConfig