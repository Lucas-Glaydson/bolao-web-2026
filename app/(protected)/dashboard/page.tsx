'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Target, TrendingUp, Clock, Award, Users, Info, Lock } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { TeamLogo } from '@/components/ui/team-logo'
import { statsService } from '@/lib/api/stats'
import { rankingService } from '@/lib/api/ranking'
import { matchService } from '@/lib/api/matches'
import { predictionService } from '@/lib/api/predictions'
import { STAGE_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { useMockNotifications } from '@/lib/hooks/useMockNotifications'
import {
  getTeamDisplayName,
  getTeamDisplayLogo,
  formatKickoff,
  isMatchLive,
  canMakePrediction
} from '@/lib/match-utils'
import type { DashboardStats, RankingEntry, Match, PredictionWithDetails, BoardPrediction } from '@/lib/types'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topRanking, setTopRanking] = useState<RankingEntry[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [myPredictions, setMyPredictions] = useState<PredictionWithDetails[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [boardData, setBoardData] = useState<BoardPrediction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock notifications para demonstração (remover em produção)
  useMockNotifications()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, rankingRes, matchesRes, predictionsRes, boardRes] = await Promise.allSettled([
          statsService.getDashboard(),
          rankingService.getRanking(),
          matchService.getAllMatches(),
          predictionService.getMyPredictions(),
          predictionService.getAllPredictionsBoard(),
        ])

        const statsData     = statsRes.status     === 'fulfilled' ? statsRes.value       : null
        const rankingData   = rankingRes.status   === 'fulfilled' ? rankingRes.value     : []
        const matchesData   = matchesRes.status   === 'fulfilled' ? matchesRes.value     : []
        const predictionsData = predictionsRes.status === 'fulfilled' ? predictionsRes.value : []
        const boardRaw      = boardRes.status     === 'fulfilled' ? boardRes.value       : []

        if (statsRes.status     === 'rejected') console.warn('stats:', statsRes.reason?.message ?? statsRes.reason)
        if (rankingRes.status   === 'rejected') console.warn('ranking:', rankingRes.reason?.message ?? rankingRes.reason)
        if (matchesRes.status   === 'rejected') console.warn('matches:', matchesRes.reason?.message ?? matchesRes.reason)
        if (predictionsRes.status === 'rejected') console.warn('predictions:', predictionsRes.reason?.message ?? predictionsRes.reason)
        if (boardRes.status     === 'rejected') console.warn('board:', boardRes.reason?.message ?? boardRes.reason)

        setStats(statsData)
        setTopRanking((rankingData as any[]).slice(0, 5))
        setUpcomingMatches((matchesData as any[]).filter((m: any) => (m.status === 'scheduled' || m.status === 'live') && m.stage !== 'group_stage'))
        setMyPredictions(predictionsData as any)
        setBoardData(boardRaw as any)
        
        // Retorna se há jogos ao vivo para configurar polling
        return (matchesData as any[]).some(isMatchLive)
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error?.message ?? error)
        return false
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch inicial
    fetchData().then((hasLive) => {
      // Configura polling apenas se houver jogos ao vivo
      if (hasLive) {
        const interval = setInterval(() => {
          fetchData()
        }, 60000) // 60 segundos
        return () => clearInterval(interval)
      }
    })
  }, []) // Array vazio - executa apenas na montagem do componente

  const handleSubmitPrediction = async (matchId: string) => {
    if (!homeScore || !awayScore) {
      toast.error('Preencha ambos os placares')
      return
    }
    setSubmitting(true)
    try {
      await predictionService.createOrUpdatePrediction(matchId, {
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
      })
      toast.success('Palpite salvo!')
      setSelectedMatch(null)
      setHomeScore('')
      setAwayScore('')
      const predictionsData = await predictionService.getMyPredictions()
      setMyPredictions(predictionsData)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao salvar palpite')
    } finally {
      setSubmitting(false)
    }
  }

  const getPrediction = (matchId: string) =>
    myPredictions.find(p => p.matchId === matchId)

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Carregando dashboard..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">Acompanhe sua performance e próximos jogos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Trophy className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{stats?.totalMatches || 0}</span>
            </div>
            <p className="text-sm text-slate-400">Total de Partidas</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Target className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{stats?.finishedMatches || 0}</span>
            </div>
            <p className="text-sm text-slate-400">Partidas Finalizadas</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="text-xl font-bold truncate max-w-[120px] block">{stats?.topScorer?.name || '-'}</span>
            </div>
            <p className="text-sm text-slate-400">Maior Pontuador</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold">{stats?.averagePointsPerUser?.toFixed(1) || 0}</span>
            </div>
            <p className="text-sm text-slate-400">Média de Pontos</p>
          </div>
        </Card>
      </div>

      {/* Guia de Pontuação */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold">Como Funciona a Pontuação</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
              <div className="text-2xl">🎯</div>
              <div>
                <p className="font-semibold text-green-500">Placar Exato</p>
                <p className="text-slate-400">Acertou o placar completo</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
              <div className="text-2xl">✅</div>
              <div>
                <p className="font-semibold text-green-600">Resultado</p>
                <p className="text-slate-400">Acertou vitória, empate ou derrota</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="font-semibold text-slate-400">Errou</p>
                <p className="text-slate-400">Não pontua nesta partida</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 5 Ranking */}
        <Card>
          <CardHeader
            title="Top 5 Ranking"
            subtitle="Melhores pontuações do bolão"
            action={
              <Link href="/ranking">
                <Button variant="ghost" size="sm">
                  Ver Todos
                </Button>
              </Link>
            }
          />
          <div className="p-6 space-y-3">
            {topRanking.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                Ainda não há dados de ranking
              </p>
            ) : (
              topRanking.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl w-8 text-center shrink-0">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                    </span>
                    <span className="font-medium truncate">{entry.userName}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">{entry.totalPoints} pts</p>
                    <p className="text-xs text-slate-400">
                      {entry.exactScores} exatos
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Matches with Prediction Forms */}
        <Card>
          <CardHeader
            title="Próximas Partidas"
            subtitle="Dê seus palpites diretamente aqui"
            action={
              <Link href="/predictions">
                <Button variant="ghost" size="sm">
                  Ver Todos
                </Button>
              </Link>
            }
          />
          <div className="p-6 space-y-4">
            {upcomingMatches.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                Nenhuma partida próxima
              </p>
            ) : (
              upcomingMatches.map((match) => {
                const homeTeam = getTeamDisplayName(match.homeTeam)
                const awayTeam = getTeamDisplayName(match.awayTeam)
                const homeLogo = getTeamDisplayLogo(match.homeTeamLogo, match.homeTeam)
                const awayLogo = getTeamDisplayLogo(match.awayTeamLogo, match.awayTeam)
                const canPredict = canMakePrediction(match)
                const matchId = match.id || match._id || ''
                const existing = getPrediction(matchId)
                const isEditing = selectedMatch === matchId

                return (
                  <div key={matchId} className="p-4 rounded-lg bg-slate-800/50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Badge variant="secondary">{STAGE_LABELS[match.stage]}</Badge>
                      <Badge className={STATUS_COLORS[match.status]}>
                        {STATUS_LABELS[match.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamLogo src={homeLogo} alt={homeTeam} className="w-8 h-8" teamName={match.homeTeam} />
                        <span className="font-semibold truncate">{homeTeam}</span>
                      </div>
                      <span className="text-slate-500 font-bold">×</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="font-semibold truncate">{awayTeam}</span>
                        <TeamLogo src={awayLogo} alt={awayTeam} className="w-8 h-8" teamName={match.awayTeam} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatKickoff(match.kickoffAt)}
                    </div>

                    {/* Existing prediction (not editing) */}
                    {existing && !isEditing && (
                      <div className="flex items-center justify-between p-2 rounded bg-slate-700/50">
                        <span className="text-xs text-slate-400">Seu palpite:</span>
                        <span className="font-bold">
                          {existing.predictedHomeScore ?? existing.homeScore} × {existing.predictedAwayScore ?? existing.awayScore}
                        </span>
                        {canPredict && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => {
                              setSelectedMatch(matchId)
                              setHomeScore(String(existing.predictedHomeScore ?? existing.homeScore ?? ''))
                              setAwayScore(String(existing.predictedAwayScore ?? existing.awayScore ?? ''))
                            }}
                          >
                            Editar
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Prediction form */}
                    {canPredict && (!existing || isEditing) && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={selectedMatch === matchId ? homeScore : ''}
                            onFocus={() => {
                              if (selectedMatch !== matchId) {
                                setSelectedMatch(matchId)
                                setHomeScore('')
                                setAwayScore('')
                              }
                            }}
                            onChange={(e) => setHomeScore(e.target.value)}
                            className="text-center"
                          />
                          <span className="text-center text-slate-400">×</span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={selectedMatch === matchId ? awayScore : ''}
                            onFocus={() => {
                              if (selectedMatch !== matchId) {
                                setSelectedMatch(matchId)
                                setHomeScore('')
                                setAwayScore('')
                              }
                            }}
                            onChange={(e) => setAwayScore(e.target.value)}
                            className="text-center"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            isLoading={submitting && selectedMatch === matchId}
                            onClick={() => handleSubmitPrediction(matchId)}
                          >
                            {existing ? 'Atualizar' : 'Salvar Palpite'}
                          </Button>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedMatch(null); setHomeScore(''); setAwayScore('') }}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {!canPredict && !existing && (
                      <div className="flex items-center justify-center gap-2 p-2 rounded bg-slate-800/50">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-500">Palpites encerrados</span>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>

      {/* All Predictions Matrix */}
      {boardData.length > 0 && (() => {
        // Build player rows
        const playerMap: Record<string, { userId: string; userName: string; preds: Record<string, { hs: number; as_: number; exact: boolean; outcome: boolean }> }> = {}
        const matchMap: Record<string, { homeTeam: string; awayTeam: string; status: string; hs: number | null; as_: number | null }> = {}
        boardData.forEach(board => {
          matchMap[board.matchId] = {
            homeTeam: board.match?.homeTeam ?? '',
            awayTeam: board.match?.awayTeam ?? '',
            status: board.match?.status ?? '',
            hs: board.match?.officialHomeScore ?? null,
            as_: board.match?.officialAwayScore ?? null,
          }
          board.predictions?.forEach(p => {
            if (!playerMap[p.userId]) playerMap[p.userId] = { userId: p.userId, userName: p.userName, preds: {} }
            playerMap[p.userId].preds[board.matchId] = {
              hs: p.predictedHomeScore, as_: p.predictedAwayScore,
              exact: p.exactScoreHit, outcome: p.outcomeHit,
            }
          })
        })
        const players = Object.values(playerMap).sort((a, b) => a.userName.localeCompare(b.userName))
        const matchIds = Object.keys(matchMap)

        return (
          <Card>
            <CardHeader
              title="Palpites de Todos"
              subtitle="Resultados e pontuações dos participantes"
              action={
                <Link href="/predictions/all">
                  <Button variant="ghost" size="sm">Ver Completo</Button>
                </Link>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 sticky left-0 bg-slate-900 z-10 min-w-[120px] border-r border-slate-700 font-semibold">
                      Participante
                    </th>
                    {matchIds.map(mid => {
                      const m = matchMap[mid]
                      return (
                        <th key={mid} className="text-center py-1 px-1 font-normal min-w-[72px] border-r border-slate-800 last:border-r-0">
                          <div className="text-[10px] text-slate-400 leading-tight">
                            <div className="truncate max-w-[68px] mx-auto">{getTeamDisplayName(m.homeTeam)}</div>
                            <div className="text-slate-600">×</div>
                            <div className="truncate max-w-[68px] mx-auto">{getTeamDisplayName(m.awayTeam)}</div>
                            {m.hs !== null && <div className="text-green-400 font-bold">{m.hs}–{m.as_}</div>}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, rowIdx) => (
                    <tr key={player.userId} className={`border-b border-slate-800 ${rowIdx % 2 === 0 ? '' : 'bg-slate-800/20'}`}>
                      <td className="py-2 px-3 font-medium sticky left-0 bg-slate-900 z-10 border-r border-slate-700">
                        {player.userName}
                      </td>
                      {matchIds.map(mid => {
                        const pred = player.preds[mid]
                        const m = matchMap[mid]
                        const finished = m.status === 'finished'
                        const bg = !pred ? ''
                          : !finished ? 'bg-slate-700/50 text-slate-300'
                          : pred.exact ? 'bg-green-700 text-white'
                          : pred.outcome ? 'bg-yellow-600 text-white'
                          : 'bg-red-700 text-white'
                        return (
                          <td key={mid} className="py-2 px-1 text-center border-r border-slate-800/50 last:border-r-0">
                            {pred ? (
                              <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[11px] ${bg}`}>
                                {pred.hs}×{pred.as_}
                                {finished && (pred.exact ? ' 🎯' : pred.outcome ? ' ✅' : ' ❌')}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
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
        )
      })()}

      {/* Quick Actions */}
      <Card>
        <CardHeader
          title="Ações Rápidas"
          subtitle="Navegue pelas principais funcionalidades"
        />
        <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/predictions">
            <Button variant="outline" className="w-full h-24 flex-col gap-2">
              <Target className="w-6 h-6" />
              <span>Meus Palpites</span>
            </Button>
          </Link>

          <Link href="/bracket">
            <Button variant="outline" className="w-full h-24 flex-col gap-2">
              <Trophy className="w-6 h-6" />
              <span>Mata-mata</span>
            </Button>
          </Link>

          <Link href="/ranking">
            <Button variant="outline" className="w-full h-24 flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>Ranking</span>
            </Button>
          </Link>

          <Link href="/statistics">
            <Button variant="outline" className="w-full h-24 flex-col gap-2">
              <Trophy className="w-6 h-6" />
              <span>Estatísticas</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
