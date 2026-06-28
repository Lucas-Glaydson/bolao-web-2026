'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { notificationService } from '@/lib/notifications'
import toast from 'react-hot-toast'

export function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const currentPermission = notificationService.getPermission()
    setPermission(currentPermission)

    // Mostra prompt se ainda não foi decidido
    if (currentPermission === 'default') {
      // Aguarda 3 segundos antes de mostrar
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission()

    if (granted) {
      setPermission('granted')
      toast.success('🔔 Notificações ativadas! Você receberá alertas quando ganhar pontos.')
      setShowPrompt(false)
    } else {
      setPermission('denied')
      toast.error('❌ Permissão negada. Você pode ativar nas configurações do navegador.')
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    toast('Você pode ativar notificações depois no seu perfil.', {
      icon: 'ℹ️',
    })
  }

  if (!showPrompt || permission !== 'default') {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:bottom-4 lg:max-w-md">
      <Card className="shadow-2xl border-2 border-red-600/50">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Ativar Notificações?</h3>
              <p className="text-sm text-slate-300 mb-4">
                Receba alertas em tempo real quando seus palpites pontuarem! 🎯
              </p>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEnableNotifications}
                  leftIcon={<Check className="w-4 h-4" />}
                  className="flex-1"
                >
                  Ativar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Agora Não
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/**
 * Botão para toggle de notificações (para usar em perfil/configurações)
 */
export function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    setPermission(notificationService.getPermission())
  }, [])

  const handleToggle = async () => {
    if (permission === 'granted') {
      toast.error('Para desativar, vá nas configurações do navegador')
      return
    }

    const granted = await notificationService.requestPermission()
    setPermission(granted ? 'granted' : 'denied')

    if (granted) {
      toast.success('🔔 Notificações ativadas!')
    }
  }

  return (
    <Button
      variant={permission === 'granted' ? 'success' : 'outline'}
      onClick={handleToggle}
      leftIcon={permission === 'granted' ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
    >
      {permission === 'granted' ? 'Notificações Ativas' : 'Ativar Notificações'}
    </Button>
  )
}
