'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, X, Check, Trash2, Trophy, TrendingUp, Info } from 'lucide-react'
import { useNotificationStore } from '@/lib/store/notifications'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore()

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getIcon = (type: string, customIcon?: string) => {
    if (customIcon) return customIcon

    switch (type) {
      case 'points':
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 'ranking':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      default:
        return <Info className="w-5 h-5 text-slate-400" />
    }
  }

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR
      })
    } catch {
      return 'agora'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="
            fixed left-2 right-2 top-[68px] z-50
            sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96
            bg-slate-900 border border-slate-800 rounded-xl shadow-2xl
            max-h-[80vh] flex flex-col
          ">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-lg">Notificações</h3>
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                title="Limpar todas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group ${!notification.isRead ? 'bg-slate-800/30' : ''
                      }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {notification.icon ? (
                          <span className="text-2xl">{notification.icon}</span>
                        ) : (
                          getIcon(notification.type, notification.icon)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-slate-100">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400"
                            title="Remover"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-sm text-slate-300 mt-1">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-500">
                            {formatTime(notification.createdAt)}
                          </span>

                          {notification.points && (
                            <span className={`text-xs font-bold ${notification.isExactScore ? 'text-green-400' : 'text-slate-400'
                              }`}>
                              +{notification.points} pts
                            </span>
                          )}

                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-red-600 rounded-full ml-auto"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="p-3 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                leftIcon={<Check className="w-4 h-4" />}
                className="w-full"
              >
                Marcar todas como lidas
              </Button>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  )
}
