'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import styles from './favorites.module.css'

export default function FavoritesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <TopBar />
        <div className={styles.content}>
          <h1 className={styles.title}>Понравившиеся треки</h1>
          
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>❤️</div>
            <h2>Пока нет избранных треков</h2>
            <p>Добавляйте треки в избранное, чтобы быстро находить их здесь</p>
          </div>
        </div>
      </div>
      <Player />
    </div>
  )
}