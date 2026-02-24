'use client'

import { useState, useEffect } from 'react'
import { Track } from '@/types'
import { usePlayer } from '@/context/PlayerContext'
import { useAuth } from '@/context/AuthContext'
import { getFileUrl } from '@/lib/fileUrl'
import styles from './TrackCard.module.css'

interface TrackCardProps {
  track: Track
}

interface Playlist {
  id: string
  name: string
}

export default function TrackCard({ track }: TrackCardProps) {
  const { playTrack, currentTrack, isPlaying, togglePlay, showPlayer } = usePlayer()
  const { user } = useAuth()
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const isCurrentTrack = currentTrack?.id === track.id

  useEffect(() => {
    if (showPlaylistMenu && user) {
      loadPlaylists()
    }
  }, [showPlaylistMenu, user])

  const loadPlaylists = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/playlists?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data)
      }
    } catch (error) {
      console.error('Error loading playlists:', error)
    }
  }

  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay()
    } else {
      playTrack(track)
    }
    showPlayer()
  }

  const handleAddToPlaylist = async (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation()

    try {
      const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id })
      })

      if (response.ok) {
        setShowPlaylistMenu(false)
      }
    } catch (error) {
      console.error('Error adding to playlist:', error)
    }
  }

  const togglePlaylistMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPlaylistMenu(!showPlaylistMenu)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none'
    const placeholder = e.currentTarget.nextElementSibling as HTMLElement
    if (placeholder) {
      placeholder.style.display = 'flex'
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.coverContainer} onClick={handleClick}>
        {track.coverUrl ? (
          <img 
            src={getFileUrl(track.coverUrl)} 
            alt={track.title} 
            className={styles.cover}
            onError={handleImageError}
          />
        ) : null}
        <div className={styles.placeholder} style={{ display: track.coverUrl ? 'none' : 'flex' }}>♪</div>
        <div className={styles.playOverlay}>
          <button className={styles.playButton}>
            {isCurrentTrack && isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{track.title}</h3>
        <p className={styles.artist}>{track.artist}</p>
        {track.uploader && <p className={styles.uploader}>{track.uploader}</p>}
        <p className={styles.duration}>{formatDuration(track.duration)}</p>
        
        {user && (
          <div className={styles.actions}>
            <button onClick={togglePlaylistMenu} className={styles.addButton}>
              + Плейлист
            </button>
            {showPlaylistMenu && (
              <div className={styles.playlistMenu}>
                {playlists.length === 0 ? (
                  <p className={styles.noPlaylists}>Нет плейлистов</p>
                ) : (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={(e) => handleAddToPlaylist(e, playlist.id)}
                      className={styles.playlistMenuItem}
                    >
                      {playlist.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}