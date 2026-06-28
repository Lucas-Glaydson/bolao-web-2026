import { api } from './client'
import type { LoginCredentials, LoginResponse, RegisterDto, ChangePasswordDto, User } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'

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
    }
    
    return data
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/users/me')
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data))
    }
    
    return data
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_DATA)
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
    }
  },

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    }
    return null
  },

  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA)
      return userData ? JSON.parse(userData) : null
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
