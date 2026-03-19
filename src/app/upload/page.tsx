'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import styles from './upload.module.css'

export const dynamic = 'force-dynamic'

function UploadContent() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'album' | 'single'>('single')
  const [album, setAlbum] = useState('')
  const [genre, setGenre] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Проверка авторизации
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?mode=register')
    }
  }, [user, isLoading, router])

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return <h1 className={styles.title}>Загрузка...</h1>
  }

  // Если пользователь не авторизован, ничего не показываем (идет редирект)
  if (!user) {
    return null
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

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src)
        resolve(audio.duration)
      }
      audio.onerror = () => {
        resolve(0)
      }
    })
  }

  const uploadFile = async (file: File): Promise<string> => {
    // Получаем presigned URL с сервера
    const res = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type })
    })

    if (!res.ok) throw new Error('Ошибка получения URL для загрузки')
    const { uploadUrl, fileUrl } = await res.json()

    // PUT без Content-Type заголовка — избегаем CORS preflight
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file
    })

    if (!uploadRes.ok) throw new Error('Ошибка загрузки файла в S3')
    return fileUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !user) {
      alert('Выберите аудиофайл')
      return
    }

    setIsUploading(true)

    try {
      const duration = await getAudioDuration(selectedFile)

      // Загружаем аудио через сервер (без прямого доступа к S3)
      const audioUrl = await uploadFile(selectedFile)

      // Загружаем обложку если есть
      let coverUrl = ''
      if (coverFile) {
        coverUrl = await uploadFile(coverFile)
      }

      // Создаем трек в базе данных
      console.log('Creating track in database...')
      const response = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || selectedFile.name,
          artist: user.name,
          album: album || (type === 'single' ? 'Сингл' : 'Альбом'),
          duration: Math.floor(duration),
          coverUrl: coverUrl,
          audioUrl: audioUrl,
          genre: genre || 'other',
          uploader: user.name,
          userId: user.id
        })
      })

      if (!response.ok) {
        throw new Error('Ошибка создания трека')
      }

      // Очищаем форму
      setSelectedFile(null)
      setTitle('')
      setType('single')
      setAlbum('')
      setGenre('')
      setCoverFile(null)

      alert('Трек успешно загружен!')

      // Перенаправляем на главную
      router.push('/')
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert(error instanceof Error ? error.message : 'Ошибка загрузки')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
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
              required
            />
            <label htmlFor="audioFile" className={styles.fileLabel}>
              {selectedFile ? selectedFile.name : 'Выберите аудиофайл (MP3, WAV)'}
            </label>
          </div>
        </div>

        <div className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>Обложка (необязательно)</h2>
          <div className={styles.fileInput}>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              id="coverFile"
              className={styles.hiddenInput}
            />
            <label htmlFor="coverFile" className={styles.fileLabel}>
              {coverFile ? coverFile.name : 'Выберите обложку (JPG, PNG)'}
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
              placeholder="Введите название"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Тип</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'album' | 'single')}
            >
              <option value="single">Сингл</option>
              <option value="album">Альбом</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="album">Название {type === 'single' ? 'сингла' : 'альбома'}</label>
            <input
              type="text"
              id="album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder={type === 'single' ? 'Введите название сингла' : 'Введите название альбома'}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="genre">Жанр</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
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

        <button type="submit" className={styles.submitButton} disabled={isUploading}>
          {isUploading ? 'Загрузка...' : 'Загрузить трек'}
        </button>
      </form>
    </>
  )
}

export default function UploadPage() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Suspense fallback={<div>Загрузка...</div>}>
          <TopBar />
        </Suspense>
        <div className={styles.content}>
          <Suspense fallback={<div>Загрузка...</div>}>
            <UploadContent />
          </Suspense>
        </div>
      </div>
      <Player />
    </div>
  )
}
