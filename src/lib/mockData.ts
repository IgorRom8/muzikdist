import { Track, Album, Playlist } from '@/types'

export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Midnight Dreams',
    artist: 'The Synthwave',
    album: 'Neon Nights',
    duration: 245,
    coverUrl: '',
    audioUrl: '',
    genre: 'Electronic'
  },
  {
    id: '2',
    title: 'Summer Vibes',
    artist: 'Chill Beats',
    album: 'Relaxation',
    duration: 198,
    coverUrl: '',
    audioUrl: '',
    genre: 'Chill'
  },
  {
    id: '3',
    title: 'Electric Storm',
    artist: 'Bass Masters',
    album: 'Thunder',
    duration: 312,
    coverUrl: '',
    audioUrl: '',
    genre: 'EDM'
  },
  {
    id: '4',
    title: 'Acoustic Journey',
    artist: 'Folk Tales',
    album: 'Wanderlust',
    duration: 267,
    coverUrl: '',
    audioUrl: '',
    genre: 'Folk'
  },
  {
    id: '5',
    title: 'Urban Rhythm',
    artist: 'City Sounds',
    album: 'Street Life',
    duration: 223,
    coverUrl: '',
    audioUrl: '',
    genre: 'Hip-Hop'
  },
  {
    id: '6',
    title: 'Ocean Waves',
    artist: 'Nature Sounds',
    album: 'Serenity',
    duration: 189,
    coverUrl: '',
    audioUrl: '',
    genre: 'Ambient'
  }
]

export const mockAlbums: Album[] = [
  {
    id: '1',
    title: 'Neon Nights',
    artist: 'The Synthwave',
    year: 2024,
    coverUrl: '',
    tracks: [mockTracks[0]],
    genre: 'Electronic'
  },
  {
    id: '2',
    title: 'Relaxation',
    artist: 'Chill Beats',
    year: 2023,
    coverUrl: '',
    tracks: [mockTracks[1]],
    genre: 'Chill'
  },
  {
    id: '3',
    title: 'Thunder',
    artist: 'Bass Masters',
    year: 2024,
    coverUrl: '',
    tracks: [mockTracks[2]],
    genre: 'EDM'
  }
]

export const getPlaylists = (userId: string): Playlist[] => {
  const PLAYLISTS_KEY = `playlists_${userId}`
  if (typeof window === 'undefined') return []
  
  const playlistsStr = localStorage.getItem(PLAYLISTS_KEY)
  if (!playlistsStr) {
    const defaultPlaylists: Playlist[] = [
      {
        id: '1',
        name: 'Избранное',
        description: 'Ваши любимые треки',
        coverUrl: '',
        tracks: [],
        userId,
        isPublic: false
      }
    ]
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(defaultPlaylists))
    return defaultPlaylists
  }
  
  try {
    return JSON.parse(playlistsStr)
  } catch {
    return []
  }
}

export const savePlaylists = (userId: string, playlists: Playlist[]) => {
  if (typeof window === 'undefined') return
  const PLAYLISTS_KEY = `playlists_${userId}`
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists))
}