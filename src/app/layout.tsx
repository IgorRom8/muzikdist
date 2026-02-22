import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'
import { PlayerProvider } from '@/context/PlayerContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'MusicStream - Ваша музыка',
  description: 'Стриминговый музыкальный сервис',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <PlayerProvider>
            {children}
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  )
}