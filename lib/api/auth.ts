import { api } from './client'
import type { LoginCredentials, LoginResponse, RegisterDto, ChangePasswordDto, User } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'

// ── Cookie helpers (30-day persistence) ──────────────────────────────────────
const COOKIE_MAX_DAYS = 30

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + COOKIE_MAX_DAYS * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Strict`
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`
}

export const authService = {
  async register(dto: RegisterDto): Promise<User> {
    const { data } = await api.post<User>('/users', dto)
    return data
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token)
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user))
      setCookie(STORAGE_KEYS.AUTH_TOKEN, data.access_token)
      setCookie(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user))
    }
    
    return data
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/users/me')
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data))
      setCookie(STORAGE_KEYS.USER_DATA, JSON.stringify(data))
    }
    
    return data
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_DATA)
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
      deleteCookie(STORAGE_KEYS.AUTH_TOKEN)
      deleteCookie(STORAGE_KEYS.USER_DATA)
    }
  },

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      // Cookie is the primary source (survives localStorage clears)
      return getCookie(STORAGE_KEYS.AUTH_TOKEN) ?? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    }
    return null
  },

  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const raw = getCookie(STORAGE_KEYS.USER_DATA) ?? localStorage.getItem(STORAGE_KEYS.USER_DATA)
      try { return raw ? JSON.parse(raw) : null } catch { return null }
    }
    return null
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken()
  },

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await api.patch('/auth/change-password', dto)
  },
}
