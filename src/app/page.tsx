'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import TrackCard from '@/components/TrackCard'
import { Track } from '@/types'
import styles from './page.module.css'

function HomeContent() {
  const { setQueue } = usePlayer()
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Загружаем треки из API
    const loadTracks = async () => {
      try {
        const response = await fetch('/api/tracks')
        if (response.ok) {
          const loadedTracks = await response.json()
          setTracks(loadedTracks)
        }
      } catch (error) {
        console.error('Error loading tracks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTracks()
  }, [])

  useEffect(() => {
    setQueue(tracks)
  }, [setQueue, tracks])

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <TopBar />
        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Все треки</h2>
            {isLoading ? (
              <p>Загрузка...</p>
            ) : tracks.length === 0 ? (
              <p>Треков пока нет. Загрузите первый трек!</p>
            ) : (
              <div className={styles.tracksGrid}>
                {tracks.map(track => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <Player />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <HomeContent />
    </Suspense>
  )
}