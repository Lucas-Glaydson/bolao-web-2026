import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-green-900 text-green-200 border-green-700',
    success: 'bg-green-900 text-green-200 border-green-700',
    warning: 'bg-yellow-900 text-yellow-200 border-yellow-700',
    danger: 'bg-red-900 text-red-200 border-red-700',
    info: 'bg-green-900 text-green-200 border-green-700',
  }

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border', variants[variant], className)}>
      {children}
    </span>
  )
}
