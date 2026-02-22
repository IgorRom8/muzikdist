'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import TrackCard from '@/components/TrackCard'
import { Track } from '@/types'
import styles from './discover.module.css'

export const dynamic = 'force-dynamic'

function DiscoverContent() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setQueue } = usePlayer()

  useEffect(() => {
    loadTracks()
  }, [])

  useEffect(() => {
    if (tracks.length > 0) {
      setQueue(tracks)
    }
  }, [tracks, setQueue])

  const loadTracks = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/tracks')
      if (response.ok) {
        const data = await response.json()
        setTracks(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки треков:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <TopBar />
        <div className={styles.content}>
          <h1 className={styles.title}>Открыть новое</h1>
          <p className={styles.subtitle}>
            Новые треки от пользователей платформы
          </p>

          {isLoading ? (
            <p className={styles.loading}>Загрузка треков...</p>
          ) : tracks.length === 0 ? (
            <p className={styles.empty}>
              Пока нет доступных треков. Загрузите первый трек!
            </p>
          ) : (
            <>
              <p className={styles.count}>Доступно треков: {tracks.length}</p>
              <div className={styles.tracksGrid}>
                {tracks.map(track => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Player />
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <DiscoverContent />
    </Suspense>
  )
}
