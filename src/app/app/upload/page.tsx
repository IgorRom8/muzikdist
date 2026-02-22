'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import styles from './upload.module.css'

export default function UploadPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [genre, setGenre] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет логика загрузки файла
    alert('Функция загрузки в разработке')
  }

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <TopBar />
        <div className={styles.content}>
          <h1 className={styles.title}>Загрузить музыку</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.uploadSection}>
              <h2 className={styles.sectionTitle}>Аудиофайл</h2>
              <div className={styles.fileInput}>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav"
                  onChange={handleFileSelect}
                  id="audioFile"
                  className={styles.hiddenInput}
                />
                <label htmlFor="audioFile" className={styles.fileLabel}>
                  {selectedFile ? selectedFile.name : 'Выберите аудиофайл'}
                </label>
              </div>
            </div>

            <div className={styles.uploadSection}>
              <h2 className={styles.sectionTitle}>Обложка</h2>
              <div className={styles.fileInput}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  id="coverFile"
                  className={styles.hiddenInput}
                />
                <label htmlFor="coverFile" className={styles.fileLabel}>
                  {coverFile ? coverFile.name : 'Выберите обложку'}
                </label>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Название трека</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Введите название"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="artist">Исполнитель</label>
                <input
                  type="text"
                  id="artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  required
                  placeholder="Введите имя исполнителя"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="album">Альбом</label>
                <input
                  type="text"
                  id="album"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="Введите название альбома"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="genre">Жанр</label>
                <select
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  required
                >
                  <option value="">Выберите жанр</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="electronic">Electronic</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classical</option>
                  <option value="other">Другое</option>
                </select>
              </div>
            </div>

            <button type="submit" className={styles.submitButton}>
              Загрузить трек
            </button>
          </form>
        </div>
      </div>
      <Player />
    </div>
  )
}