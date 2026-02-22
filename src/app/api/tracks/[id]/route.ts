import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single track
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const track = await prisma.track.findUnique({
      where: { id }
    })

    if (!track) {
      return NextResponse.json(
        { error: 'Трек не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(track)
  } catch (error) {
    console.error('Error fetching track:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки трека' },
      { status: 500 }
    )
  }
}

// DELETE track
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.track.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Трек удален' })
  } catch (error) {
    console.error('Error deleting track:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления трека' },
      { status: 500 }
    )
  }
}