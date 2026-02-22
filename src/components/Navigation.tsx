'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navigation.module.css'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>MusicDist</span>
        </Link>
        
        <div className={styles.navLinks}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
          >
            Главная
          </Link>
          <Link 
            href="/upload" 
            className={`${styles.navLink} ${pathname === '/upload' ? styles.active : ''}`}
          >
            Загрузить музыку
          </Link>
        </div>
      </div>
    </nav>
  )
}