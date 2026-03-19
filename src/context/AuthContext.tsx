'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        role: session.user.role ?? 'USER',
        avatar: session.user.image ?? undefined,
      }
    : null

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    console.log('signIn result:', result)
    if (result?.error) throw new Error(result.error === 'CredentialsSignin' ? 'Неверный email или пароль' : result.error)
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Ошибка регистрации')
    }
    await signIn('credentials', { email, password, redirect: false })
  }

  const logout = () => signOut({ callbackUrl: '/' })

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading: status === 'loading' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
