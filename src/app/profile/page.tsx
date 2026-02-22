'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Player from '@/components/Player'
import styles from './profile.module.css'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?mode=login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className={styles.app}>
        <Sidebar />
        <div className={styles.mainContent}>
          <TopBar />
          <div className={styles.content}>
            <h1 className={styles.title}>Загрузка...</h1>
          </div>
        </div>
        <Player />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      
      // Создаем превью
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAvatar = async () => {
    if (avatarFile && user) {
      try {
        // Конвертируем файл в base64
        const reader = new FileReader()
        reader.readAsDataURL(avatarFile)
        
        reader.onloadend = async () => {
          const base64 = reader.result as string
          
          // Загружаем в S3
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64,
              fileName: avatarFile.name,
              fileType: avatarFile.type
            })
          })

          if (!uploadResponse.ok) {
            throw new Error('Ошибка загрузки аватара')
          }

          const { url: avatarUrl } = await uploadResponse.json()

          // Обновляем пользователя в БД
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: avatarUrl })
          })

          if (!response.ok) {
            throw new Error('Ошибка сохранения аватара')
          }

          const updatedUser = await response.json()
          
          // Обновляем пользователя в localStorage
          localStorage.setItem('current_user', JSON.stringify(updatedUser))
          
          alert('Аватар сохранен!')
          window.location.reload()
        }
      } catch (error) {
        console.error('Error saving avatar:', error)
        alert('Ошибка сохранения аватара')
      }
    }
  }

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Suspense fallback={<div>Загрузка...</div>}>
          <TopBar />
        </Suspense>
        <div className={styles.content}>
          <h1 className={styles.title}>Профиль пользователя</h1>

          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user.name} className={styles.avatarImage} />
                ) : (
                  <div className={styles.avatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                id="avatarFile"
                className={styles.hiddenInput}
              />
              <label htmlFor="avatarFile" className={styles.uploadButton}>
                Выбрать фото
              </label>
              {avatarFile && (
                <button onClick={handleSaveAvatar} className={styles.saveButton}>
                  Сохранить
                </button>
              )}
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoGroup}>
                <label>Имя пользователя</label>
                <div className={styles.infoValue}>{user.name}</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>
      </div>
      <Player />
    </div>
  )
}
