'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import { Track } from '@/types'
import pageStyles from '../page.module.css'
import styles from './admin.module.css'

interface ReportItem {
  id: string
  trackId: string
  reporterName: string
  message: string | null
  status: 'PENDING' | 'REVIEWED'
  createdAt: string
  track: {
    id: string
    title: string
    artist: string
    uploader: string | null
    genre: string
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [tracks, setTracks] = useState<Track[]>([])
  const [reports, setReports] = useState<ReportItem[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [tracksRes, reportsRes] = await Promise.all([
        fetch('/api/tracks'),
        fetch('/api/reports'),
      ])
      if (tracksRes.ok) setTracks(await tracksRes.json())
      if (reportsRes.ok) {
        const data = await reportsRes.json()
        setReports(data.reports)
        setPendingCount(data.pendingCount)
      }
    } catch (error) {
      console.error('Admin load error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData()
      const interval = setInterval(loadData, 30000)
      return () => clearInterval(interval)
    }
  }, [user, loadData])

  const markReviewed = async (reportId: string) => {
    const res = await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REVIEWED' }),
    })
    if (res.ok) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'REVIEWED' as const } : r))
      )
      setPendingCount((prev) => Math.max(0, prev - 1))
    }
  }

  const deleteTrack = async (id: string) => {
    if (!confirm('Удалить трек?')) return
    const res = await fetch(`/api/tracks/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTracks((prev) => prev.filter((t) => t.id !== id))
      setReports((prev) => prev.filter((r) => r.trackId !== id))
      loadData()
    }
  }

  const searchLower = searchQuery.trim().toLowerCase()
  const isSearching = searchLower.length > 0

  const filteredTracks = useMemo(() => {
    if (!searchLower) return tracks
    return tracks.filter((t) => {
      const haystack = [t.title, t.artist, t.uploader, t.genre, t.album]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(searchLower)
    })
  }, [tracks, searchLower])

  const filteredReports = useMemo(() => {
    if (!searchLower) return reports
    return reports.filter((r) => {
      const haystack = [
        r.reporterName,
        r.message,
        r.track.title,
        r.track.artist,
        r.track.uploader,
        r.track.genre,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(searchLower)
    })
  }, [reports, searchLower])

  const pendingReports = filteredReports.filter((r) => r.status === 'PENDING')
  const reviewedReports = filteredReports.filter((r) => r.status === 'REVIEWED')

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className={pageStyles.app}>
      <Sidebar />
      <div className={pageStyles.mainContent}>
        <TopBar />
        <div className={pageStyles.content}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>
            {isSearching
              ? `Найдено: ${filteredTracks.length} треков, ${filteredReports.length} жалоб`
              : `Всего треков: ${tracks.length}`}
          </p>

          <div className={styles.searchBar}>
            <span className={styles.searchIcon} aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по трекам, исполнителям, жанрам, жалобам..."
              aria-label="Поиск в админ-панели"
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
                aria-label="Очистить поиск"
              >
                ×
              </button>
            )}
          </div>

          <section className={styles.notificationsPanel}>
            <div className={styles.notificationsHeader}>
              <h2 className={styles.notificationsTitle}>Уведомления — жалобы</h2>
              {pendingCount > 0 && (
                <span className={styles.badge}>{pendingCount} новых</span>
              )}
            </div>

            {loading ? (
              <p className={styles.emptyNotif}>Загрузка...</p>
            ) : pendingReports.length === 0 ? (
              <p className={styles.emptyNotif}>
                {isSearching ? 'Жалоб по запросу не найдено' : 'Новых жалоб нет'}
              </p>
            ) : (
              <ul className={styles.notificationsList}>
                {pendingReports.map((report) => (
                  <li key={report.id} className={styles.notificationItem}>
                    <div className={styles.notifDot} />
                    <div className={styles.notifBody}>
                      <p className={styles.notifText}>
                        <strong>{report.reporterName}</strong> пожаловался на{' '}
                        <strong>«{report.track.title}»</strong>
                        {report.track.uploader && (
                          <span className={styles.notifMeta}>
                            {' '}
                            · {report.track.uploader}
                          </span>
                        )}
                      </p>
                      {report.message && (
                        <p className={styles.notifMessage}>{report.message}</p>
                      )}
                      <p className={styles.notifTime}>{formatDate(report.createdAt)}</p>
                    </div>
                    <div className={styles.notifActions}>
                      <button
                        className={styles.reviewBtn}
                        onClick={() => markReviewed(report.id)}
                      >
                        Прочитано
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteTrack(report.trackId)}
                      >
                        Удалить трек
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {reviewedReports.length > 0 && (
              <details className={styles.reviewedDetails}>
                <summary>Архив ({reviewedReports.length})</summary>
                <ul className={styles.notificationsList}>
                  {reviewedReports.map((report) => (
                      <li
                        key={report.id}
                        className={`${styles.notificationItem} ${styles.notificationRead}`}
                      >
                        <div className={styles.notifBody}>
                          <p className={styles.notifText}>
                            {report.reporterName} — «{report.track.title}»
                          </p>
                          {report.message && (
                            <p className={styles.notifMessage}>{report.message}</p>
                          )}
                          <p className={styles.notifTime}>{formatDate(report.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                </ul>
              </details>
            )}
          </section>

          <h2 className={styles.sectionHeading}>Все треки</h2>
          {loading ? (
            <p>Загрузка треков...</p>
          ) : filteredTracks.length === 0 ? (
            <p className={styles.emptyNotif}>
              {isSearching ? 'Треков по запросу не найдено' : 'Треков нет'}
            </p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Исполнитель</th>
                    <th>Загрузил</th>
                    <th>Жанр</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTracks.map((track) => (
                    <tr key={track.id}>
                      <td>{track.title}</td>
                      <td>{track.artist}</td>
                      <td>{track.uploader || '—'}</td>
                      <td>{track.genre}</td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deleteTrack(track.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Player />
    </div>
  )
}
