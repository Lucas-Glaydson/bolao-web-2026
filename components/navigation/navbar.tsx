'use client'

import Image from 'next/image'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { APP_CONFIG } from '@/lib/constants'
import { useAuthStore } from '@/lib/store/auth'
import { NotificationDropdown } from './notification-dropdown'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuthStore()

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 lg:left-64">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-slate-300" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={APP_CONFIG.NAME}
              width={36}
              height={36}
              className="rounded"
              priority
            />
            <span className="font-bold text-lg text-slate-50 hidden sm:block">
              {APP_CONFIG.NAME}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown />

          <Link
            href="/profile"
            className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-300 hidden md:block">
              {user?.name}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
