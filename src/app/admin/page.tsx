'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import { Track } from '@/types'
import pageStyles from '../page.module.css'
import styles from './admin.module.css'

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch('/api/tracks')
        .then(r => r.json())
        .then(data => { setTracks(data); setLoading(false) })
    }
  }, [user])

  const deleteTrack = async (id: string) => {
    if (!confirm('Удалить трек?')) return
    const res = await fetch(`/api/tracks/${id}`, { method: 'DELETE' })
    if (res.ok) setTracks(prev => prev.filter(t => t.id !== id))
  }

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className={pageStyles.app}>
      <Sidebar />
      <div className={pageStyles.mainContent}>
        <TopBar />
        <div className={pageStyles.content}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Всего треков: {tracks.length}</p>
          {loading ? (
            <p>Загрузка треков...</p>
          ) : (
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
                {tracks.map(track => (
                  <tr key={track.id}>
                    <td>{track.title}</td>
                    <td>{track.artist}</td>
                    <td>{track.uploader || '—'}</td>
                    <td>{track.genre}</td>
                    <td>
                      <button className={styles.deleteBtn} onClick={() => deleteTrack(track.id)}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Player />
    </div>
  )
}
