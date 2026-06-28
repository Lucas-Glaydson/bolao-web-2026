'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Target,
  Trophy,
  TrendingUp,
  BarChart3,
  Activity,
  User,
  LogOut,
  X,
  Users,
  Table,
  Grid3x3,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '@/lib/constants'
import { useAuthStore } from '@/lib/store/auth'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Início' },
    { href: '/groups', icon: Grid3x3, label: 'Fase de Grupos' },
    { href: '/standings', icon: Table, label: 'Classificação' },
    { href: '/predictions', icon: Target, label: 'Meus Palpites' },
    { href: '/predictions/all', icon: Users, label: 'Todos os Palpites' },
    { href: '/bracket', icon: Trophy, label: 'Mapa Mata-mata' },
    { href: '/ranking', icon: TrendingUp, label: 'Ranking' },
    { href: '/statistics', icon: BarChart3, label: 'Estatísticas' },
    { href: '/analysis', icon: Activity, label: 'Análise' },
    { href: '/profile', icon: User, label: 'Perfil' },
    ...(user?.role === 'admin' ? [{ href: '/admin', icon: Shield, label: 'Admin' }] : []),
  ]

  const handleLogout = () => {
    logout()
    onClose()
    router.push('/login')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={APP_CONFIG.NAME}
              width={38}
              height={38}
              className="rounded"
              priority
            />
            <span className="font-bold text-lg text-slate-50">
              {APP_CONFIG.NAME}
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-50 truncate">{user?.name}</p>
              <p className="text-sm text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-green-400 hover:bg-slate-800 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
