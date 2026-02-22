/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  // Принудительно отключаем кеш для пересборки
  generateBuildId: async () => {
    return `build-${Date.now()}`
  }
}

module.exports = nextConfig