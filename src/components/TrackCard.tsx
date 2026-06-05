'use client'

import { useState, useEffect, useRef } from 'react'
import { useMounted } from '@/hooks/useMounted'
import { createPortal } from 'react-dom'
import { Track } from '@/types'
import { usePlayer } from '@/context/PlayerContext'
import { useAuth } from '@/context/AuthContext'
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
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [reportSent, setReportSent] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportMessage, setReportMessage] = useState('')
  const [reportError, setReportError] = useState('')
  const isMounted = useMounted()
  const cardRef = useRef<HTMLDivElement>(null)

  const isCurrentTrack = currentTrack?.id === track.id

  useEffect(() => {
    if (showPlaylistMenu && user) {
      loadPlaylists()
    }
  }, [showPlaylistMenu, user])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false)
        setShowPlaylistMenu(false)
      }
    }
    if (showMoreMenu || showPlaylistMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMoreMenu, showPlaylistMenu])

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
        body: JSON.stringify({ trackId: track.id }),
      })
      if (response.ok) setShowPlaylistMenu(false)
    } catch (error) {
      console.error('Error adding to playlist:', error)
    }
  }

  const togglePlaylistMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMoreMenu(false)
    setShowPlaylistMenu(!showPlaylistMenu)
  }

  const toggleMoreMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPlaylistMenu(false)
    setShowMoreMenu(!showMoreMenu)
  }

  const openReportModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (reportSent || isReporting) return
    setShowMoreMenu(false)
    setReportMessage('')
    setReportError('')
    setShowReportModal(true)
  }

  const closeReportModal = () => {
    if (isReporting) return
    setShowReportModal(false)
    setReportMessage('')
    setReportError('')
  }

  useEffect(() => {
    if (!showReportModal) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isReporting) closeReportModal()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [showReportModal, isReporting])

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const message = reportMessage.trim()
    if (!message) {
      setReportError('Укажите причину жалобы')
      return
    }

    setReportError('')
    setIsReporting(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id, message }),
      })
      if (!response.ok) throw new Error('Ошибка отправки')
      setReportSent(true)
    } catch {
      setReportError('Не удалось отправить жалобу. Попробуйте позже.')
    } finally {
      setIsReporting(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none'
    const placeholder = e.currentTarget.nextElementSibling as HTMLElement
    if (placeholder) placeholder.style.display = 'flex'
  }

  const reportModal =
    isMounted && showReportModal
      ? createPortal(
          <div
            className={styles.reportOverlay}
            onClick={closeReportModal}
            role="presentation"
          >
            <div
              className={styles.reportModal}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="report-modal-title"
              aria-modal="true"
            >
              <button
                type="button"
                className={styles.reportCloseBtn}
                onClick={closeReportModal}
                disabled={isReporting}
                aria-label="Закрыть"
              >
                ×
              </button>

              {reportSent ? (
                <div className={styles.reportSuccess}>
                  <h3 id="report-modal-title" className={styles.reportTitle}>
                    Жалоба отправлена
                  </h3>
                  <p className={styles.reportSubtitle}>
                    Спасибо! Мы рассмотрим ваше обращение.
                  </p>
                  <button
                    type="button"
                    className={styles.reportSubmitBtn}
                    onClick={closeReportModal}
                  >
                    Закрыть
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className={styles.reportForm}>
                  <h3 id="report-modal-title" className={styles.reportTitle}>
                    Пожаловаться на трек
                  </h3>
                  <p className={styles.reportSubtitle}>
                    «{track.title}» · {track.artist}
                  </p>
                  <label
                    htmlFor={`report-message-${track.id}`}
                    className={styles.reportLabel}
                  >
                    Причина жалобы
                  </label>
                  <textarea
                    id={`report-message-${track.id}`}
                    className={styles.reportTextarea}
                    value={reportMessage}
                    onChange={(e) => {
                      setReportMessage(e.target.value)
                      if (reportError) setReportError('')
                    }}
                    placeholder="Опишите, что не так с этим треком..."
                    rows={4}
                    disabled={isReporting}
                    autoFocus
                  />
                  {reportError && (
                    <p className={styles.reportError} role="alert">
                      {reportError}
                    </p>
                  )}
                  <div className={styles.reportActions}>
                    <button
                      type="button"
                      className={styles.reportCancelBtn}
                      onClick={closeReportModal}
                      disabled={isReporting}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className={styles.reportSubmitBtn}
                      disabled={isReporting}
                    >
                      {isReporting ? 'Отправка...' : 'Отправить'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
    <div className={styles.card} ref={cardRef}>
      <div className={styles.cardTop}>
        <div className={styles.coverContainer} onClick={handleClick}>
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className={styles.cover}
              onError={handleImageError}
            />
          ) : null}
          <div
            className={styles.placeholder}
            style={{ display: track.coverUrl ? 'none' : 'flex' }}
          >
            ♪
          </div>
          <div className={styles.playOverlay}>
            <button type="button" className={styles.playButton}>
              {isCurrentTrack && isPlaying ? '⏸' : '▶'}
            </button>
          </div>
        </div>

        <div className={styles.moreWrap}>
          <button
            type="button"
            className={styles.moreButton}
            onClick={toggleMoreMenu}
            aria-label="Ещё"
            title="Ещё"
          >
            ⋮
          </button>
          {showMoreMenu && (
            <div className={styles.moreMenu}>
              <button
                type="button"
                className={styles.reportButton}
                onClick={openReportModal}
                disabled={reportSent}
              >
                {reportSent ? 'Жалоба отправлена' : 'Пожаловаться'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{track.title}</h3>
        <p className={styles.artist}>{track.artist}</p>
        {track.uploader && <p className={styles.uploader}>{track.uploader}</p>}
        <p className={styles.duration}>{formatDuration(track.duration)}</p>

        {user && (
          <div className={styles.actions}>
            <button type="button" onClick={togglePlaylistMenu} className={styles.addButton}>
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
                      type="button"
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
    {reportModal}
    </>
  )
}
