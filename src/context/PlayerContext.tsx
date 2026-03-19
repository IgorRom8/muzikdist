'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'
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

  const nextTrack = () => {
    if (!currentTrack || queue.length === 0) return
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id)
    if (currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1])
      setIsPlaying(true)
    } else {
      // Если это последний трек, останавливаем воспроизведение
      setIsPlaying(false)
    }
  }

  // Создаем audio элемент при монтировании
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = volume

    const audio = audioRef.current
    let lastUpdateTime = 0

    // Обработчики событий
    const handleTimeUpdate = () => {
      // Обновляем время
      const currentTime = audio.currentTime
      const duration = audio.duration
      
      // Если близко к концу (последние 2 секунды), обновляем чаще
      const isNearEnd = duration - currentTime < 2
      const updateInterval = isNearEnd ? 100 : 250
      
      const now = Date.now()
      if (now - lastUpdateTime > updateInterval) {
        setCurrentTime(currentTime)
        lastUpdateTime = now
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      // Устанавливаем время в конец перед переключением
      setCurrentTime(audio.duration)
      // Переключаем на следующий трек
      if (currentTrack && queue.length > 0) {
        const currentIndex = queue.findIndex(t => t.id === currentTrack.id)
        if (currentIndex < queue.length - 1) {
          setCurrentTrack(queue[currentIndex + 1])
          setIsPlaying(true)
        } else {
          setIsPlaying(false)
        }
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
    }
  }, [currentTrack, queue])

  // Управление воспроизведением
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return

    const audio = audioRef.current
    let playPromise: Promise<void> | undefined

    // Останавливаем текущее воспроизведение перед загрузкой нового трека
    const loadAndPlay = async () => {
      try {
        // Если есть активный промис воспроизведения, ждем его завершения
        if (playPromise !== undefined) {
          await playPromise.catch(() => {})
        }

        // Если это новый трек, загружаем его
        const currentSrc = audio.src
        const newSrc = currentTrack.audioUrl.startsWith('http')
          ? currentTrack.audioUrl
          : `${window.location.origin}${currentTrack.audioUrl}`

        if (currentSrc !== newSrc) {
          // Останавливаем текущее воспроизведение
          audio.pause()
          audio.currentTime = 0
          
          console.log('Loading audio:', currentTrack.audioUrl)
          
          // Загружаем новый трек
          audio.src = currentTrack.audioUrl
          await audio.load()
        }

        // Воспроизводим или ставим на паузу
        if (isPlaying) {
          playPromise = audio.play()
          await playPromise
          playPromise = undefined
        } else {
          audio.pause()
        }
      } catch (error) {
        // Игнорируем ошибку прерывания воспроизведения
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Ошибка воспроизведения:', error)
        }
        setIsPlaying(false)
      }
    }

    loadAndPlay()
  }, [currentTrack, isPlaying])

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const previousTrack = () => {
    if (!currentTrack) return
    
    if (!audioRef.current) return
    
    const audio = audioRef.current
    const timeRemaining = audio.duration - audio.currentTime
    
    // Если трек закончился (осталось меньше 0.5 сек) или не играет и время близко к концу
    const hasEnded = timeRemaining < 0.5 || (audio.ended) || (!isPlaying && audio.currentTime >= audio.duration - 1)
    
    // Если трек закончился или играет больше 3 секунд, начинаем его заново
    if (hasEnded || audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
      setIsPlaying(true) // Включаем воспроизведение
      // Принудительно запускаем воспроизведение
      audio.play().catch(error => {
        console.error('Ошибка воспроизведения:', error)
      })
      return
    }
    
    // Иначе переключаемся на предыдущий трек
    if (queue.length === 0) {
      // Если нет очереди, начинаем текущий трек заново
      audio.currentTime = 0
      setCurrentTime(0)
      setIsPlaying(true)
      audio.play().catch(error => {
        console.error('Ошибка воспроизведения:', error)
      })
      return
    }
    
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id)
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1])
      setIsPlaying(true)
    } else {
      // Если это первый трек, начинаем его заново
      audio.currentTime = 0
      setCurrentTime(0)
      setIsPlaying(true)
      audio.play().catch(error => {
        console.error('Ошибка воспроизведения:', error)
      })
    }
  }

  const seek = (time: number) => {
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const setVolume = (vol: number) => {
    setVolumeState(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track])
  }

  const hidePlayer = () => {
    setIsPlayerVisible(false)
    setIsPlaying(false) // Останавливаем воспроизведение
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const showPlayer = () => {
    setIsPlayerVisible(true)
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        isPlayerVisible,
        playTrack,
        togglePlay,
        nextTrack,
        previousTrack,
        seek,
        setVolume,
        addToQueue,
        setQueue,
        hidePlayer,
        showPlayer
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}