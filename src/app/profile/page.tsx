'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { usePlayer } from '@/context/PlayerContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import { Track } from '@/types'
import styles from './profile.module.css'

export const dynamic = 'force-dynamic'

interface DashboardTrack extends Track {
  playCount: number
  createdAt: string
}

interface ProfileStats {
  tracksCount: number
  playlistsCount: number
  favoritesCount: number
  totalDuration: number
  genresCount: number
  totalPlays: number
  topTrackTitle: string | null
  topTrackPlays: number
  memberSince: string
}

function formatTotalDuration(seconds: number): string {
  if (seconds <= 0) return '0 мин'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours} ч ${mins} мин`
  return `${mins} мин`
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatPlays(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const { setQueue, playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [tracks, setTracks] = useState<DashboardTrack[]>([])
  const [profileLoading, setProfileLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    if (!user) return
    setProfileLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}/profile`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        const loadedTracks: DashboardTrack[] = data.tracks.map((t: DashboardTrack) => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          album: t.album,
          duration: t.duration,
          coverUrl: t.coverUrl || '',
          audioUrl: t.audioUrl,
          genre: t.genre,
          uploader: t.uploader,
          playCount: t.playCount ?? 0,
          createdAt: t.createdAt,
        }))
        setTracks(loadedTracks)
        setQueue(loadedTracks)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }, [user, setQueue])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?mode=login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar)
    }
  }, [user])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handlePlay = (track: DashboardTrack) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      playTrack(track)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.app}>
        <Sidebar />
        <div className={styles.mainContent}>
          <Suspense fallback={<div>Загрузка...</div>}>
            <TopBar />
          </Suspense>
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>Загрузка...</h1>
          </div>
        </div>
        <Player />
      </div>
    )
  }

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAvatar = async () => {
    if (!avatarFile || !user) return
    try {
      const reader = new FileReader()
      reader.readAsDataURL(avatarFile)
      reader.onloadend = async () => {
        const base64 = reader.result as string
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            fileName: avatarFile.name,
            fileType: avatarFile.type,
          }),
        })
        if (!uploadResponse.ok) throw new Error('Ошибка загрузки аватара')
        const { url: avatarUrl } = await uploadResponse.json()
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: avatarUrl }),
        })
        if (!response.ok) throw new Error('Ошибка сохранения')
        alert('Аватар сохранен!')
        window.location.reload()
      }
    } catch {
      alert('Ошибка сохранения аватара')
    }
  }

  const avgPlays =
    stats && stats.tracksCount > 0
      ? Math.round(stats.totalPlays / stats.tracksCount)
      : 0

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Suspense fallback={<div>Загрузка...</div>}>
          <TopBar />
        </Suspense>
        <div className={styles.content}>
          <header className={styles.dashboardHeader}>
            <div>
              <h1 className={styles.pageTitle}>Дашборд артиста</h1>
              <p className={styles.pageSubtitle}>
                Статистика ваших загрузок и прослушиваний
              </p>
            </div>
            <button
              className={styles.uploadBtn}
              onClick={() => router.push('/upload')}
            >
              + Загрузить трек
            </button>
          </header>

          <div className={styles.dashboardTop}>
            <div className={styles.userCard}>
              <div className={styles.avatarBlock}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user.name} className={styles.avatarImage} />
                ) : (
                  <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  id="avatarFile"
                  className={styles.hiddenInput}
                />
                <label htmlFor="avatarFile" className={styles.avatarBtn}>
                  Фото
                </label>
                {avatarFile && (
                  <button onClick={handleSaveAvatar} className={styles.avatarSaveBtn}>
                    OK
                  </button>
                )}
              </div>
              <div className={styles.userMeta}>
                <h2 className={styles.userName}>{user.name}</h2>
                <p className={styles.userEmail}>{user.email}</p>
                {stats && (
                  <p className={styles.userSince}>
                    На платформе с {formatMemberSince(stats.memberSince)}
                  </p>
                )}
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            </div>

            {profileLoading ? (
              <p className={styles.loadingText}>Загрузка метрик...</p>
            ) : stats ? (
              <div className={styles.metricsGrid}>
                <div className={`${styles.metricCard} ${styles.metricHighlight}`}>
                  <span className={styles.metricValue}>{stats.tracksCount}</span>
                  <span className={styles.metricLabel}>Загружено треков</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{formatPlays(stats.totalPlays)}</span>
                  <span className={styles.metricLabel}>Всего прослушиваний</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{avgPlays}</span>
                  <span className={styles.metricLabel}>В среднем на трек</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>
                    {formatTotalDuration(stats.totalDuration)}
                  </span>
                  <span className={styles.metricLabel}>Длительность каталога</span>
                </div>
                {stats.topTrackTitle && (
                  <div className={`${styles.metricCard} ${styles.metricWide}`}>
                    <span className={styles.metricValueSmall}>{stats.topTrackTitle}</span>
                    <span className={styles.metricLabel}>
                      Топ трек · {formatPlays(stats.topTrackPlays)} прослушиваний
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <section className={styles.tracksPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Ваши треки</h2>
              {stats && (
                <span className={styles.panelBadge}>
                  {stats.tracksCount} треков · {formatPlays(stats.totalPlays)} plays
                </span>
              )}
            </div>

            {profileLoading ? (
              <p className={styles.loadingText}>Загрузка треков...</p>
            ) : tracks.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Пока нет загруженных треков — начните с первой публикации.</p>
                <button
                  className={styles.uploadLink}
                  onClick={() => router.push('/upload')}
                >
                  Загрузить музыку
                </button>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.tracksTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Трек</th>
                      <th>Жанр</th>
                      <th>Дата</th>
                      <th>Длина</th>
                      <th>Прослушивания</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracks.map((track, index) => {
                      const isActive = currentTrack?.id === track.id
                      const playing = isActive && isPlaying
                      return (
                        <tr
                          key={track.id}
                          className={isActive ? styles.rowActive : undefined}
                        >
                          <td className={styles.colNum}>{index + 1}</td>
                          <td>
                            <div className={styles.trackCell}>
                              <div className={styles.trackCover}>
                                {track.coverUrl ? (
                                  <img src={track.coverUrl} alt="" />
                                ) : (
                                  <span>♪</span>
                                )}
                              </div>
                              <div>
                                <div className={styles.trackTitle}>{track.title}</div>
                                <div className={styles.trackArtist}>{track.artist}</div>
                              </div>
                            </div>
                          </td>
                          <td className={styles.colGenre}>{track.genre}</td>
                          <td className={styles.colDate}>
                            {track.createdAt ? formatDate(track.createdAt) : '—'}
                          </td>
                          <td className={styles.colDuration}>
                            {formatDuration(track.duration)}
                          </td>
                          <td>
                            <span className={styles.playsBadge}>
                              ▶ {formatPlays(track.playCount)}
                            </span>
                          </td>
                          <td>
                            <button
                              className={styles.playRowBtn}
                              onClick={() => handlePlay(track)}
                              title={playing ? 'Пауза' : 'Слушать'}
                            >
                              {playing ? '⏸' : '▶'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
      <Player />
    </div>
  )
}
