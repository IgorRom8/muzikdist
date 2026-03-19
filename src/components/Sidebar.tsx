'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  const handleUploadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault()
      router.push('/auth?mode=register')
    }
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>MusicStream</span>
      </div>

      <nav className={styles.nav}>
        <Link 
          href="/" 
          className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}
        >
          <span>Главная</span>
        </Link>
        
        <Link 
          href="/discover" 
          className={`${styles.navItem} ${pathname === '/discover' ? styles.active : ''}`}
        >
          <span>Открыть новое</span>
        </Link>
        
        <Link 
          href="/search" 
          className={`${styles.navItem} ${pathname === '/search' ? styles.active : ''}`}
        >
          <span>Поиск</span>
        </Link>

        {user?.role !== 'ADMIN' && (
          <Link 
            href="/upload" 
            className={`${styles.navItem} ${pathname === '/upload' ? styles.active : ''}`}
            onClick={handleUploadClick}
          >
            <span>Загрузить</span>
          </Link>
        )}

        {user?.role !== 'ADMIN' && (
          <Link 
            href="/playlists" 
            className={`${styles.navItem} ${pathname === '/playlists' ? styles.active : ''}`}
          >
            <span>Плейлисты</span>
          </Link>
        )}

        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className={`${styles.navItem} ${pathname === '/admin' ? styles.active : ''}`}
          >
            <span>Admin</span>
          </Link>
        )}
      </nav>

      <div className={styles.playlists}>
        <div className={styles.playlistsList}>
          <div className={styles.playlistItem}>
            </div>
        </div>
      </div>

      {!user && (
        <div className={styles.authSection}>
          <Link href="/auth?mode=login" className={styles.authButton}>
            Вход
          </Link>
          <Link href="/auth?mode=register" className={styles.authButton}>
            Регистрация
          </Link>
        </div>
      )}
    </aside>
  )
}