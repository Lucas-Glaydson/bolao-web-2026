'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { groupService } from '@/lib/api/groups'
import toast from 'react-hot-toast'
import type { Match } from '@/lib/types'

interface ManualScoreModalProps {
  match: Match | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ManualScoreModal({
  match,
  isOpen,
  onClose,
  onSuccess,
}: ManualScoreModalProps) {
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (match) {
      setHomeScore(match.manualHomeScore?.toString() || '0')
      setAwayScore(match.manualAwayScore?.toString() || '0')
    }
  }, [match])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!match) return

    setIsSubmitting(true)
    try {
      await groupService.setManualScore(match.id ?? match._id ?? '', parseInt(homeScore), parseInt(awayScore))
      toast.success('Placar manual definido com sucesso!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao definir placar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    if (!match) return

    setIsSubmitting(true)
    try {
      await groupService.removeManualScore(match.id ?? match._id ?? '')
      toast.success('Placar manual removido!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover placar')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!match) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <h3 className="text-xl font-bold">✏️ Placar Manual</h3>

        <div className="text-center">
          <p className="text-slate-400 text-sm mb-2">
            {match.group && `Grupo ${match.group} •`} {match.round && `Rodada ${match.round}`}
          </p>
          <p className="font-semibold">
            {match.homeTeam} <span className="text-slate-500">vs</span> {match.awayTeam}
          </p>
        </div>

        {match.useManualScore && (
          <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/50">
            <p className="text-sm text-yellow-400">⚠️ Este jogo já possui placar manual</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-2">{match.homeTeam}</label>
              <Input
                type="number"
                min="0"
                max="30"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="text-center text-2xl"
                required
              />
            </div>

            <span className="text-2xl text-slate-500 mt-6">×</span>

            <div className="flex-1">
              <label className="block text-sm mb-2">{match.awayTeam}</label>
              <Input
                type="number"
                min="0"
                max="30"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="text-center text-2xl"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
              💾 Salvar
            </Button>
            {match.useManualScore && (
              <Button type="button" variant="danger" onClick={handleRemove} isLoading={isSubmitting}>
                🗑️ Remover
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  )
}
