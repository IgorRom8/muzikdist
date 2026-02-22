'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { usePlayer } from '@/context/PlayerContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import { Track } from '@/types'
import styles from './playlist.module.css'

interface PlaylistTrack {
  id: string
  track: Track
}

interface Playlist {
  id: string
  name: string
  description: string
  tracks: PlaylistTrack[]
}

export default function PlaylistDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()
  const { playTrack, setQueue, currentTrack, isPlaying, togglePlay } = usePlayer()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?mode=login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (params.id) {
      loadPlaylist()
    }
  }, [params.id])

  const loadPlaylist = async () => {
    try {
      const response = await fetch(`/api/playlists/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPlaylist(data)
        
        // Устанавливаем очередь треков
        const tracks = data.tracks.map((pt: PlaylistTrack) => pt.track)
        setQueue(tracks)
      }
    } catch (error) {
      console.error('Error loading playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      playTrack(track)
    }
  }

  const handleRemoveTrack = async (trackId: string) => {
    if (!confirm('Удалить трек из плейлиста?')) return

    try {
      const response = await fetch(`/api/playlists/${params.id}/tracks?trackId=${trackId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadPlaylist()
      }
    } catch (error) {
      console.error('Error removing track:', error)
      alert('Ошибка удаления трека')
    }
  }

  const handleDeletePlaylist = async () => {
    if (!confirm('Удалить плейлист?')) return

    try {
      const response = await fetch(`/api/playlists/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/playlists')
      }
    } catch (error) {
      console.error('Error deleting playlist:', error)
      alert('Ошибка удаления плейлиста')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading || loading) {
    return (
      <div className={styles.app}>
        <Sidebar />
        <div className={styles.mainContent}>
          <TopBar />
          <div className={styles.content}>
            <h1 className={styles.title}>Загрузка...</h1>
          </div>
        </div>
        <Player />
      </div>
    )
  }

  if (!user || !playlist) {
    return null
  }

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Suspense fallback={<div>Загрузка...</div>}>
          <TopBar />
        </Suspense>
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>{playlist.name}</h1>
              {playlist.description && (
                <p className={styles.description}>{playlist.description}</p>
              )}
              <p className={styles.meta}>{playlist.tracks.length} треков</p>
            </div>
            <button onClick={handleDeletePlaylist} className={styles.deleteButton}>
              Удалить плейлист
            </button>
          </div>

          {playlist.tracks.length === 0 ? (
            <p className={styles.emptyMessage}>
              В плейлисте пока нет треков. Добавьте треки через кнопку "+ Плейлист" на карточке трека.
            </p>
          ) : (
            <div className={styles.tracksList}>
              {playlist.tracks.map((playlistTrack, index) => {
                const track = playlistTrack.track
                const isCurrentTrack = currentTrack?.id === track.id

                return (
                  <div key={playlistTrack.id} className={styles.trackItem}>
                    <span className={styles.trackNumber}>{index + 1}</span>
                    
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className={styles.playButton}
                    >
                      {isCurrentTrack && isPlaying ? '⏸' : '▶'}
                    </button>

                    <div className={styles.trackCover}>
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} />
                      ) : (
                        <div className={styles.placeholder}>♪</div>
                      )}
                    </div>

                    <div className={styles.trackInfo}>
                      <div className={styles.trackTitle}>{track.title}</div>
                      <div className={styles.trackArtist}>{track.artist}</div>
                    </div>

                    <div className={styles.trackDuration}>
                      {formatDuration(track.duration)}
                    </div>

                    <button
                      onClick={() => handleRemoveTrack(track.id)}
                      className={styles.removeButton}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Player />
    </div>
  )
}
