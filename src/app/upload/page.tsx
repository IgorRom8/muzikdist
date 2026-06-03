'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import styles from './upload.module.css'

export const dynamic = 'force-dynamic'

function fileNameToTitle(name: string): string {
  return name.replace(/\.[^/.]+$/, '').trim() || name
}

function UploadContent() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'album' | 'single'>('single')
  const [album, setAlbum] = useState('')
  const [genre, setGenre] = useState('')
  const [customGenre, setCustomGenre] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?mode=register')
    }
  }, [user, isLoading, router])

  const handleTypeChange = (newType: 'album' | 'single') => {
    setType(newType)
    setSelectedFile(null)
    setSelectedFiles([])
    setTitle('')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    if (type === 'album') {
      setSelectedFiles(Array.from(files))
    } else {
      setSelectedFile(files[0])
    }
    e.target.value = ''
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCoverFile(e.target.files[0])
    }
  }

  const removeAlbumFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src)
        resolve(audio.duration)
      }
      audio.onerror = () => resolve(0)
    })
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', file.name)

    const res = await fetch('/api/upload-proxy', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Ошибка загрузки файла')
    }

    const { url } = await res.json()
    return url
  }

  const resolveGenre = (): string => {
    if (genre === 'other') {
      return customGenre.trim() || 'other'
    }
    return genre || 'other'
  }

  const createTrack = async (
    file: File,
    trackTitle: string,
    audioUrl: string,
    coverUrl: string,
    resolvedGenre: string,
    albumName: string
  ) => {
    const duration = await getAudioDuration(file)
    const response = await fetch('/api/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: trackTitle,
        artist: user!.name,
        album: albumName,
        duration: Math.floor(duration),
        coverUrl,
        audioUrl,
        genre: resolvedGenre,
        uploader: user!.name,
        userId: user!.id,
      }),
    })
    if (!response.ok) throw new Error('Ошибка создания трека')
  }

  const resetForm = () => {
    setSelectedFile(null)
    setSelectedFiles([])
    setTitle('')
    setType('single')
    setAlbum('')
    setGenre('')
    setCustomGenre('')
    setCoverFile(null)
    setUploadProgress('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const resolvedGenre = resolveGenre()
    if (!genre) {
      alert('Выберите жанр')
      return
    }
    if (genre === 'other' && !customGenre.trim()) {
      alert('Введите свой жанр')
      return
    }

    const albumName =
      album.trim() || (type === 'single' ? 'Сингл' : 'Альбом')

    if (type === 'single') {
      if (!selectedFile) {
        alert('Выберите аудиофайл')
        return
      }
      setIsUploading(true)
      setUploadProgress('Загрузка трека...')
      try {
        const audioUrl = await uploadFile(selectedFile)
        let coverUrl = ''
        if (coverFile) coverUrl = await uploadFile(coverFile)
        await createTrack(
          selectedFile,
          title.trim() || fileNameToTitle(selectedFile.name),
          audioUrl,
          coverUrl,
          resolvedGenre,
          albumName
        )
        alert('Трек успешно загружен!')
        resetForm()
        router.push('/')
      } catch (error) {
        console.error('Ошибка загрузки:', error)
        alert(error instanceof Error ? error.message : 'Ошибка загрузки')
      } finally {
        setIsUploading(false)
        setUploadProgress('')
      }
      return
    }

    // Альбом — несколько треков
    if (selectedFiles.length === 0) {
      alert('Выберите один или несколько аудиофайлов для альбома')
      return
    }
    if (!album.trim()) {
      alert('Введите название альбома')
      return
    }

    setIsUploading(true)
    let coverUrl = ''
    try {
      if (coverFile) {
        setUploadProgress('Загрузка обложки...')
        coverUrl = await uploadFile(coverFile)
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setUploadProgress(`Загрузка ${i + 1} из ${selectedFiles.length}: ${file.name}`)
        const audioUrl = await uploadFile(file)
        await createTrack(
          file,
          fileNameToTitle(file.name),
          audioUrl,
          coverUrl,
          resolvedGenre,
          albumName
        )
      }

      alert(
        `Альбом «${albumName}» загружен: ${selectedFiles.length} ${
          selectedFiles.length === 1 ? 'трек' : selectedFiles.length < 5 ? 'трека' : 'треков'
        }`
      )
      resetForm()
      router.push('/')
    } catch (error) {
      console.error('Ошибка загрузки альбома:', error)
      alert(error instanceof Error ? error.message : 'Ошибка загрузки')
    } finally {
      setIsUploading(false)
      setUploadProgress('')
    }
  }

  if (isLoading) {
    return <h1 className={styles.title}>Загрузка...</h1>
  }

  if (!user) {
    return null
  }

  const isAlbum = type === 'album'
  const showCustomGenre = genre === 'other'

  return (
    <>
      <h1 className={styles.title}>Загрузить музыку</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="type">Тип</label>
            <select
              id="type"
              className={styles.input}
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as 'album' | 'single')}
              disabled={isUploading}
            >
              <option value="single">Сингл</option>
              <option value="album">Альбом</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="album">
              Название {isAlbum ? 'альбома' : 'сингла'}
              {isAlbum && <span className={styles.required}> *</span>}
            </label>
            <input
              type="text"
              id="album"
              className={styles.input}
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder={
                isAlbum ? 'Например: Midnight Sessions' : 'Название сингла'
              }
              disabled={isUploading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="genre">Жанр</label>
            <select
              id="genre"
              className={styles.input}
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value)
                if (e.target.value !== 'other') setCustomGenre('')
              }}
              disabled={isUploading}
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

          {showCustomGenre && (
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label htmlFor="customGenre">Свой жанр</label>
              <input
                type="text"
                id="customGenre"
                className={styles.input}
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                placeholder="Например: Synthwave, Indie Folk..."
                disabled={isUploading}
              />
            </div>
          )}
        </div>

        <div className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>
            {isAlbum ? 'Треки альбома' : 'Аудиофайл'}
          </h2>
          <div className={styles.fileInput}>
            <input
              type="file"
              accept="audio/*,.mp3,.wav"
              multiple={isAlbum}
              onChange={handleFileSelect}
              id="audioFile"
              className={styles.hiddenInput}
              disabled={isUploading}
            />
            <label htmlFor="audioFile" className={styles.fileLabel}>
              {isAlbum
                ? selectedFiles.length > 0
                  ? `Выбрано файлов: ${selectedFiles.length}`
                  : 'Выберите несколько треков (MP3, WAV) — можно несколько сразу'
                : selectedFile
                  ? selectedFile.name
                  : 'Выберите аудиофайл (MP3, WAV)'}
            </label>
          </div>

          {isAlbum && selectedFiles.length > 0 && (
            <ul className={styles.fileList}>
              {selectedFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className={styles.fileListItem}>
                  <span className={styles.fileListNum}>{index + 1}</span>
                  <span className={styles.fileListName} title={file.name}>
                    {fileNameToTitle(file.name)}
                  </span>
                  <span className={styles.fileListMeta}>
                    {(file.size / 1024 / 1024).toFixed(1)} МБ
                  </span>
                  <button
                    type="button"
                    className={styles.fileListRemove}
                    onClick={() => removeAlbumFile(index)}
                    disabled={isUploading}
                    aria-label="Удалить из списка"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isAlbum && (
          <div className={styles.uploadSection}>
            <h2 className={styles.sectionTitle}>Название трека</h2>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Оставьте пустым — возьмём из имени файла"
              disabled={isUploading}
            />
          </div>
        )}

        <div className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>
            Обложка {isAlbum ? 'альбома' : ''} (необязательно)
          </h2>
          <div className={styles.fileInput}>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              id="coverFile"
              className={styles.hiddenInput}
              disabled={isUploading}
            />
            <label htmlFor="coverFile" className={styles.fileLabel}>
              {coverFile ? coverFile.name : 'Выберите обложку (JPG, PNG)'}
            </label>
          </div>
          {isAlbum && (
            <p className={styles.hint}>Одна обложка будет у всех треков альбома</p>
          )}
        </div>

        {uploadProgress && (
          <p className={styles.progress}>{uploadProgress}</p>
        )}

        <button type="submit" className={styles.submitButton} disabled={isUploading}>
          {isUploading
            ? 'Загрузка...'
            : isAlbum
              ? selectedFiles.length > 0
                ? `Загрузить альбом (${selectedFiles.length})`
                : 'Загрузить альбом'
              : 'Загрузить трек'}
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
