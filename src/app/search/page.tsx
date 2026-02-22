'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import TrackCard from '@/components/TrackCard'
import { Track } from '@/types'
import styles from './search.module.css'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [tracks, setTracks] = useState<Track[]>([])
  const [lastQuery, setLastQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      // Не очищаем треки, если запрос пустой
      return
    }

    const searchTracks = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/tracks/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const results = await response.json()
          setTracks(results)
          setLastQuery(query)
        }
      } catch (error) {
        console.error('Error searching tracks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    searchTracks()
  }, [query])

  return (
    <>
      <h1 className={styles.title}>Поиск</h1>
      
      {!query && tracks.length === 0 ? (
        <p className={styles.emptyMessage}>Введите название трека в поисковую строку</p>
      ) : isLoading ? (
        <p className={styles.loadingMessage}>Поиск...</p>
      ) : tracks.length === 0 && query ? (
        <p className={styles.emptyMessage}>Ничего не найдено по запросу "{query}"</p>
      ) : tracks.length > 0 ? (
        <>
          <p className={styles.resultsCount}>
            {query ? `Результаты по запросу "${query}"` : `Последний поиск: "${lastQuery}"`} - найдено треков: {tracks.length}
          </p>
          <div className={styles.tracksGrid}>
            {tracks.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}

export default function SearchPage() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <TopBar />
        <div className={styles.content}>
          <Suspense fallback={<p className={styles.loadingMessage}>Загрузка...</p>}>
            <SearchContent />
          </Suspense>
        </div>
      </div>
      <Player />
    </div>
  )
}
