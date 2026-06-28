'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Shield, Bell } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { NotificationToggle } from '@/components/ui/notification-prompt'
import { useAuthStore } from '@/lib/store/auth'

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500)
  }, [])

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Carregando perfil..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Perfil</h1>
        <p className="text-slate-400">Suas informações pessoais</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-slate-400">Função</p>
                <p className="font-semibold capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Notificações */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-8 h-8 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold">Notificações de Pontos</h3>
              <p className="text-sm text-slate-400">
                Receba alertas quando seus palpites pontuarem
              </p>
            </div>
          </div>
          <NotificationToggle />
        </div>
      </Card>

      <Card>
        <div className="p-12 text-center">
          <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Edição de Perfil</h3>
          <p className="text-slate-400">
            Funcionalidade de edição estará disponível em breve
          </p>
        </div>
      </Card>
    </div>
  )
}
