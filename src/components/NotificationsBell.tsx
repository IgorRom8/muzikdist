'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMounted } from '@/hooks/useMounted'
import styles from './NotificationsBell.module.css'

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

function formatTime(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин назад`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ч назад`
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function extractTrackTitle(message: string): string | null {
  const match = message.match(/«([^»]+)»/)
  return match ? match[1] : null
}

function BellIcon() {
  return (
    <svg
      className={styles.bellIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
  )
}

function NotificationsPanel({
  open,
  anchorRect,
  unreadCount,
  loading,
  items,
  onClose,
  onMarkAll,
  onMarkRead,
}: {
  open: boolean
  anchorRect: DOMRect | null
  unreadCount: number
  loading: boolean
  items: NotificationItem[]
  onClose: () => void
  onMarkAll: () => void
  onMarkRead: (id: string) => void
}) {
  if (!open || !anchorRect) return null

  const top = anchorRect.bottom + 10
  const panelWidth = Math.min(400, window.innerWidth - 24)
  const right = Math.min(
    Math.max(12, window.innerWidth - anchorRect.right),
    window.innerWidth - panelWidth - 12
  )

  return createPortal(
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <div
        className={styles.window}
        style={{ top, right }}
        role="dialog"
        aria-label="Уведомления"
        aria-modal="true"
      >
        <div className={styles.titleBar}>
          <div className={styles.titleBarLeft}>
            <span className={styles.titleBarIcon} aria-hidden>
              🔔
            </span>
            <h3 className={styles.titleBarText}>Уведомления</h3>
            {unreadCount > 0 && (
              <span className={styles.titleBarBadge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div className={styles.titleBarActions}>
            {unreadCount > 0 && (
              <button type="button" className={styles.titleBarBtn} onClick={onMarkAll}>
                Прочитать все
              </button>
            )}
            <button
              type="button"
              className={styles.titleBarClose}
              onClick={onClose}
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.skeletonList}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIconWrap}>
                <BellIcon />
              </div>
              <p className={styles.emptyTitle}>Пока тихо</p>
              <p className={styles.emptyText}>
                Здесь появятся важные сообщения, например если модератор удалит ваш
                трек.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((n) => {
                const trackTitle = extractTrackTitle(n.message)
                return (
                  <li
                    key={n.id}
                    className={`${styles.card} ${!n.read ? styles.cardUnread : styles.cardRead}`}
                  >
                    <div
                      className={`${styles.cardIcon} ${n.type === 'TRACK_DELETED' ? styles.cardIconDanger : ''}`}
                    >
                      <DeleteIcon />
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.cardHead}>
                        <span className={styles.cardTitle}>{n.title}</span>
                        {!n.read && <span className={styles.newDot} title="Новое" />}
                      </div>
                      <p className={styles.cardMessage}>
                        {trackTitle ? (
                          <>
                            Администратор удалил ваш трек{' '}
                            <strong className={styles.trackName}>«{trackTitle}»</strong>.
                          </>
                        ) : (
                          n.message
                        )}
                      </p>
                      <time className={styles.cardTime} dateTime={n.createdAt}>
                        {formatTime(n.createdAt)}
                      </time>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        className={styles.markReadBtn}
                        onClick={() => onMarkRead(n.id)}
                        title="Отметить прочитанным"
                      >
                        ✓
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

export default function NotificationsBell() {
  const mounted = useMounted()
  const bellRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const updateAnchor = useCallback(() => {
    if (bellRef.current) {
      setAnchorRect(bellRef.current.getBoundingClientRect())
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setItems(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [mounted, loadNotifications])

  useEffect(() => {
    if (!open) return
    updateAnchor()
    const onResize = () => updateAnchor()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, updateAnchor])

  const toggleOpen = async () => {
    const next = !open
    if (next) {
      updateAnchor()
      setLoading(true)
      setOpen(true)
      await loadNotifications()
      setLoading(false)
    } else {
      setOpen(false)
    }
  }

  const markRead = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    if (res.ok) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const markAllRead = async () => {
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    })
    if (res.ok) {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  if (!mounted) return null

  return (
    <>
      <button
        ref={bellRef}
        type="button"
        className={`${styles.bellBtn} ${open ? styles.bellBtnActive : ''}`}
        onClick={toggleOpen}
        aria-label="Уведомления"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className={styles.badge} aria-label={`${unreadCount} непрочитанных`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationsPanel
        open={open}
        anchorRect={anchorRect}
        unreadCount={unreadCount}
        loading={loading}
        items={items}
        onClose={() => setOpen(false)}
        onMarkAll={markAllRead}
        onMarkRead={markRead}
      />
    </>
  )
}
