'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { usePlayer } from '@/context/PlayerContext'
import { useMounted } from '@/hooks/useMounted'
import styles from './Player.module.css'

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isPlayerVisible,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    hidePlayer,
  } = usePlayer()

  const [isExpanded, setIsExpanded] = useState(false)
  const isMounted = useMounted()

  useEffect(() => {
    if (!isExpanded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isExpanded])

  if (!isMounted || !currentTrack || !isPlayerVisible) return null

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    seek(percentage * duration)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none'
    const placeholder = e.currentTarget.nextElementSibling as HTMLElement
    if (placeholder) placeholder.style.display = 'flex'
  }

  const artistLink = currentTrack.userId ? (
    <Link
      href={`/artist/${currentTrack.userId}`}
      className={styles.metaLink}
      onClick={() => setIsExpanded(false)}
    >
      {currentTrack.artist}
    </Link>
  ) : (
    <span className={styles.artist}>{currentTrack.artist}</span>
  )

  const coverBlock = (
    <div className={styles.coverWrapper}>
      {currentTrack.coverUrl ? (
        <img
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          className={styles.cover}
          onError={handleImageError}
        />
      ) : null}
      <div
        className={styles.coverPlaceholder}
        style={{ display: currentTrack.coverUrl ? 'none' : 'flex' }}
      >
        ♪
      </div>
    </div>
  )

  const controlsBlock = (large?: boolean) => (
    <>
      <div className={large ? styles.controlsLarge : styles.controls}>
        <button type="button" onClick={previousTrack} className={styles.controlButton}>
          ⏮
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className={large ? styles.playButtonLarge : styles.playButton}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button type="button" onClick={nextTrack} className={styles.controlButton}>
          ⏭
        </button>
      </div>
      <div className={large ? styles.progressLarge : styles.progress}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <div className={styles.progressBar} onClick={handleProgressClick}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>
    </>
  )

  const expandedView =
    isMounted && isExpanded
      ? createPortal(
          <div className={styles.expandedOverlay} role="dialog" aria-modal="true">
            <button
              type="button"
              className={styles.expandedClose}
              onClick={() => setIsExpanded(false)}
              aria-label="Свернуть плеер"
            >
              ✕
            </button>
            <div className={styles.expandedInner}>
              <div className={styles.expandedCover}>{coverBlock}</div>
              <div className={styles.expandedMeta}>
                <h2 className={styles.expandedTitle}>{currentTrack.title}</h2>
                <div className={styles.expandedArtist}>{artistLink}</div>
                {currentTrack.album && (
                  <p className={styles.expandedAlbum}>{currentTrack.album}</p>
                )}
              </div>
              <div className={styles.expandedControls}>{controlsBlock(true)}</div>
              <div className={styles.expandedVolume}>
                <span className={styles.volumeIcon}>♪</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className={styles.volumeSliderLarge}
                />
              </div>
              <button
                type="button"
                className={styles.collapseBtn}
                onClick={() => setIsExpanded(false)}
              >
                Свернуть
              </button>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <div className={styles.player}>
        <button
          type="button"
          onClick={hidePlayer}
          className={styles.closeButton}
          title="Скрыть плеер"
        >
          ✕
        </button>

        <div className={styles.trackInfo}>
          {coverBlock}
          <div className={styles.info}>
            <button
              type="button"
              className={`${styles.metaLink} ${styles.titleLink}`}
              onClick={() => setIsExpanded(true)}
              title="Открыть на весь экран"
            >
              {currentTrack.title}
            </button>
            {artistLink}
          </div>
        </div>

        <div className={styles.centerSection}>{controlsBlock()}</div>

        <div className={styles.volume}>
          <span className={styles.volumeIcon}>♪</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
        </div>
      </div>
      {expandedView}
    </>
  )
}
