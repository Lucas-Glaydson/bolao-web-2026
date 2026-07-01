'use client'

import { useEffect, useState } from 'react'
import { Shield, Lock, Unlock, RefreshCw, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth'
import { stageService } from '@/lib/api/stages'
import { matchService } from '@/lib/api/matches'
import { GenerateKnockoutButton } from '@/components/admin/generate-knockout-button'
import { SyncMatchesButton } from '@/components/admin/sync-matches-button'
import { RecalculatePointsButton } from '@/components/admin/recalculate-points-button'
import { RecalculateMatchPoints } from '@/components/admin/recalculate-match-points'
import { ScoreRulesManager } from '@/components/admin/score-rules-manager'
import type { StageControl } from '@/lib/types'
import { STAGE_LABELS } from '@/lib/constants'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [stages, setStages] = useState<StageControl[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    if (user.role !== 'admin') {
      router.replace('/dashboard')
      return
    }
    fetchStages()
    // Sincroniza placares automaticamente ao carregar o painel admin
    matchService.syncMatches().catch(() => {/* silencioso */ })
  }, [user])

  async function fetchStages() {
    setLoading(true)
    try {
      const data = await stageService.getStages()
      setStages(data)
    } catch {
      toast.error('Erro ao carregar fases')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(stage: StageControl) {
    setActionLoading(stage.stage)
    try {
      if (stage.allowPredictions) {
        await stageService.closeStage(stage.stage)
        toast.success(`${STAGE_LABELS[stage.stage] ?? stage.stage} fechada`)
      } else {
        await stageService.openStage(stage.stage)
        toast.success(`${STAGE_LABELS[stage.stage] ?? stage.stage} aberta para palpites!`)
      }
      await fetchStages()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erro ao alterar fase')
    } finally {
      setActionLoading(null)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-yellow-500" />
        <h1 className="text-xl font-bold text-white">Painel Admin</h1>
      </div>

      {/* Controle de Fases */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Fases — Controle de Palpites</h2>
            <button
              onClick={fetchStages}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <p className="text-slate-400 text-sm">Carregando...</p>
          ) : stages.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhuma fase encontrada.</p>
          ) : (
            <div className="space-y-3">
              {stages.map((stage) => (
                <div
                  key={stage.id ?? stage.stage}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    {stage.allowPredictions ? (
                      <Unlock className="w-4 h-4 text-green-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {STAGE_LABELS[stage.stage as keyof typeof STAGE_LABELS] ?? stage.stage}
                      </p>
                      <p className={`text-xs ${stage.allowPredictions ? 'text-green-400' : 'text-slate-500'}`}>
                        {stage.allowPredictions ? 'Aberta para palpites' : 'Fechada'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant={stage.allowPredictions ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleToggle(stage)}
                    disabled={actionLoading === stage.stage}
                  >
                    {actionLoading === stage.stage
                      ? '...'
                      : stage.allowPredictions
                        ? 'Fechar'
                        : 'Abrir'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Sincronizar placares */}
      <SyncMatchesButton />

      {/* Recalcular pontuação */}
      <RecalculatePointsButton />

      {/* Recalcular partida específica */}
      <RecalculateMatchPoints />

      {/* Regras de pontuação */}
      <ScoreRulesManager />

      {/* Gerar fase eliminatória */}
      <GenerateKnockoutButton />
    </div>
  )
}
