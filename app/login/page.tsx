'use client'

import Image from 'next/image'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Mail } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const success = await login({ email, password })

    if (success) {
      const currentUser = useAuthStore.getState().user
      if (currentUser?.mustChangePassword) {
        router.push('/change-password')
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-900/10 to-slate-950">
      <Card className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Bet Glaydson"
                width={98}
                height={98}
                className="rounded-xl"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold">Bet Glaydson</h1>
            <p className="text-slate-400">Entre para fazer seus palpites</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <PasswordInput
              label="Senha"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-800">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={!isLoading && <LogIn className="w-5 h-5" />}
            >
              Entrar
            </Button>
          </form>


        </div>
      </Card>
    </div>
  )
}
