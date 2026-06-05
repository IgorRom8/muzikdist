import { Track } from '@/types'

export interface AlbumGroup {
  name: string
  coverUrl: string
  tracks: Track[]
}

export function isSingleRelease(album: string): boolean {
  const normalized = album?.trim().toLowerCase() ?? ''
  return normalized === '' || normalized === 'сингл' || normalized === 'single'
}

export function groupDiscography(tracks: Track[]): {
  singles: Track[]
  albums: AlbumGroup[]
} {
  const singles: Track[] = []
  const albumMap = new Map<string, AlbumGroup>()

  for (const track of tracks) {
    if (isSingleRelease(track.album)) {
      singles.push(track)
      continue
    }

    const albumName = track.album.trim()
    const existing = albumMap.get(albumName)
    if (existing) {
      existing.tracks.push(track)
      if (!existing.coverUrl && track.coverUrl) {
        existing.coverUrl = track.coverUrl
      }
    } else {
      albumMap.set(albumName, {
        name: albumName,
        coverUrl: track.coverUrl || '',
        tracks: [track],
      })
    }
  }

  const albums = Array.from(albumMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'ru')
  )

  singles.sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  )

  for (const album of albums) {
    album.tracks.sort((a, b) =>
      (a.createdAt || '').localeCompare(b.createdAt || '')
    )
  }

  return { singles, albums }
}
