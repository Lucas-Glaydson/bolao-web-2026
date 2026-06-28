'use client'

import { useEffect, useState } from 'react'
import { Trophy, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { TeamLogo } from '@/components/ui/team-logo'
import { groupService } from '@/lib/api/groups'
import { isMatchLive } from '@/lib/match-utils'
import type { Match, GroupStanding, GroupLabel } from '@/lib/types'

export default function GroupStagePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const groups: GroupLabel[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  const fetchData = async () => {
    try {
      if (matches.length === 0) setIsLoading(true)
      setError(null)
      const [standingsData, matchesData] = await Promise.all([
        groupService.getGroupStandingsRealTime(),
        groupService.getGroupStageMatches(),
      ])
      setStandings(standingsData.standings || [])
      setMatches(matchesData || [])
      return (matchesData || []).some(isMatchLive)
    } catch (error: any) {
      const message = error?.message || error?.error || JSON.stringify(error) || 'Erro ao carregar dados'
      console.warn('Error fetching data:', message)
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
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
  }, []) // Array vazio - executa apenas na montagem

  if (isLoading && matches.length === 0) {
    return <LoadingSpinner fullScreen text="Carregando fase de grupos..." />
  }

  if (error && matches.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Fase de Grupos</h1>
          <p className="text-slate-400">Acompanhe os jogos e classificação dos 12 grupos</p>
        </div>

        <Card>
          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Dados Indisponíveis</h3>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <Button variant="primary" onClick={fetchData}>
                Tentar Novamente
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Fase de Grupos</h1>
          <p className="text-slate-400">Classificação e resultados dos 12 grupos</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* All Groups Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((group) => {
          const standing = standings.find(s => s.group === group)
          const groupMatches = matches
            .filter(m => m.group === group)
            .sort((a, b) => (a.round ?? 0) - (b.round ?? 0))

          return (
            <Card key={group}>
              <div className="p-4 space-y-3">
                {/* Group Header */}
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Grupo {group}
                  </h2>
                  {standing?.qualified && standing.qualified.length === 2 && (
                    <Badge variant="success" className="text-xs">Completo</Badge>
                  )}
                </div>

                {/* Standings Table */}
                {standing ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400">
                          <th className="text-left py-1 pr-1 w-5">#</th>
                          <th className="text-left py-1">Time</th>
                          <th className="text-center py-1 w-6">J</th>
                          <th className="text-center py-1 w-6 text-green-500">V</th>
                          <th className="text-center py-1 w-6 text-yellow-500">E</th>
                          <th className="text-center py-1 w-6 text-rose-500">D</th>
                          <th className="text-center py-1 w-8">SG</th>
                          <th className="text-center py-1 w-8 font-bold">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standing.teams.map((team, idx) => {
                          const isQualified = standing.qualified.includes(team.team)
                          return (
                            <tr
                              key={team.team}
                              className={`border-b border-slate-800/50 ${isQualified ? 'bg-green-900/10' : ''}`}
                            >
                              <td className="py-1.5 pr-1 text-slate-400">{idx + 1}</td>
                              <td className="py-1.5">
                                <div className="flex items-center gap-1.5">
                                  <TeamLogo src={team.teamLogo} alt={team.team} className="w-4 h-4" teamName={team.team} />
                                  <span className="font-medium truncate max-w-[90px]">{team.team}</span>
                                  {isQualified && <span className="text-green-400 text-xs">✓</span>}
                                </div>
                              </td>
                              <td className="text-center py-1.5">{team.played}</td>
                              <td className="text-center py-1.5 text-green-500">{team.won}</td>
                              <td className="text-center py-1.5 text-yellow-500">{team.drawn}</td>
                              <td className="text-center py-1.5 text-rose-500">{team.lost}</td>
                              <td className="text-center py-1.5">
                                {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                              </td>
                              <td className="text-center py-1.5 font-bold text-green-500">{team.points}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">Sem dados de classificação</p>
                )}

                {/* Match Results */}
                {groupMatches.length > 0 && (
                  <div className="border-t border-slate-800 pt-2 space-y-1">
                    {groupMatches.map((match) => {
                      const hasScore = match.officialHomeScore !== null && match.officialAwayScore !== null
                      const isLive = match.status === 'live'
                      return (
                        <div key={match.id || match._id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-xs">
                          <span className="text-slate-300 truncate text-right">{match.homeTeam}</span>
                          <span className={`font-mono font-bold px-2 py-0.5 rounded text-center whitespace-nowrap ${
                            isLive
                              ? 'bg-red-900/40 text-red-400 animate-pulse'
                              : hasScore
                              ? 'bg-slate-700 text-white'
                              : 'text-slate-500'
                          }`}>
                            {hasScore ? `${match.officialHomeScore}×${match.officialAwayScore}` : '–×–'}
                          </span>
                          <span className="text-slate-300 truncate">{match.awayTeam}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
