'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useMounted } from '@/hooks/useMounted'
import { useMobileMenu } from '@/context/MobileMenuContext'
import NotificationsBell from '@/components/NotificationsBell'
import styles from './TopBar.module.css'

function TopBarFallback() {
  return (
    <header className={styles.topBar}>
      <div className={styles.search}>
        <div className={styles.searchPlaceholder} />
      </div>
      <div className={styles.userSectionPlaceholder} />
    </header>
  )
}

function TopBarContent() {
  const mounted = useMounted()
  const { toggle: toggleMenu } = useMobileMenu()
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className={styles.topBar}>
      <button
        type="button"
        className={styles.menuBtn}
        onClick={toggleMenu}
        aria-label="Открыть меню"
      >
        <span className={styles.menuIcon} aria-hidden />
      </button>
      <form onSubmit={handleSearch} className={styles.search}>
        <input
          type="text"
          placeholder="Поиск треков..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className={styles.userSection}>
        {!mounted ? (
          <div className={styles.userSectionPlaceholder} aria-hidden />
        ) : user ? (
          <>
            <NotificationsBell />
            <Link href="/profile" className={styles.userInfo}>
              {user.avatar && (
                <img src={user.avatar} alt={user.name} className={styles.avatar} />
              )}
              <span className={styles.userName}>{user.name}</span>
            </Link>
            <button type="button" onClick={handleLogout} className={styles.logoutButton}>
              <span className={styles.logoutText}>Выйти</span>
              <span className={styles.logoutIcon} aria-hidden>
                ⎋
              </span>
            </button>
          </>
        ) : (
          <div className={styles.authButtons}>
            <Link href="/auth?mode=login" className={styles.loginButton}>
              Вход
            </Link>
            <Link href="/auth?mode=register" className={styles.registerButton}>
              Регистрация
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default function TopBar() {
  return (
    <Suspense fallback={<TopBarFallback />}>
      <TopBarContent />
    </Suspense>
  )
}
