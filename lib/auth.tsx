'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ACCESS_CODES } from '@/data'

export type Role = 'user' | 'admin' | 'director'
export interface User { email: string; name: string; role: Role; phone: string }

interface AuthCtx {
  user: User | null
  login: (email: string, password: string) => Promise<string | null>
  register: (data: RegisterData) => Promise<string | null>
  logout: () => void
  quickLogin: (role: Role) => Promise<void>
  oauthLogin: (token: string) => Promise<string | null>
  updateUser: (patch: { name?: string; phone?: string; password?: string }) => Promise<string | null>
}

interface RegisterData {
  name: string; lastName: string; email: string
  phone: string; password: string; role: Role; accessKey: string
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)
const LS_KEY = 'gs_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) setUser(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  function saveUser(u: User | null) {
    setUser(u)
    if (u) localStorage.setItem(LS_KEY, JSON.stringify(u))
    else localStorage.removeItem(LS_KEY)
  }

  async function login(email: string, password: string): Promise<string | null> {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return data.error ?? 'Неверный email или пароль'
      saveUser(data as User)
      return null
    } catch {
      return 'Ошибка сети'
    }
  }

  async function register(data: RegisterData): Promise<string | null> {
    if (data.role !== 'user' && data.accessKey !== ACCESS_CODES[data.role])
      return 'Неверный код доступа'
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.toLowerCase(),
          password: data.password,
          role: data.role,
          name: `${data.name} ${data.lastName}`,
          phone: data.phone,
        }),
      })
      const body = await res.json()
      if (!res.ok) return body.error ?? 'Ошибка регистрации'
      // после регистрации сразу логиним
      return login(data.email, data.password)
    } catch {
      return 'Ошибка сети'
    }
  }

  async function quickLogin(role: Role) {
    const map: Record<Role, { email: string; password: string }> = {
      user:     { email: 'user@granistrakha.ru',  password: 'user123'     },
      admin:    { email: 'admin@granistrakha.ru', password: 'admin123'    },
      director: { email: 'boss@granistrakha.ru',  password: 'director123' },
    }
    await login(map[role].email, map[role].password)
  }

  async function oauthLogin(token: string): Promise<string | null> {
    try {
      const res = await fetch('/api/auth/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) return data.error ?? 'Ошибка OAuth'
      saveUser(data as User)
      return null
    } catch {
      return 'Ошибка сети'
    }
  }

  async function updateUser(patch: { name?: string; phone?: string; password?: string }): Promise<string | null> {
    if (!user) return 'Не авторизован'
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...patch }),
      })
      const data = await res.json()
      if (!res.ok) return data.error ?? 'Ошибка сохранения'
      saveUser(data.user as User)
      return null
    } catch {
      return 'Ошибка сети'
    }
  }

  function logout() {
    saveUser(null)
  }

  return <Ctx.Provider value={{ user, login, register, logout, quickLogin, oauthLogin, updateUser }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
