'use client'

import { create } from 'zustand'
import { authService } from '@/lib/api/auth'
import type { User, LoginCredentials, ChangePasswordDto } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  initializeAuth: () => void
  refreshProfile: () => Promise<void>
  changePassword: (dto: ChangePasswordDto) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(credentials)
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
      toast.success('Login realizado com sucesso!')
      return true
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao fazer login',
        isLoading: false,
      })
      toast.error(error.message || 'Erro ao fazer login')
      return false
    }
  },

  logout: () => {
    authService.logout()
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    })
    toast.success('Logout realizado com sucesso!')
  },

  initializeAuth: () => {
    const token = authService.getStoredToken()
    const user = authService.getStoredUser()

    if (token && user) {
      set({
        user,
        isAuthenticated: true,
      })
    }
  },

  refreshProfile: async () => {
    try {
      const user = await authService.getProfile()
      set({ user })
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  },

  clearError: () => set({ error: null }),

  changePassword: async (dto) => {
    await authService.changePassword(dto)
    set((state) => {
      if (!state.user) return {}
      const updatedUser = { ...state.user, mustChangePassword: false }
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser))
      }
      return { user: updatedUser }
    })
  },
}))
