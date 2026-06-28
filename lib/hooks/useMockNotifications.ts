import { useNotificationStore } from '@/lib/store/notifications'
import { useEffect, useRef } from 'react'
import { APP_CONFIG } from '@/lib/constants'

/**
 * Hook para adicionar notificações mock (apenas para demonstração)
 * Remove este hook em produção
 */
export function useMockNotifications() {
  const hasInitialized = useRef(false)
  const addNotification = useNotificationStore(state => state.addNotification)

  useEffect(() => {
    // Só adiciona notificações em modo mock
    if (!APP_CONFIG.USE_MOCK_DATA) return
    if (hasInitialized.current) return
    
    hasInitialized.current = true
    
    // Adiciona algumas notificações de exemplo
    setTimeout(() => {
      addNotification({
        type: 'points',
        title: '🎯 Placar Exato!',
        message: '+2 pontos em Brasil x Argentina',
        points: 2,
        isExactScore: true,
        icon: '🎯',
      })
    }, 2000)

    setTimeout(() => {
      addNotification({
        type: 'points',
        title: '✅ Você Pontuou!',
        message: '+1 ponto em França x Alemanha',
        points: 1,
        isExactScore: false,
        icon: '✅',
      })
    }, 4000)

    setTimeout(() => {
      addNotification({
        type: 'match',
        title: '⏰ Jogo em Breve!',
        message: 'Brasil x Argentina começa em 1 hora',
        icon: '⚽',
      })
    }, 6000)
  }, [addNotification])
}
