'use client'

import { useState } from 'react'
import { Calculator, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { rankingService } from '@/lib/api/ranking'
import { useAuthStore } from '@/lib/store/auth'
import toast from 'react-hot-toast'

interface RecalculatePointsButtonProps {
  compact?: boolean
}

export function RecalculatePointsButton({ compact = false }: RecalculatePointsButtonProps) {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ processed: number; errors: number; message: string } | null>(null)

  if (!user || user.role !== 'admin') return null

  const handleRecalculate = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      const res = await rankingService.recalculatePoints()
      const processed = (res as any).processed ?? (res as any).recalculated ?? 0
      const errors = (res as any).errors ?? 0
      const message = res.message ?? 'Recálculo concluído'
      setResult({ processed, errors, message })
      if (errors > 0) {
        toast.success(`✅ ${processed} palpite(s) recalculado(s) com ${errors} erro(s)`)
      } else {
        toast.success(`✅ ${processed} palpite(s) recalculado(s) com sucesso`)
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Erro ao recalcular pontos'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (compact) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRecalculate}
        isLoading={isLoading}
      >
        <Calculator className={`w-4 h-4 mr-2`} />
        {isLoading ? 'Recalculando...' : 'Recalcular Pontuação'}
      </Button>
    )
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-semibold text-white">Recalcular Pontuação</h3>
            <p className="text-xs text-slate-400">
              Recalcula os pontos de todos os palpites de todas as partidas finalizadas.
            </p>
          </div>
        </div>

        {result && (
          <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${result.errors > 0 ? 'bg-yellow-500/10 text-yellow-300' : 'bg-green-500/10 text-green-300'}`}>
            {result.errors > 0
              ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              : <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            }
            <span>{result.message || `${result.processed} palpite(s) recalculado(s)`}</span>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleRecalculate}
          isLoading={isLoading}
          className="w-full"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {isLoading ? 'Recalculando...' : 'Recalcular Pontuação'}
        </Button>
      </div>
    </Card>
  )
}
