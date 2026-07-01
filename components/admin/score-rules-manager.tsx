'use client'

import { useEffect, useState } from 'react'
import { Settings, RefreshCw, Save } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { rankingService } from '@/lib/api/ranking'
import { useAuthStore } from '@/lib/store/auth'
import { STAGE_LABELS } from '@/lib/constants'
import type { ScoreRule } from '@/lib/types'
import toast from 'react-hot-toast'

interface EditableRule extends ScoreRule {
  _basePoints: string
  _exactScoreBonus: string
  _saving: boolean
}

export function ScoreRulesManager() {
  const { user } = useAuthStore()
  const [rules, setRules] = useState<EditableRule[]>([])
  const [loading, setLoading] = useState(true)

  if (!user || user.role !== 'admin') return null

  useEffect(() => {
    fetchRules()
  }, [])

  async function fetchRules() {
    setLoading(true)
    try {
      const data = await rankingService.getScoreRules()
      setRules(data.map(r => ({
        ...r,
        _basePoints: String(r.basePoints),
        _exactScoreBonus: String(r.exactScoreBonus),
        _saving: false,
      })))
    } catch {
      toast.error('Erro ao carregar regras de pontuação')
    } finally {
      setLoading(false)
    }
  }

  function updateLocal(id: string, field: '_basePoints' | '_exactScoreBonus', value: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  async function handleSave(rule: EditableRule) {
    const basePoints = parseInt(rule._basePoints)
    const exactScoreBonus = parseInt(rule._exactScoreBonus)
    if (isNaN(basePoints) || isNaN(exactScoreBonus) || basePoints < 0 || exactScoreBonus < 0) {
      toast.error('Valores devem ser números inteiros não-negativos')
      return
    }
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, _saving: true } : r))
    try {
      const updated = await rankingService.updateScoreRule(rule.id, { basePoints, exactScoreBonus })
      setRules(prev => prev.map(r => r.id === rule.id
        ? { ...r, basePoints: updated.basePoints, exactScoreBonus: updated.exactScoreBonus, _saving: false }
        : r
      ))
      toast.success(`${STAGE_LABELS[rule.stage] ?? rule.stage} atualizada`)
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Erro ao salvar'
      toast.error(msg)
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, _saving: false } : r))
    }
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="text-base font-semibold text-white">Regras de Pontuação</h3>
              <p className="text-xs text-slate-400">
                Edite pontos base e bônus por placar exato de cada fase.
              </p>
            </div>
          </div>
          <button
            onClick={fetchRules}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={loading}
            title="Recarregar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Carregando...</p>
        ) : rules.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhuma regra encontrada.</p>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_60px] gap-2 px-1">
              <span className="text-xs text-slate-500">Fase</span>
              <span className="text-xs text-slate-500 text-center">Pts base</span>
              <span className="text-xs text-slate-500 text-center">Bônus exato</span>
              <span />
            </div>

            {rules.map(rule => (
              <div
                key={rule.id}
                className="grid grid-cols-[1fr_80px_80px_60px] gap-2 items-center p-2 rounded-lg bg-slate-800/50"
              >
                <span className="text-sm text-white truncate">
                  {STAGE_LABELS[rule.stage] ?? rule.stage}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={rule._basePoints}
                  onChange={e => updateLocal(rule.id, '_basePoints', e.target.value)}
                  className="text-center px-1 h-8 text-sm"
                />
                <Input
                  type="number"
                  min={0}
                  value={rule._exactScoreBonus}
                  onChange={e => updateLocal(rule.id, '_exactScoreBonus', e.target.value)}
                  className="text-center px-1 h-8 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(rule)}
                  isLoading={rule._saving}
                  className="h-8 px-2"
                  title="Salvar"
                >
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}

            <p className="text-xs text-slate-500 pt-1">
              Após alterar as regras, execute "Recalcular Pontuação" para aplicar a todos os palpites.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
