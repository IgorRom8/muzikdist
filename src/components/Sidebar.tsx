'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useMobileMenu } from '@/context/MobileMenuContext'
import { useMounted } from '@/hooks/useMounted'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const mounted = useMounted()
  const { user } = useAuth()
  const { isOpen, close } = useMobileMenu()
  const [pendingReports, setPendingReports] = useState(0)

  const isAdmin = mounted && user?.role === 'ADMIN'

  useEffect(() => {
    if (!mounted || user?.role !== 'ADMIN') return
    const load = () => {
      fetch('/api/reports')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data && setPendingReports(data.pendingCount ?? 0))
        .catch(() => {})
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [mounted, user?.role])

  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const handleUploadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault()
      router.push('/auth?mode=register')
    }
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={close}
          aria-label="Закрыть меню"
        />
      )}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden>
            ♫
          </span>
          <span className={styles.logoText}>MusicStream</span>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}
          >
            <span className={styles.icon}>♫</span>
            <span className={styles.navLabel}>Главная</span>
          </Link>

          <Link
            href="/search"
            className={`${styles.navItem} ${pathname === '/search' ? styles.active : ''}`}
          >
            <span className={styles.icon}>⌕</span>
            <span className={styles.navLabel}>Поиск</span>
          </Link>

          {!isAdmin && (
            <Link
              href="/upload"
              className={`${styles.navItem} ${pathname === '/upload' ? styles.active : ''}`}
              onClick={handleUploadClick}
            >
              <span className={styles.icon}>↑</span>
              <span className={styles.navLabel}>Загрузить</span>
            </Link>
          )}

          {!isAdmin && (
            <Link
              href="/playlists"
              className={`${styles.navItem} ${pathname === '/playlists' ? styles.active : ''}`}
            >
              <span className={styles.icon}>☰</span>
              <span className={styles.navLabel}>Плейлисты</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`${styles.navItem} ${pathname === '/admin' ? styles.active : ''}`}
            >
              <span className={styles.icon}>⚙</span>
              <span className={styles.navLabel}>Admin</span>
              {pendingReports > 0 && (
                <span className={styles.navBadge}>{pendingReports}</span>
              )}
            </Link>
          )}
        </nav>
      </aside>
    </>
  )
}
