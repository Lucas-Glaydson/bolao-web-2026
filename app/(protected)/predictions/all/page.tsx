'use client'

import { useEffect, useState } from 'react'
import { Users, Trophy, RefreshCw, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { predictionService } from '@/lib/api/predictions'
import { matchService } from '@/lib/api/matches'
import { getTeamDisplayName } from '@/lib/match-utils'
import type { BoardPrediction, Match, PredictionWithUser } from '@/lib/types'

interface PlayerRow {
  userId: string
  userName: string
  preds: Record<string, PredictionWithUser>
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function abbr(teamName: string): string {
  if (!teamName || teamName.startsWith('TBD') || teamName === 'A Definir' || teamName === 'Unknown' || teamName === 'unknown') return '---'
  return teamName.slice(0, 3).toUpperCase()
}

function dayKey(kickoffAt: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', dateStyle: 'short' }).format(new Date(kickoffAt))
}

function formatDayHeader(key: string): string {
  const date = new Date(key + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(date)
}

function formatMatchTime(kickoffAt: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(kickoffAt))
}

function cellStyle(pred: PredictionWithUser | undefined, match: Match): string {
  if (!pred) return ''
  if (match.status !== 'finished') return 'bg-slate-700/60 text-slate-200'
  if (pred.exactScoreHit) return 'bg-green-700 text-white'
  if (pred.outcomeHit) return 'bg-yellow-600 text-white'
  return 'bg-red-700/80 text-white'
}

function cellIcon(pred: PredictionWithUser | undefined, match: Match): string {
  if (!pred || match.status !== 'finished') return ''
  if (pred.exactScoreHit) return ' 🎯'
  if (pred.outcomeHit) return ' ✅'
  return ' ❌'
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AllPredictionsPage() {
  const [boardData, setBoardData] = useState<BoardPrediction[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [boardRaw, matchesData] = await Promise.allSettled([
        predictionService.getAllPredictionsBoard(),
        matchService.getAllMatches(),
      ])

      const allMatches: Match[] = matchesData.status === 'fulfilled' ? matchesData.value : []
      if (allMatches.length) setMatches(allMatches)

      let board: BoardPrediction[] = boardRaw.status === 'fulfilled' ? (boardRaw.value ?? []) : []

      // Fallback: if /predictions/board returned no predictions, fetch per knockout match
      const hasPredictions = board.some(b => (b.predictions?.length ?? 0) > 0)
      if (!hasPredictions && allMatches.length) {
        const knockoutMs = allMatches.filter(m => m.stage !== 'group_stage')
        const perMatch = await Promise.allSettled(
          knockoutMs.map(m =>
            predictionService.getPredictionsByMatch(m.id).then(preds => ({ m, preds }))
          )
        )
        board = perMatch
          .filter(r => r.status === 'fulfilled')
          .map((r: any) => {
            const { m, preds } = r.value as { m: Match; preds: any[] }
            return {
              matchId: m.id,
              match: m,
              predictions: (preds ?? []).map((p: any) => ({
                id: p.id ?? '',
                userId: p.userId ?? p.user?.id ?? p.user?._id ?? '',
                userName: p.userName ?? p.user?.name ?? p.user?.email ?? 'Usuário',
                userEmail: p.userEmail ?? p.user?.email ?? '',
                matchId: m.id,
                predictedHomeScore: p.predictedHomeScore ?? 0,
                predictedAwayScore: p.predictedAwayScore ?? 0,
                tiebreakWinner: p.tiebreakWinner ?? null,
                pointsAwarded: p.pointsAwarded ?? null,
                exactScoreHit: p.exactScoreHit ?? false,
                outcomeHit: p.outcomeHit ?? false,
                createdAt: p.createdAt ?? '',
              })),
            }
          })
      }

      setBoardData(board)
    } catch (error: any) {
      console.warn('Error fetching predictions board:', error?.message ?? error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner fullScreen text="Carregando palpites..." />

  // ── Build player map ────────────────────────────────────────────────────────
  // Defensive: handles both flat (userId/userName) and nested (user.id/user.name) shapes
  const playerMap: Record<string, PlayerRow> = {}
  boardData.forEach(board => {
    board.predictions?.forEach((pred: any) => {
      const userId = pred.userId ?? pred.user?.id ?? pred.user?._id
      const userName = pred.userName ?? pred.user?.name ?? pred.user?.email ?? 'Usuário'
      if (!userId) return
      if (!playerMap[userId]) {
        playerMap[userId] = { userId, userName, preds: {} }
      }
      const matchId = board.matchId ?? pred.matchId
      playerMap[userId].preds[matchId] = pred
    })
  })

  const players = Object.values(playerMap)
    .filter(p => p.userName && p.userName.toLowerCase() !== 'unknown')
    .sort((a, b) => a.userName.localeCompare(b.userName))
  const totalPredictions = boardData.reduce((sum, b) => sum + (b.predictions?.length ?? 0), 0)

  // ── All knockout matches grouped by day ────────────────────────────────────
  const knockoutMatches = matches
    .filter(m => m.stage !== 'group_stage')
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())

  const matchesByDay: Record<string, Match[]> = {}
  knockoutMatches.forEach(m => {
    const key = dayKey(m.kickoffAt)
    if (!matchesByDay[key]) matchesByDay[key] = []
    matchesByDay[key].push(m)
  })

  const dayKeys = Object.keys(matchesByDay).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Todos os Palpites</h1>
          <p className="text-slate-400">Palpites de todos os participantes por dia</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats + Legend */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <div className="p-4 space-y-2">
            <Users className="w-6 h-6 text-green-600" />
            <p className="text-2xl font-bold">{players.length}</p>
            <p className="text-xs text-slate-400">Participantes</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 space-y-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <p className="text-2xl font-bold">{totalPredictions}</p>
            <p className="text-xs text-slate-400">Palpites Registrados</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 flex flex-col justify-center gap-2">
            <div className="flex gap-2 flex-wrap text-xs">
              <span className="px-2 py-1 rounded bg-green-700 text-white font-medium">🎯 Placar exato</span>
              <span className="px-2 py-1 rounded bg-yellow-600 text-white font-medium">✅ Resultado certo</span>
              <span className="px-2 py-1 rounded bg-red-700/80 text-white font-medium">❌ Errou</span>
            </div>
            <p className="text-xs text-slate-400">Legenda de cores</p>
          </div>
        </Card>
      </div>

      {players.length === 0 && dayKeys.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum palpite registrado ainda</p>
          </div>
        </Card>
      ) : (
        dayKeys.map(key => {
          const dayMatches = matchesByDay[key]

          return (
            <div key={key} className="space-y-2">
              {/* Day label */}
              <div className="flex items-center gap-2 px-1">
                <Calendar className="w-4 h-4 text-green-500 shrink-0" />
                <h2 className="text-base font-semibold capitalize text-slate-200">
                  {formatDayHeader(key)}
                </h2>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="text-xs border-separate border-spacing-0" style={{ minWidth: 'max-content', width: '100%' }}>
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-3 font-semibold sticky left-0 bg-slate-900 z-10 min-w-[110px] border-r border-b border-slate-700 text-sm">
                          Participante
                        </th>

                        {dayMatches.map(match => {
                          const home = getTeamDisplayName(match.homeTeam)
                          const away = getTeamDisplayName(match.awayTeam)
                          const hasScore = match.officialHomeScore !== null && match.officialAwayScore !== null

                          return (
                            <th
                              key={match.id || match._id}
                              className="text-center py-2 px-2 font-normal min-w-[90px] border-r border-b border-slate-700 last:border-r-0"
                            >
                              <div className="leading-tight space-y-0.5">
                                <div className="font-bold text-slate-100 tracking-wide whitespace-nowrap">
                                  {abbr(home)} × {abbr(away)}
                                </div>
                                <div className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {formatMatchTime(match.kickoffAt)}
                                </div>
                                {hasScore && (
                                  <div className="text-green-400 font-bold text-[11px]">
                                    {match.officialHomeScore}–{match.officialAwayScore}
                                  </div>
                                )}
                                {match.status === 'live' && (
                                  <Badge className="text-[9px] px-1 py-0 animate-pulse bg-red-600 text-white border-0">
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player, rowIdx) => (
                        <tr
                          key={player.userId}
                          className={`hover:bg-slate-800/40 transition-colors ${rowIdx % 2 === 0 ? '' : 'bg-slate-800/20'}`}
                        >
                          <td className="py-2.5 px-3 font-medium sticky left-0 z-10 bg-slate-900 border-r border-b border-slate-700 text-sm whitespace-nowrap">
                            {player.userName}
                          </td>

                          {dayMatches.map(match => {
                            const matchId = match.id || match._id || ''
                            const pred = player.preds[matchId]

                            return (
                              <td key={matchId} className="py-2.5 px-2 text-center border-r border-b border-slate-800/50 last:border-r-0">
                                {pred ? (
                                  <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold ${cellStyle(pred, match)}`}>
                                    {pred.predictedHomeScore}×{pred.predictedAwayScore}{cellIcon(pred, match)}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 font-mono">--</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )
        })
      )}
    </div>
  )
}
