'use client'

import { useEffect, useRef } from 'react'
import { predictionService } from '@/lib/api/predictions'
import { notificationService } from '@/lib/notifications'
import { useAuthStore } from '@/lib/store/auth'
import { APP_CONFIG } from '@/lib/constants'

const STORAGE_KEY = '@BetGlaydson:lastKnownPoints'
const CHECK_INTERVAL = 60000 // 1 minuto

interface PointsChange {
  predictionId: string
  matchDescription: string
  points: number
  isExactScore: boolean
}

/**
 * Hook para monitorar mudanças nos pontos do usuário
 * Detecta quando o usuário ganha pontos e dispara notificações
 */
export function usePointsMonitor() {
  const { isAuthenticated } = useAuthStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<Map<string, number>>(new Map())
  const isMonitoringRef = useRef(false)

  // Carrega pontos conhecidos do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          lastCheckRef.current = new Map(Object.entries(data))
        }
      } catch (error) {
        console.error('Erro ao carregar pontos do localStorage:', error)
      }
    }
  }, [isAuthenticated])

  // Salva pontos no localStorage
  const saveLastKnownPoints = (pointsMap: Map<string, number>) => {
    if (typeof window === 'undefined') return

    try {
      const data = Object.fromEntries(pointsMap)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Erro ao salvar pontos no localStorage:', error)
    }
  }

  // Verifica novos pontos
  const checkForNewPoints = async () => {
    if (!isAuthenticated || APP_CONFIG.USE_MOCK_DATA) return

    try {
      const predictions = await predictionService.getMyPredictions()
      const newChanges: PointsChange[] = []

      predictions.forEach((prediction) => {
        const currentPoints = prediction.points || 0
        const lastKnownPoints = lastCheckRef.current.get(prediction._id || prediction.id) || 0

        // Se os pontos aumentaram
        if (currentPoints > lastKnownPoints && currentPoints > 0) {
          const pointsEarned = currentPoints - lastKnownPoints

          newChanges.push({
            predictionId: prediction._id || prediction.id,
            matchDescription: `${prediction.match?.homeTeam || 'Time'} x ${prediction.match?.awayTeam || 'Time'}`,
            points: pointsEarned,
            isExactScore: prediction.isExactScore || prediction.exactScoreHit || false,
          })

          // Atualiza o mapa local
          lastCheckRef.current.set(prediction._id || prediction.id, currentPoints)
        } else if (currentPoints >= 0) {
          // Atualiza o valor conhecido (mesmo se não mudou)
          lastCheckRef.current.set(prediction._id || prediction.id, currentPoints)
        }
      })

      // Se houver novos pontos, notifica
      if (newChanges.length > 0) {
        newChanges.forEach((change) => {
          notificationService.notifyPointsEarned(
            change.points,
            change.matchDescription,
            change.isExactScore
          )
        })

        // Salva estado atualizado
        saveLastKnownPoints(lastCheckRef.current)
      }
    } catch (error: any) {
      const message = error?.message || error?.error || JSON.stringify(error) || 'Erro desconhecido'
      console.warn('usePointsMonitor: falha ao verificar pontos —', message)
    }
  }

  // Inicia/para monitoramento baseado na autenticação
  useEffect(() => {
    // Se não está autenticado, para tudo
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isMonitoringRef.current = false
      return
    }

    // Se já está monitorando, não faz nada
    if (isMonitoringRef.current) return

    // Inicia monitoramento
    console.log('🔔 Monitoramento de pontos iniciado')
    isMonitoringRef.current = true

    // Primeira verificação imediata
    checkForNewPoints()

    // Verifica periodicamente
    intervalRef.current = setInterval(() => {
      checkForNewPoints()
    }, CHECK_INTERVAL)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isMonitoringRef.current = false
      console.log('🔕 Monitoramento de pontos parado')
    }
  }, [isAuthenticated])

  return {
    isMonitoring: isMonitoringRef.current,
    checkNow: checkForNewPoints,
  }
}
