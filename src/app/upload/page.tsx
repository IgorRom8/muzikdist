'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
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

type AlbumTrackItem = {
  id: string
  file: File
  title: string
}

function createAlbumTrackItem(file: File): AlbumTrackItem {
  return {
    id: crypto.randomUUID(),
    file,
    title: fileNameToTitle(file.name),
  }
}

function UploadContent() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [albumTracks, setAlbumTracks] = useState<AlbumTrackItem[]>([])
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'album' | 'single'>('single')
  const [album, setAlbum] = useState('')
  const [genre, setGenre] = useState('')
  const [customGenre, setCustomGenre] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const audioInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?mode=register')
    }
  }, [user, isLoading, router])

  const handleTypeChange = (newType: 'album' | 'single') => {
    setType(newType)
    setSelectedFile(null)
    setAlbumTracks([])
    setTitle('')
  }

  const mergeAlbumTracks = (prev: AlbumTrackItem[], incoming: File[]) => {
    const merged = [...prev]
    for (const file of incoming) {
      const duplicate = merged.some(
        (item) =>
          item.file.name === file.name &&
          item.file.size === file.size &&
          item.file.lastModified === file.lastModified
      )
      if (!duplicate) merged.push(createAlbumTrackItem(file))
    }
    return merged
  }

  const isAudioFile = (file: File) =>
    file.type.startsWith('audio/') || /\.(mp3|wav|flac|ogg|m4a)$/i.test(file.name)

  const addAlbumFiles = (files: FileList | File[]) => {
    const audioOnly = Array.from(files).filter(isAudioFile)
    if (audioOnly.length === 0) {
      alert('Выберите аудиофайлы (MP3, WAV и др.)')
      return
    }
    setAlbumTracks((prev) => mergeAlbumTracks(prev, audioOnly))
  }

  const updateAlbumTrackTitle = (index: number, title: string) => {
    setAlbumTracks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, title } : item))
    )
  }

  const openAlbumFilePicker = () => {
    audioInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    if (type === 'album') {
      addAlbumFiles(files)
    } else {
      setSelectedFile(files[0])
    }
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAlbum || isUploading) return
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!isAlbum || isUploading) return
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length) {
      addAlbumFiles(e.dataTransfer.files)
    }
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCoverFile(e.target.files[0])
    }
  }

  const removeAlbumTrack = (index: number) => {
    setAlbumTracks((prev) => prev.filter((_, i) => i !== index))
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
    setAlbumTracks([])
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
    if (albumTracks.length === 0) {
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

      let uploadedCount = 0
      const errors: string[] = []

      for (let i = 0; i < albumTracks.length; i++) {
        const { file, title: trackTitle } = albumTracks[i]
        const displayTitle =
          trackTitle.trim() || fileNameToTitle(file.name)
        setUploadProgress(
          `Загрузка ${i + 1} из ${albumTracks.length}: ${displayTitle}`
        )
        try {
          const audioUrl = await uploadFile(file)
          await createTrack(
            file,
            displayTitle,
            audioUrl,
            coverUrl,
            resolvedGenre,
            albumName
          )
          uploadedCount++
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Ошибка'
          errors.push(`${displayTitle}: ${msg}`)
        }
      }

      if (uploadedCount === 0) {
        throw new Error(errors.join('\n') || 'Не удалось загрузить треки')
      }

      const suffix =
        uploadedCount === 1 ? 'трек' : uploadedCount < 5 ? 'трека' : 'треков'
      const warn =
        errors.length > 0
          ? `\n\nНе загружены (${errors.length}):\n${errors.join('\n')}`
          : ''
      alert(`Альбом «${albumName}»: ${uploadedCount} ${suffix}${warn}`)
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
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a"
            multiple={isAlbum}
            onChange={handleFileSelect}
            id="audioFile"
            className={styles.hiddenInput}
            disabled={isUploading}
          />

          {isAlbum ? (
            <div
              className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {albumTracks.length === 0 ? (
                <button
                  type="button"
                  className={styles.dropZoneEmpty}
                  onClick={openAlbumFilePicker}
                  disabled={isUploading}
                >
                  <span className={styles.dropZoneIcon}>♪</span>
                  <span className={styles.dropZoneTitle}>
                    Выберите треки или перетащите сюда
                  </span>
                  <span className={styles.dropZoneSub}>
                    MP3, WAV — можно несколько сразу (Ctrl / Shift)
                  </span>
                </button>
              ) : (
                <>
                  <div className={styles.fileListHeader}>
                    <span className={styles.fileListCount}>
                      В альбоме: {albumTracks.length}{' '}
                      {albumTracks.length === 1
                        ? 'трек'
                        : albumTracks.length < 5
                          ? 'трека'
                          : 'треков'}
                    </span>
                    <button
                      type="button"
                      className={styles.clearListButton}
                      onClick={() => setAlbumTracks([])}
                      disabled={isUploading}
                    >
                      Очистить
                    </button>
                  </div>
                  <ul className={styles.fileList}>
                    {albumTracks.map((track, index) => (
                      <li key={track.id} className={styles.fileListItem}>
                        <span className={styles.fileListNum}>{index + 1}</span>
                        <div className={styles.fileListMain}>
                          <input
                            type="text"
                            className={styles.trackTitleInput}
                            value={track.title}
                            onChange={(e) =>
                              updateAlbumTrackTitle(index, e.target.value)
                            }
                            placeholder="Название трека"
                            disabled={isUploading}
                            aria-label={`Название трека ${index + 1}`}
                          />
                          <span
                            className={styles.fileListFileName}
                            title={track.file.name}
                          >
                            {track.file.name}
                          </span>
                        </div>
                        <span className={styles.fileListMeta}>
                          {(track.file.size / 1024 / 1024).toFixed(1)} МБ
                        </span>
                        <button
                          type="button"
                          className={styles.fileListRemove}
                          onClick={() => removeAlbumTrack(index)}
                          disabled={isUploading}
                          aria-label="Удалить из списка"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className={styles.addFilesRow}>
                <button
                  type="button"
                  className={styles.addFilesButton}
                  onClick={openAlbumFilePicker}
                  disabled={isUploading}
                >
                  + Докинуть файл
                </button>
                {isDragOver && (
                  <span className={styles.dropHint}>Отпустите, чтобы добавить</span>
                )}
              </div>
              <p className={styles.hint}>
                Каждый новый выбор или перетаскивание дополняет список. Название
                трека можно изменить в поле рядом с файлом.
              </p>
            </div>
          ) : (
            <div className={styles.fileInput}>
              <label htmlFor="audioFile" className={styles.fileLabel}>
                {selectedFile ? selectedFile.name : 'Выберите аудиофайл (MP3, WAV)'}
              </label>
            </div>
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
              ? albumTracks.length > 0
                ? `Загрузить альбом (${albumTracks.length})`
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
