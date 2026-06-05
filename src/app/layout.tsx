import type { Metadata } from 'next'
import { Onest, JetBrains_Mono } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MusicStream — Ваша музыка',
  description: 'Стриминговый музыкальный сервис в ретро-стиле',
  icons: {
    icon: [{ url: '/icon', type: 'image/png' }],
    shortcut: '/icon',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
