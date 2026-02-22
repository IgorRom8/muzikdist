import { User } from '@/types'

const USERS_KEY = 'music_app_users'
const CURRENT_USER_KEY = 'music_app_current_user'

export const authService = {
  register: (email: string, password: string, name: string): User | null => {
    if (typeof window === 'undefined') return null
    
    const users = authService.getAllUsers()
    
    if (users.find(u => u.email === email)) {
      throw new Error('Пользователь с таким email уже существует')
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=dc2626&color=fff`
    }
    
    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    localStorage.setItem(`${email}_password`, password)
    
    return newUser
  },
  
  login: (email: string, password: string): User | null => {
    if (typeof window === 'undefined') return null
    
    const users = authService.getAllUsers()
    const user = users.find(u => u.email === email)
    
    if (!user) {
      throw new Error('Пользователь не найден')
    }
    
    const storedPassword = localStorage.getItem(`${email}_password`)
    if (storedPassword !== password) {
      throw new Error('Неверный пароль')
    }
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    return user
  },
  
  logout: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(CURRENT_USER_KEY)
  },
  
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem(CURRENT_USER_KEY)
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },
  
  getAllUsers: (): User[] => {
    if (typeof window === 'undefined') return []
    
    const usersStr = localStorage.getItem(USERS_KEY)
    if (!usersStr) return []
    
    try {
      return JSON.parse(usersStr)
    } catch {
      return []
    }
  }
}