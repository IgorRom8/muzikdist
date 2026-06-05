'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { useMounted } from '@/hooks/useMounted'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import { Track } from '@/types'
import { AlbumGroup } from '@/lib/discography'
import styles from './artist.module.css'

interface ArtistInfo {
  id: string
  name: string
  avatar: string | null
}

interface ArtistStats {
  tracksCount: number
  albumsCount: number
  singlesCount: number
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatTotalDuration(tracks: Track[]): string {
  const total = tracks.reduce((sum, t) => sum + (t.duration || 0), 0)
  const mins = Math.floor(total / 60)
  if (mins < 60) return `${mins} мин`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h} ч ${m} мин`
}

function trackCountLabel(n: number, one: string, few: string, many: string) {
  if (n === 1) return one
  if (n < 5) return few
  return many
}

function AlbumCover({ url, alt }: { url: string | null; alt: string }) {
  const [failed, setFailed] = useState(false)
  const showImg = url && !failed

  return (
    <div className={styles.albumCover} aria-label={alt} role="img">
      {showImg ? (
        <img
          src={url}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.coverIcon} aria-hidden>
          ♪
        </span>
      )}
    </div>
  )
}

function ArtistContent() {
  const params = useParams()
  const artistId = params.id as string
  const mounted = useMounted()
  const { playTrack, setQueue, showPlayer, currentTrack, isPlaying, togglePlay } =
    usePlayer()

  const [artist, setArtist] = useState<ArtistInfo | null>(null)
  const [stats, setStats] = useState<ArtistStats | null>(null)
  const [albums, setAlbums] = useState<AlbumGroup[]>([])
  const [singles, setSingles] = useState<Track[]>([])
  const [allTracks, setAllTracks] = useState<Track[]>([])
  const [heroCover, setHeroCover] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumGroup | null>(null)

  const loadArtist = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/artists/${artistId}`)
      if (!res.ok) {
        setError('Артист не найден')
        return
      }
      const data = await res.json()
      setArtist(data.artist)
      setStats(data.stats)
      setAlbums(data.albums)
      setSingles(data.singles)
      setAllTracks(data.tracks)
      setQueue(data.tracks)

      const cover =
        data.artist?.avatar ||
        data.albums[0]?.coverUrl ||
        data.singles[0]?.coverUrl ||
        null
      setHeroCover(cover)
    } catch {
      setError('Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [artistId, setQueue])

  useEffect(() => {
    if (artistId) loadArtist()
  }, [artistId, loadArtist])

  useEffect(() => {
    if (!selectedAlbum) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAlbum(null)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [selectedAlbum])

  const handlePlay = (track: Track, queue: Track[]) => {
    setQueue(queue)
    playTrack(track)
    showPlayer()
  }

  const handlePlayAll = () => {
    if (allTracks.length === 0) return
    handlePlay(allTracks[0], allTracks)
  }

  const handleRowPlay = (track: Track, queue: Track[]) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      handlePlay(track, queue)
    }
  }

  const closeAlbumModal = () => setSelectedAlbum(null)

  const albumModal =
    mounted && selectedAlbum
      ? createPortal(
          <div
            className={styles.modalOverlay}
            onClick={closeAlbumModal}
            role="presentation"
          >
            <div
              className={styles.modalPanel}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="album-modal-title"
              aria-modal="true"
            >
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeAlbumModal}
                aria-label="Закрыть"
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <AlbumCover url={selectedAlbum.coverUrl} alt={selectedAlbum.name} />
                <div className={styles.modalHeaderText}>
                  <p className={styles.modalLabel}>Альбом</p>
                  <h2 id="album-modal-title" className={styles.modalTitle}>
                    {selectedAlbum.name}
                  </h2>
                  <p className={styles.modalSub}>
                    {selectedAlbum.tracks.length}{' '}
                    {trackCountLabel(
                      selectedAlbum.tracks.length,
                      'трек',
                      'трека',
                      'треков'
                    )}
                    {' · '}
                    {formatTotalDuration(selectedAlbum.tracks)}
                  </p>
                  <button
                    type="button"
                    className={styles.modalPlayAlbum}
                    onClick={() => {
                      if (selectedAlbum.tracks.length > 0) {
                        handlePlay(selectedAlbum.tracks[0], selectedAlbum.tracks)
                      }
                    }}
                  >
                    ▶ Слушать альбом
                  </button>
                </div>
              </div>

              <ol className={styles.modalTrackList}>
                {selectedAlbum.tracks.map((track, index) => {
                  const isActive = currentTrack?.id === track.id
                  const playing = isActive && isPlaying
                  return (
                    <li
                      key={track.id}
                      className={`${styles.trackRow} ${isActive ? styles.trackRowActive : ''}`}
                    >
                      <span className={styles.trackIndex}>
                        {playing ? (
                          <span className={styles.playingDot}>♪</span>
                        ) : (
                          index + 1
                        )}
                      </span>
                      <button
                        type="button"
                        className={styles.trackTitleBtn}
                        onClick={() =>
                          handleRowPlay(track, selectedAlbum.tracks)
                        }
                      >
                        {track.title}
                      </button>
                      <span className={styles.trackGenre}>{track.genre}</span>
                      <span className={styles.trackDuration}>
                        {formatDuration(track.duration)}
                      </span>
                      <button
                        type="button"
                        className={styles.trackPlayBtn}
                        onClick={() =>
                          handleRowPlay(track, selectedAlbum.tracks)
                        }
                        aria-label={playing ? 'Пауза' : 'Слушать'}
                      >
                        {playing ? '⏸' : '▶'}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>,
          document.body
        )
      : null

  if (loading) {
    return (
      <div className={styles.skeletonWrap}>
        <div className={styles.skeletonHero} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonCards}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className={styles.errorState}>
        <span className={styles.errorIcon}>♪</span>
        <p>{error || 'Артист не найден'}</p>
        <Link href="/" className={styles.backBtn}>
          На главную
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className={styles.page}>
        <section
          className={styles.hero}
          style={
            heroCover
              ? ({ '--hero-image': `url(${heroCover})` } as React.CSSProperties)
              : undefined
          }
        >
          <div className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <Link href="/" className={styles.backLink}>
              ← Назад
            </Link>

            <div className={styles.heroMain}>
              <div className={styles.avatarRing}>
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <span>{artist.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div className={styles.heroText}>
                <p className={styles.heroLabel}>Артист</p>
                <h1 className={styles.pageTitle}>{artist.name}</h1>

                {stats && (
                  <div className={styles.statChips}>
                    <span className={styles.chip}>
                      {stats.albumsCount}{' '}
                      {trackCountLabel(
                        stats.albumsCount,
                        'альбом',
                        'альбома',
                        'альбомов'
                      )}
                    </span>
                    <span className={styles.chip}>
                      {stats.singlesCount}{' '}
                      {trackCountLabel(
                        stats.singlesCount,
                        'сингл',
                        'сингла',
                        'синглов'
                      )}
                    </span>
                    <span className={styles.chip}>{stats.tracksCount} треков</span>
                    {allTracks.length > 0 && (
                      <span className={styles.chipMuted}>
                        {formatTotalDuration(allTracks)}
                      </span>
                    )}
                  </div>
                )}

                {allTracks.length > 0 && (
                  <button
                    type="button"
                    className={styles.playAllBtn}
                    onClick={handlePlayAll}
                  >
                    ▶ Слушать всё
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className={styles.body}>
          {albums.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Альбомы</h2>
                <span className={styles.sectionCount}>{albums.length}</span>
              </div>

              <div className={styles.albumsGrid}>
                {albums.map((album) => (
                  <button
                    key={album.name}
                    type="button"
                    className={styles.albumCard}
                    onClick={() => setSelectedAlbum(album)}
                  >
                    <AlbumCover url={album.coverUrl} alt={album.name} />
                    <div className={styles.albumCardInfo}>
                      <span className={styles.albumName}>{album.name}</span>
                      <span className={styles.albumSub}>
                        {album.tracks.length}{' '}
                        {trackCountLabel(
                          album.tracks.length,
                          'трек',
                          'трека',
                          'треков'
                        )}
                        {' · '}
                        {formatTotalDuration(album.tracks)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {singles.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Синглы</h2>
                <span className={styles.sectionCount}>{singles.length}</span>
              </div>

              <div className={styles.singlesGrid}>
                {singles.map((track) => {
                  const isActive = currentTrack?.id === track.id
                  const playing = isActive && isPlaying
                  return (
                    <button
                      key={track.id}
                      type="button"
                      className={`${styles.singleCard} ${isActive ? styles.singleCardActive : ''}`}
                      onClick={() => handleRowPlay(track, singles)}
                    >
                      <div className={styles.singleCoverWrap}>
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt=""
                            className={styles.singleCover}
                          />
                        ) : (
                          <div className={styles.singleCoverPlaceholder}>♪</div>
                        )}
                        <span className={styles.singlePlayBadge}>
                          {playing ? '⏸' : '▶'}
                        </span>
                      </div>
                      <div className={styles.singleInfo}>
                        <p className={styles.singleTitle}>{track.title}</p>
                        <p className={styles.singleMeta}>
                          {track.genre} · {formatDuration(track.duration)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {albums.length === 0 && singles.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>♪</span>
              <p>У артиста пока нет опубликованных треков.</p>
            </div>
          )}
        </div>
      </div>
      {albumModal}
    </>
  )
}

export default function ArtistPage() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Suspense fallback={<div className={styles.topFallback} />}>
          <TopBar />
        </Suspense>
        <div className={styles.content}>
          <Suspense fallback={<div className={styles.skeletonHero} />}>
            <ArtistContent />
          </Suspense>
        </div>
      </div>
      <Player />
    </div>
  )
}
