'use client'

import { useState } from 'react'

interface TeamLogoProps {
  src?: string | null
  alt: string
  className?: string
  teamName?: string
}

/**
 * Componente para exibir logo de time com fallback
 * Mostra um ícone "?" quando a imagem não carregar ou não existir
 */
export function TeamLogo({ src, alt, className = 'w-12 h-12', teamName }: TeamLogoProps) {
  const [hasError, setHasError] = useState(false)

  // Se não tem src, é time TBD, ou teve erro ao carregar
  const shouldShowFallback = !src || teamName?.startsWith('TBD') || hasError

  if (shouldShowFallback) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-700 rounded-full text-slate-400 font-bold text-xl`}
        title={alt}
      >
        ?
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} object-contain`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  )
}
