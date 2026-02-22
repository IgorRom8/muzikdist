'use client'

import { usePlayer } from '@/context/PlayerContext'
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
    hidePlayer
  } = usePlayer()

  if (!currentTrack || !isPlayerVisible) return null

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
    const newTime = percentage * duration
    seek(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none'
    const placeholder = e.currentTarget.nextElementSibling as HTMLElement
    if (placeholder) {
      placeholder.style.display = 'flex'
    }
  }

  return (
    <div className={styles.player}>
      <button 
        onClick={hidePlayer} 
        className={styles.closeButton}
        title="Скрыть плеер"
      >
        ✕
      </button>

      <div className={styles.trackInfo}>
        <div className={styles.coverWrapper}>
          {currentTrack.coverUrl ? (
            <img 
              src={currentTrack.coverUrl} 
              alt={currentTrack.title} 
              className={styles.cover}
              onError={handleImageError}
            />
          ) : null}
          <div className={styles.coverPlaceholder} style={{ display: currentTrack.coverUrl ? 'none' : 'flex' }}>♪</div>
        </div>
        <div className={styles.info}>
          <div className={styles.title}>{currentTrack.title}</div>
          <div className={styles.artist}>{currentTrack.artist}</div>
        </div>
      </div>

      <div className={styles.centerSection}>
        <div className={styles.controls}>
          <button onClick={previousTrack} className={styles.controlButton}>
            ⏮
          </button>
          <button onClick={togglePlay} className={styles.playButton}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={nextTrack} className={styles.controlButton}>
            ⏭
          </button>
        </div>

        <div className={styles.progress}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          <div className={styles.progressBar} onClick={handleProgressClick}>
            <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>

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
  )
}