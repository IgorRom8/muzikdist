/** @type {import('next').NextConfig} */
const nextConfig = {
  // Обновленная настройка для Next.js 15
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  // Принудительно отключаем кеш для пересборки
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Увеличиваем лимит размера body
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    },
    responseLimit: '50mb'
  }
}

module.exports = nextConfig