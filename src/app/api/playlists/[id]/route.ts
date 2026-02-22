import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single playlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        tracks: {
          include: {
            track: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!playlist) {
      return NextResponse.json(
        { error: 'Плейлист не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(playlist)
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки плейлиста' },
      { status: 500 }
    )
  }
}

// DELETE playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.playlist.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Плейлист удален' })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления плейлиста' },
      { status: 500 }
    )
  }
}

// PATCH update playlist
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description })
      }
    })

    return NextResponse.json(playlist)
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления плейлиста' },
      { status: 500 }
    )
  }
}
