'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { useOnboardingStore } from '@/lib/store/onboarding'
import { usePointsMonitor } from '@/lib/hooks/usePointsMonitor'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Navbar } from '@/components/navigation/navbar'
import { Sidebar } from '@/components/navigation/sidebar'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false)
  const { initializeAuth } = useAuthStore()
  const { checkOnboardingStatus, openOnboarding, hasCompletedOnboarding, isOpen } = useOnboardingStore()

  // Hook de monitoramento de pontos
  usePointsMonitor()

  // Inicializa autenticação apenas uma vez
  useEffect(() => {
    initializeAuth()
  }, []) // Removido initializeAuth das dependências

  // Verifica status do onboarding uma única vez
  useEffect(() => {
    if (!hasCheckedOnboarding) {
      checkOnboardingStatus()
      setHasCheckedOnboarding(true)
    }
  }, [hasCheckedOnboarding]) // Removido checkOnboardingStatus das dependências

  // Abre o onboarding apenas se não foi completado e não está aberto
  useEffect(() => {
    if (hasCheckedOnboarding && !hasCompletedOnboarding && !isOpen) {
      const timer = setTimeout(() => {
        openOnboarding()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [hasCheckedOnboarding, hasCompletedOnboarding, isOpen]) // Removido openOnboarding das dependências

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 overflow-x-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="pt-16 pb-16 lg:pb-0 lg:pl-64 min-w-0 w-full">
          <div className="w-full min-w-0 px-4 py-6">
            {children}
          </div>
        </main>

        <BottomNav />
        <OnboardingModal />
      </div>
    </ProtectedRoute>
  )
}
