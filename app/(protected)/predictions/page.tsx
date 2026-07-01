'use client'

import { useEffect, useState } from 'react'
import { Target, Calendar, Clock, Trophy, Lock, CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { TeamLogo } from '@/components/ui/team-logo'
import { predictionService } from '@/lib/api/predictions'
import { matchService } from '@/lib/api/matches'
import { getTeamDisplayName, getTeamDisplayLogo, formatKickoff, getScore, isMatchLive, isMatchFinished, canMakePrediction, isKnockoutStage } from '@/lib/match-utils'
import { STAGE_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import type { PredictionWithDetails, Match } from '@/lib/types'
import toast from 'react-hot-toast'

export default function MyPredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionWithDetails[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [tiebreakWinner, setTiebreakWinner] = useState<'home' | 'away' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [predictionsData, matchesData] = await Promise.all([
        predictionService.getMyPredictions(),
        matchService.getAllMatches(),
      ])
      setPredictions(predictionsData)
      setMatches(matchesData)

      // Retorna se há jogos ao vivo
      return matchesData.some(isMatchLive)
    } catch (error) {
      console.error('Error fetching predictions:', error)
      toast.error('Erro ao carregar palpites')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Polling a cada 60s para manter canPredict atualizado conforme o prazo se aproxima
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmitPrediction = async (matchId: string) => {
    if (!homeScore || !awayScore) {
      toast.error('Preencha ambos os placares')
      return
    }

    const home = parseInt(homeScore)
    const away = parseInt(awayScore)
    const match = matches.find((m) => (m.id || m._id) === matchId)
    const isDraw = home === away
    const knockout = match ? isKnockoutStage(match) : false

    if (isDraw && knockout && !tiebreakWinner) {
      toast.error('Selecione qual time avança nos pênaltis')
      return
    }

    setSubmitting(true)
    try {
      await predictionService.createOrUpdatePrediction(matchId, {
        homeScore: home,
        awayScore: away,
        ...(isDraw && knockout ? { tiebreakWinner: tiebreakWinner! } : {}),
      })
      toast.success('✅ Palpite salvo com sucesso!', {
        duration: 3000,
        icon: '⚽',
      })
      setSelectedMatch(null)
      setHomeScore('')
      setAwayScore('')
      setTiebreakWinner(null)
      await fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar palpite')
    } finally {
      setSubmitting(false)
    }
  }

  const getPredictionForMatch = (matchId: string) => {
    return predictions.find((p) => p.matchId === matchId)
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Carregando seus palpites..." />
  }

  const upcomingMatches = matches.filter((m) => (m.status === 'scheduled' || m.status === 'live') && m.stage !== 'group_stage')
  const finishedMatches = matches.filter((m) => m.status === 'finished')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Meus Palpites</h1>
        <p className="text-slate-400">Gerencie e acompanhe seus palpites</p>
      </div>

      {/* Stats Summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 space-y-2">
            <Target className="w-6 h-6 text-green-600" />
            <p className="text-2xl font-bold">{predictions.length}</p>
            <p className="text-xs text-slate-400">Total de Palpites</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <p className="text-2xl font-bold">
              {predictions.filter((p) => p.points && p.points > 0).length}
            </p>
            <p className="text-xs text-slate-400">Acertos</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 space-y-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <p className="text-2xl font-bold">
              {predictions.filter((p) => p.isExactScore).length}
            </p>
            <p className="text-xs text-slate-400">Placares Exatos</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 space-y-2">
            <Target className="w-6 h-6 text-green-500" />
            <p className="text-2xl font-bold">
              {predictions.reduce((sum, p) => sum + (p.points || 0), 0)}
            </p>
            <p className="text-xs text-slate-400">Pontos Totais</p>
          </div>
        </Card>
      </div>

      {/* Upcoming Matches */}
      <Card>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Próximas Partidas</h2>

          {upcomingMatches.length === 0 ? (
            <p className="text-center text-slate-400 py-8">
              Nenhuma partida disponível para palpites
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingMatches.map((match) => {
                const homeTeam = getTeamDisplayName(match.homeTeam)
                const awayTeam = getTeamDisplayName(match.awayTeam)
                const homeLogo = getTeamDisplayLogo(match.homeTeamLogo, match.homeTeam)
                const awayLogo = getTeamDisplayLogo(match.awayTeamLogo, match.awayTeam)
                const canPredict = canMakePrediction(match)
                const matchId = match.id || match._id || ''
                const existingPrediction = getPredictionForMatch(matchId)
                const isEditing = selectedMatch === matchId

                return (
                  <div
                    key={match.id || match._id || match.externalId}
                    className="p-4 rounded-lg bg-slate-800/50 space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Badge variant="default">{STAGE_LABELS[match.stage]}</Badge>
                      <Badge className={STATUS_COLORS[match.status]}>
                        {STATUS_LABELS[match.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamLogo src={homeLogo} alt={homeTeam} className="w-10 h-10" teamName={match.homeTeam} />
                        <span className="font-semibold truncate">{homeTeam}</span>
                      </div>
                      <span className="text-slate-500 font-bold">×</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="font-semibold truncate">{awayTeam}</span>
                        <TeamLogo src={awayLogo} alt={awayTeam} className="w-10 h-10" teamName={match.awayTeam} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      {formatKickoff(match.kickoffAt)}
                    </div>

                    {existingPrediction && !isEditing && (
                      <div className="p-3 rounded-lg bg-slate-700/50">
                        <p className="text-sm text-slate-400 mb-2">Seu palpite:</p>
                        <p className="text-xl font-bold text-center">
                          {existingPrediction.predictedHomeScore ?? existingPrediction.homeScore} × {existingPrediction.predictedAwayScore ?? existingPrediction.awayScore}
                        </p>
                        {existingPrediction.tiebreakWinner && (
                          <p className="text-sm text-center text-slate-400 mt-1">
                            Avança: <span className="font-semibold text-white">
                              {existingPrediction.tiebreakWinner === 'home' ? homeTeam : awayTeam}
                            </span>
                          </p>
                        )}
                        {canPredict && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              setSelectedMatch(matchId)
                              setHomeScore((existingPrediction.predictedHomeScore ?? existingPrediction.homeScore ?? 0).toString())
                              setAwayScore((existingPrediction.predictedAwayScore ?? existingPrediction.awayScore ?? 0).toString())
                              setTiebreakWinner(existingPrediction.tiebreakWinner ?? null)
                            }}
                          >
                            Editar Palpite
                          </Button>
                        )}
                      </div>
                    )}

                    {canPredict && (!existingPrediction || isEditing) && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3 items-center">
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
                                setTiebreakWinner(null)
                              }
                            }}
                            onChange={(e) => {
                              setHomeScore(e.target.value)
                              setTiebreakWinner(null)
                            }}
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
                                setTiebreakWinner(null)
                              }
                            }}
                            onChange={(e) => {
                              setAwayScore(e.target.value)
                              setTiebreakWinner(null)
                            }}
                            className="text-center"
                          />
                        </div>

                        {/* Tiebreaker: mostrar quando empate em fase eliminatória */}
                        {selectedMatch === matchId &&
                          homeScore !== '' && awayScore !== '' &&
                          parseInt(homeScore) === parseInt(awayScore) &&
                          isKnockoutStage(match) && (
                            <div className="space-y-2">
                              <p className="text-sm text-slate-400 text-center">
                                Empate — Quem avança nos pênaltis?
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setTiebreakWinner('home')}
                                  className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-colors ${tiebreakWinner === 'home'
                                    ? 'bg-green-600 border-green-500 text-white'
                                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                  {homeTeam}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTiebreakWinner('away')}
                                  className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-colors ${tiebreakWinner === 'away'
                                    ? 'bg-green-600 border-green-500 text-white'
                                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                  {awayTeam}
                                </button>
                              </div>
                            </div>
                          )}
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => handleSubmitPrediction(matchId)}
                            isLoading={submitting}
                          >
                            {existingPrediction ? 'Atualizar' : 'Salvar'} Palpite
                          </Button>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setSelectedMatch(null)
                                setHomeScore('')
                                setAwayScore('')
                                setTiebreakWinner(null)
                              }}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prazo encerrado sem palpite */}
                    {!canPredict && !existingPrediction && match.status === 'scheduled' && (
                      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-800/50">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Prazo de palpites encerrado</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Past Predictions */}
      {predictions.filter((p) => {
        const match = matches.find((m) => (m.id || m._id) === p.matchId)
        return match?.status === 'finished'
      }).length > 0 && (
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Palpites Anteriores</h2>
              <div className="space-y-3">
                {predictions
                  .filter((p) => {
                    const match = matches.find((m) => (m.id || m._id) === p.matchId)
                    return match?.status === 'finished'
                  })
                  .map((prediction) => {
                    const match = matches.find((m) => (m.id || m._id) === prediction.matchId)
                    if (!match) return null

                    const homeTeam = getTeamDisplayName(match.homeTeam)
                    const awayTeam = getTeamDisplayName(match.awayTeam)

                    return (
                      <div
                        key={prediction.id || prediction._id}
                        className="p-4 rounded-lg bg-slate-800/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="default">{STAGE_LABELS[match.stage]}</Badge>
                          {prediction.points && prediction.points > 0 ? (
                            <Badge variant="success">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              +{prediction.points} pts
                            </Badge>
                          ) : (
                            <Badge variant="danger">
                              <XCircle className="w-3 h-3 mr-1" />
                              0 pts
                            </Badge>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-slate-400 mb-1">Placar Real</p>
                          <p className="font-semibold">
                            {homeTeam} {match.officialHomeScore} × {match.officialAwayScore} {awayTeam}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400 mb-1">Seu Palpite</p>
                          <p className="font-semibold">
                            {prediction.predictedHomeScore ?? prediction.homeScore} × {prediction.predictedAwayScore ?? prediction.awayScore}
                          </p>
                        </div>

                        {(prediction.isExactScore || prediction.exactScoreHit) && (
                          <Badge variant="success" className="w-full justify-center">
                            <Trophy className="w-3 h-3 mr-1" />
                            Placar Exato!
                          </Badge>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          </Card>
        )}
    </div>
  )
}
