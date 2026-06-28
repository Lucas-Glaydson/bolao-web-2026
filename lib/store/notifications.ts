'use client'

import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'points' | 'match' | 'ranking' | 'system'
  title: string
  message: string
  points?: number
  isExactScore?: boolean
  isRead: boolean
  createdAt: string
  icon?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const STORAGE_KEY = '@BetGlaydson:notifications'
const MAX_NOTIFICATIONS = 50

// Carregar notificações do localStorage
const loadNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Erro ao carregar notificações:', error)
  }
  
  return []
}

// Salvar notificações no localStorage
const saveNotifications = (notifications: Notification[]) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch (error) {
    console.error('Erro ao salvar notificações:', error)
  }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadNotifications(),
  unreadCount: loadNotifications().filter(n => !n.isRead).length,
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    
    const notifications = [newNotification, ...get().notifications].slice(0, MAX_NOTIFICATIONS)
    const unreadCount = notifications.filter(n => !n.isRead).length
    
    set({ notifications, unreadCount })
    saveNotifications(notifications)
  },
  
  markAsRead: (id) => {
    const notifications = get().notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    )
    const unreadCount = notifications.filter(n => !n.isRead).length
    
    set({ notifications, unreadCount })
    saveNotifications(notifications)
  },
  
  markAllAsRead: () => {
    const notifications = get().notifications.map(n => ({ ...n, isRead: true }))
    
    set({ notifications, unreadCount: 0 })
    saveNotifications(notifications)
  },
  
  removeNotification: (id) => {
    const notifications = get().notifications.filter(n => n.id !== id)
    const unreadCount = notifications.filter(n => !n.isRead).length
    
    set({ notifications, unreadCount })
    saveNotifications(notifications)
  },
  
  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
    saveNotifications([])
  },
}))
