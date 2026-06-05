import { prisma } from '@/lib/prisma'

export async function notifyTrackDeletedByAdmin(
  authorId: string,
  trackTitle: string
) {
  await prisma.notification.create({
    data: {
      userId: authorId,
      type: 'TRACK_DELETED',
      title: 'Трек удалён',
      message: `Администратор удалил ваш трек «${trackTitle}».`,
    },
  })
}
