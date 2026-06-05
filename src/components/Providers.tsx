'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { PlayerProvider } from '@/context/PlayerContext'
import { MobileMenuProvider } from '@/context/MobileMenuContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <PlayerProvider>
          <MobileMenuProvider>{children}</MobileMenuProvider>
        </PlayerProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
