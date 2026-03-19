'use client'

import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react'
import { Track } from '@/types'

interface PlayerContextType {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: Track[]
  isPlayerVisible: boolean
  playTrack: (track: Track) => void
  togglePlay: () => void
  nextTrack: () => void
  previousTrack: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  addToQueue: (track: Track) => void
  setQueue: (tracks: Track[]) => void
  hidePlayer: () => void
  showPlayer: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [queue, setQueue] = useState<Track[]>([])
  const [isPlayerVisible, setIsPlayerVisible] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Refs для доступа к актуальным значениям внутри колбэков без пересоздания
  const currentTrackRef = useRef<Track | null>(null)
  const queueRef = useRef<Track[]>([])
  const isPlayingRef = useRef(false)

  currentTrackRef.current = currentTrack
  queueRef.current = queue
  isPlayingRef.current = isPlaying

  // Создаём audio один раз
  useEffect(() => {
    const audio = new Audio()
    audio.volume = 1
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })

    audio.addEventListener('ended', () => {
      const track = currentTrackRef.current
      const q = queueRef.current
      if (track && q.length > 0) {
        const idx = q.findIndex(t => t.id === track.id)
        if (idx < q.length - 1) {
          setCurrentTrack(q[idx + 1])
          setIsPlaying(true)
        } else {
          setIsPlaying(false)
        }
      }
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Загружаем трек когда он меняется
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    const newSrc = currentTrack.audioUrl.startsWith('http')
      ? currentTrack.audioUrl
      : `${window.location.origin}${currentTrack.audioUrl}`

    if (audio.src !== newSrc) {
      audio.pause()
      audio.src = currentTrack.audioUrl
      audio.load()
      setCurrentTime(0)
      setDuration(0)
    }
  }, [currentTrack])

  // Управляем play/pause отдельно
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      audio.play().catch(err => {
        if (err.name !== 'AbortError') console.error('Play error:', err)
        setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack])

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const togglePlay = () => setIsPlaying(prev => !prev)

  const nextTrack = () => {
    const track = currentTrackRef.current
    const q = queueRef.current
    if (!track || q.length === 0) return
    const idx = q.findIndex(t => t.id === track.id)
    if (idx < q.length - 1) {
      setCurrentTrack(q[idx + 1])
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
    }
  }

  const previousTrack = () => {
    const audio = audioRef.current
    const track = currentTrackRef.current
    const q = queueRef.current
    if (!audio || !track) return

    if (audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }

    const idx = q.findIndex(t => t.id === track.id)
    if (idx > 0) {
      setCurrentTrack(q[idx - 1])
      setIsPlaying(true)
    } else {
      audio.currentTime = 0
      setCurrentTime(0)
    }
  }

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const setVolume = (vol: number) => {
    setVolumeState(vol)
    if (audioRef.current) audioRef.current.volume = vol
  }

  const addToQueue = (track: Track) => setQueue(prev => [...prev, track])

  const hidePlayer = () => {
    setIsPlayerVisible(false)
    setIsPlaying(false)
    audioRef.current?.pause()
  }

  const showPlayer = () => setIsPlayerVisible(true)

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, currentTime, duration, volume, queue, isPlayerVisible,
      playTrack, togglePlay, nextTrack, previousTrack, seek, setVolume,
      addToQueue, setQueue, hidePlayer, showPlayer
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider')
  return context
}
