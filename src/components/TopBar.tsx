'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './TopBar.module.css'

export default function TopBar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  // Синхронизируем поисковый запрос с URL
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

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <header className={styles.topBar}>
      <form onSubmit={handleSearch} className={styles.search}>
        <input 
          type="text" 
          placeholder="Поиск треков, исполнителей, альбомов..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={handleSearchInput}
        />
      </form>

      <div className={styles.userSection}>
        {user ? (
          <>
            <Link href="/profile" className={styles.userInfo}>
              {user?.avatar && (
                <img src={user.avatar} alt={user.name} className={styles.avatar} />
              )}
              <span className={styles.userName}>{user?.name}</span>
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Выйти
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