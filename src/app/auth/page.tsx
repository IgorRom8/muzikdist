'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import styles from './auth.module.css'

function AuthForm() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const [isLogin, setIsLogin] = useState(mode !== 'register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (mode === 'register') {
      setIsLogin(false)
    } else if (mode === 'login') {
      setIsLogin(true)
    }
  }, [mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Проверка совпадения паролей при регистрации
    if (!isLogin && password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className={styles.container}>
      <button 
        onClick={() => router.push('/')} 
        className={styles.backButton}
        title="На главную"
      >
        ← Главная
      </button>
      
      <div className={styles.authBox}>
        <div className={styles.logo}>
          <span className={styles.logoText}>MusicStream</span>
        </div>

        <h1 className={styles.title}>
          {isLogin ? 'Вход' : 'Регистрация'}
        </h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="name">Имя</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Введите ваше имя"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Повторите пароль"
                minLength={6}
              />
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className={styles.toggle}>
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setConfirmPassword('')
            }}
            className={styles.toggleButton}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  )
}


export default function AuthPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Загрузка...</div>}>
      <AuthForm />
    </Suspense>
  )
}
