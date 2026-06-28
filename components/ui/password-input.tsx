'use client'

import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from './input'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

export function PasswordInput({ label, error, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <Input
      {...props}
      label={label}
      error={error}
      type={show ? 'text' : 'password'}
      leftIcon={<Lock className="w-5 h-5" />}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="text-slate-400 hover:text-slate-200 transition-colors"
          tabIndex={-1}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      }
    />
  )
}
