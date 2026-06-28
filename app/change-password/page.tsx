'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { authService } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

function hasLettersAndNumbers(value: string) {
  return /[a-zA-Z]/.test(value) && /[0-9]/.test(value)
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const { changePassword, logout } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newTouched, setNewTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const hasToken = authService.isAuthenticated()
    if (!hasToken) {
      router.replace('/login')
      return
    }
    const storedUser = authService.getStoredUser()
    if (storedUser && !storedUser.mustChangePassword) {
      router.replace('/dashboard')
    }
  }, [router])

  const newPasswordError = newTouched && newPassword && !hasLettersAndNumbers(newPassword)
    ? 'A senha deve conter letras e números'
    : undefined

  const confirmPasswordError = confirmTouched && confirmPassword && newPassword !== confirmPassword
    ? 'As senhas não coincidem'
    : undefined

  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    hasLettersAndNumbers(newPassword) &&
    newPassword === confirmPassword

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setNewTouched(true)
    setConfirmTouched(true)
    setApiError(null)

    if (!isFormValid) return

    setIsLoading(true)
    try {
      await changePassword({ currentPassword, newPassword })
      toast.success('Senha alterada com sucesso!')
      router.replace('/dashboard')
    } catch (err: any) {
      setApiError(err.message || 'Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-900/10 to-slate-950">
      <Card className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Altere sua senha</h1>
            <p className="text-slate-400 text-sm">
              Por segurança, você precisa criar uma nova senha antes de continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              label="Senha atual"
              placeholder="********"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <PasswordInput
              label="Nova senha"
              placeholder="Letras e números, mínimo 8 caracteres"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setNewTouched(true)
              }}
              error={newPasswordError}
              required
            />

            <PasswordInput
              label="Confirmar nova senha"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setConfirmTouched(true)
              }}
              error={confirmPasswordError}
              required
            />

            {apiError && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-800">
                <p className="text-sm text-red-400">{apiError}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Alterar senha
            </Button>
          </form>

          <div className="border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => logout()}
              className="w-full text-sm text-slate-500 hover:text-slate-400 transition-colors"
            >
              Sair e entrar com outra conta
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

