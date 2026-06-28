'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { authService } from '@/lib/api/auth'
import { LoadingSpinner } from '@/components/ui/loading'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializeAuth, user } = useAuthStore()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Inicializar autenticação do localStorage
    initializeAuth()

    // Verificar se tem token no localStorage
    const hasToken = authService.isAuthenticated()

    if (!hasToken) {
      router.push('/login')
      setIsChecking(false)
      return
    }

    // Verificar se precisa trocar a senha
    const storedUser = authService.getStoredUser()
    if (storedUser?.mustChangePassword) {
      router.push('/change-password')
      setIsChecking(false)
      return
    }

    setIsChecking(false)
  }, [initializeAuth, router])

  // Mostrar loading enquanto verifica autenticação
  if (isChecking) {
    return <LoadingSpinner fullScreen />
  }

  // Verificar tanto o state quanto localStorage
  const hasToken = authService.isAuthenticated()
  if (!isAuthenticated && !hasToken) {
    return null
  }

  // Bloquear acesso se precisa trocar senha
  if (user?.mustChangePassword) {
    return null
  }

  return <>{children}</>
}
