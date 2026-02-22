export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  audioUrl: string
  genre: string
  uploader?: string
}

export interface Playlist {
  id: string
  name: string
  description: string
  coverUrl: string
  tracks: Track[]
  userId: string
  isPublic: boolean
}

export interface Album {
  id: string
  title: string
  artist: string
  year: number
  coverUrl: string
  tracks: Track[]
  genre: string
}