/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/icon' }]
  },

  webpack: (config, { dev, isServer }) => {
    // OneDrive / сетевые папки: стабильнее отслеживание файлов, меньше сбоев HMR
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig