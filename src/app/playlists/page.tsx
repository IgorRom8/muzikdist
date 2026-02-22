'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import styles from './playlists.module.css'

interface Playlist {
  id: string
  name: string
  description: string
  coverUrl?: string
  tracks: any[]
}

export default function PlaylistsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?mode=login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadPlaylists()
    }
  }, [user])

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

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCoverFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newPlaylistName.trim()) return

    try {
      let coverUrl = ''
      
      // Загружаем обложку если выбрана
      if (coverFile) {
        const coverBase64 = await fileToBase64(coverFile)
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: coverBase64,
            fileName: coverFile.name,
            fileType: coverFile.type
          })
        })

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          coverUrl = url
        }
      }

      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlaylistName,
          description: newPlaylistDescription,
          coverUrl: coverUrl,
          userId: user.id
        })
      })

      if (response.ok) {
        setNewPlaylistName('')
        setNewPlaylistDescription('')
        setCoverFile(null)
        setCoverPreview('')
        setIsCreating(false)
        loadPlaylists()
      }
    } catch (error) {
      console.error('Error creating playlist:', error)
    }
  }

  if (isLoading) {
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

  if (!user) {
    return null
  }

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <TopBar />
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Мои плейлисты</h1>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className={styles.createButton}
            >
              {isCreating ? 'Отмена' : '+ Создать плейлист'}
            </button>
          </div>

          {isCreating && (
            <form onSubmit={handleCreatePlaylist} className={styles.createForm}>
              <div className={styles.formGroup}>
                <label>Обложка плейлиста (необязательно)</label>
                <div className={styles.coverUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    id="coverFile"
                    className={styles.hiddenInput}
                  />
                  <label htmlFor="coverFile" className={styles.coverLabel}>
                    {coverPreview ? (
                      <img src={coverPreview} alt="Preview" className={styles.coverPreview} />
                    ) : (
                      <div className={styles.coverPlaceholder}>
                        <span>♪</span>
                        <p>Выбрать обложку</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Название плейлиста</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Введите название"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Описание (необязательно)</label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Введите описание"
                  rows={3}
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                Создать
              </button>
            </form>
          )}

          {playlists.length === 0 ? (
            <p className={styles.emptyMessage}>
              У вас пока нет плейлистов. Создайте первый!
            </p>
          ) : (
            <div className={styles.playlistsGrid}>
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={styles.playlistCard}
                  onClick={() => router.push(`/playlists/${playlist.id}`)}
                >
                  <div className={styles.playlistCover}>
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl} alt={playlist.name} />
                    ) : (
                      <span className={styles.playlistIcon}>♪</span>
                    )}
                  </div>
                  <div className={styles.playlistInfo}>
                    <h3 className={styles.playlistName}>{playlist.name}</h3>
                    <p className={styles.playlistMeta}>
                      {playlist.tracks.length} треков
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Player />
    </div>
  )
}
