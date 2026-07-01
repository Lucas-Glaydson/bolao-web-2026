'use client'

import { useState } from 'react'
import { Hash, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { matchService } from '@/lib/api/matches'
import { useAuthStore } from '@/lib/store/auth'
import toast from 'react-hot-toast'

export function RecalculateMatchPoints() {
  const { user } = useAuthStore()
  const [matchId, setMatchId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ processed: number; errors: number; message: string } | null>(null)

  if (!user || user.role !== 'admin') return null

  const handleRecalculate = async () => {
    const id = matchId.trim()
    if (!id) {
      toast.error('Informe o ID da partida')
      return
    }
    setIsLoading(true)
    setResult(null)
    try {
      const res = await matchService.recalculateMatchPoints(id)
      setResult(res)
      if (res.errors > 0) {
        toast.success(`✅ ${res.processed} palpite(s) recalculado(s) com ${res.errors} erro(s)`)
      } else {
        toast.success(`✅ ${res.processed} palpite(s) recalculado(s)`)
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Erro ao recalcular partida'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-base font-semibold text-white">Recalcular Partida Específica</h3>
            <p className="text-xs text-slate-400">
              Força o recálculo dos pontos de todos os palpites de uma partida.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="ID da partida"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRecalculate()}
            className="flex-1 font-mono text-sm"
          />
          <Button
            variant="primary"
            onClick={handleRecalculate}
            isLoading={isLoading}
            disabled={!matchId.trim()}
          >
            Recalcular
          </Button>
        </div>

        {result && (
          <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${result.errors > 0 ? 'bg-yellow-500/10 text-yellow-300' : 'bg-green-500/10 text-green-300'}`}>
            {result.errors > 0
              ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              : <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            }
            <span>{result.message}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
