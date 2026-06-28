'use client'

import { useState } from 'react'
import { Clock, Lock, Edit2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TeamLogo } from '@/components/ui/team-logo'
import { predictionService } from '@/lib/api/predictions'
import { STATUS_LABELS, STATUS_COLORS, STAGE_LABELS } from '@/lib/constants'
import {
  getTeamDisplayName,
  getTeamDisplayLogo,
  formatKickoff,
  getScore,
  canMakePrediction
} from '@/lib/match-utils'
import type { Match } from '@/lib/types'
import toast from 'react-hot-toast'

interface MatchCardProps {
  match: Match
  prediction?: { homeScore: number; awayScore: number }
  onPredictionSaved?: () => void
  showPredictionForm?: boolean
}

export function MatchCard({
  match,
  prediction,
  onPredictionSaved,
  showPredictionForm = true,
}: MatchCardProps) {
  const [homeScore, setHomeScore] = useState(prediction?.homeScore?.toString() || '')
  const [awayScore, setAwayScore] = useState(prediction?.awayScore?.toString() || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const homeTeam = getTeamDisplayName(match.homeTeam)
  const awayTeam = getTeamDisplayName(match.awayTeam)
  const homeLogo = getTeamDisplayLogo(match.homeTeamLogo, match.homeTeam)
  const awayLogo = getTeamDisplayLogo(match.awayTeamLogo, match.awayTeam)
  const canPredict = canMakePrediction(match)
  const hasScores = match.officialHomeScore !== null && match.officialAwayScore !== null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!homeScore || !awayScore) {
      toast.error('Preencha ambos os placares')
      return
    }

    setIsSubmitting(true)
    try {
      await predictionService.createOrUpdatePrediction(match.id || match._id, {
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
      })
      toast.success('Palpite salvo!')
      setIsEditing(false)
      onPredictionSaved?.()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar palpite')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Header com grupo/rodada e status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {match.roundLabel && (
              <Badge variant="secondary" className="text-xs">
                {match.roundLabel}
              </Badge>
            )}
            {match.stage && (
              <Badge variant="secondary" className="text-xs">
                {STAGE_LABELS[match.stage]}
              </Badge>
            )}
          </div>
          <Badge className={STATUS_COLORS[match.status]}>
            {STATUS_LABELS[match.status]}
          </Badge>
        </div>

        {/* Times e Placares com Logos */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Time Casa */}
          <div className="flex items-center gap-2 justify-end">
            <span className="font-semibold truncate text-right">{homeTeam}</span>
            <TeamLogo src={homeLogo} alt={homeTeam} className="w-12 h-12" teamName={match.homeTeam} />
          </div>

          {/* Placar/VS */}
          <div className="text-center min-w-[60px]">
            {hasScores ? (
              <div className="flex gap-2 items-center">
                <span className="text-2xl font-bold text-green-500">{match.officialHomeScore}</span>
                <span className="text-slate-500">×</span>
                <span className="text-2xl font-bold text-green-500">{match.officialAwayScore}</span>
              </div>
            ) : (
              <span className="text-slate-500 text-sm">×</span>
            )}
          </div>

          {/* Time Fora */}
          <div className="flex items-center gap-2">
            <TeamLogo src={awayLogo} alt={awayTeam} className="w-12 h-12" teamName={match.awayTeam} />
            <span className="font-semibold truncate">{awayTeam}</span>
          </div>
        </div>

        {/* Data/Hora */}
        {match.status === 'scheduled' && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            {formatKickoff(match.kickoffAt)}
          </div>
        )}

        {/* Palpite Existente (não editando) */}
        {prediction && !isEditing && (
          <div className="p-3 rounded-lg bg-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Seu palpite:</p>
                <p className="text-xl font-bold text-center">
                  {prediction.homeScore} × {prediction.awayScore}
                </p>
              </div>
              {canPredict && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="ml-2"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Form de Palpite (novo ou editando) */}
        {showPredictionForm && canPredict && (!prediction || isEditing) && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-2 items-center">
              <Input
                type="number"
                min="0"
                max="30"
                placeholder="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="text-center"
              />
              <span className="text-center text-slate-400">×</span>
              <Input
                type="number"
                min="0"
                max="30"
                placeholder="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="text-center"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="flex-1"
                isLoading={isSubmitting}
              >
                {prediction ? 'Atualizar' : 'Salvar Palpite'}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        )}

        {/* Bloqueado */}
        {!canPredict && !prediction && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-800/50">
            <Lock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Palpites encerrados</span>
          </div>
        )}
      </div>
    </Card>
  )
}
