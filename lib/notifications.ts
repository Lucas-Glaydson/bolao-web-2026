'use client'

/**
 * Serviço de Notificações
 * Gerencia notificações browser e toasts
 */

import toast from 'react-hot-toast'
import React from 'react'
import { useNotificationStore } from './store/notifications'

// Componente inline para o toast (evita problemas de import)
const PointsToastContent = ({ emoji, title, message }: { emoji: string; title: string; message: string }) => 
  React.createElement('div', { className: 'flex flex-col gap-1' },
    React.createElement('div', { className: 'font-bold text-base' }, `${emoji} ${title}`),
    React.createElement('div', { className: 'text-sm opacity-90' }, message)
  )

class NotificationService {
  private permission: NotificationPermission = 'default'

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission
    }
  }

  /**
   * Solicita permissão para notificações do navegador
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Browser não suporta notificações')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    try {
      const result = await Notification.requestPermission()
      this.permission = result
      return result === 'granted'
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error)
      return false
    }
  }

  /**
   * Envia notificação do navegador
   */
  sendBrowserNotification(title: string, options?: NotificationOptions) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (this.permission !== 'granted') {
      console.warn('Permissão de notificação não concedida')
      return
    }

    try {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options,
      })
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
    }
  }

  /**
   * Notifica quando o usuário ganhou pontos
   */
  notifyPointsEarned(points: number, matchDescription: string, isExactScore: boolean) {
    const emoji = isExactScore ? '🎯' : '✅'
    const title = isExactScore ? 'Placar Exato!' : 'Você Pontuou!'
    const message = `+${points} pontos em ${matchDescription}`

    // Adiciona ao centro de notificações
    if (typeof window !== 'undefined') {
      const store = useNotificationStore.getState()
      store.addNotification({
        type: 'points',
        title,
        message,
        points,
        isExactScore,
        icon: emoji,
      })
    }

    // Toast notification (sempre mostra)
    toast.success(
      React.createElement(PointsToastContent, { emoji, title, message }),
      {
        duration: 6000,
        icon: emoji,
        style: {
          background: isExactScore ? '#15803d' : '#1e293b',
          color: '#f1f5f9',
          border: isExactScore ? '2px solid #22c55e' : '1px solid #334155',
          minWidth: '300px',
          padding: '16px',
        },
      }
    )

    // Browser notification (se permitido)
    if (this.permission === 'granted') {
      this.sendBrowserNotification(title, {
        body: message,
        tag: 'points-earned',
        requireInteraction: false,
      })
    }
  }

  /**
   * Verifica se notificações estão habilitadas
   */
  isEnabled(): boolean {
    return this.permission === 'granted'
  }

  /**
   * Obtém status da permissão
   */
  getPermission(): NotificationPermission {
    return this.permission
  }
}

export const notificationService = new NotificationService()
