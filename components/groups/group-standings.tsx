'use client'

import { useEffect, useState } from 'react'
import { Trophy, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { groupService } from '@/lib/api/groups'
import type { GroupStanding } from '@/lib/types'

export function GroupStandings() {
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStandings()
  }, [])

  const fetchStandings = async () => {
    try {
      setError(null)
      const response = await groupService.getGroupStandingsRealTime()
      setStandings(response.standings || [])
    } catch (error: any) {
      console.warn('Error fetching standings:', error?.message || error)
      setError(error?.message || error?.error || 'Erro ao carregar classificação')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="Carregando classificação..." />
  }

  if (error) {
    return (
      <Card>
        <div className="p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Classificação Indisponível</h3>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <p className="text-slate-500 text-xs">
              Backend não conectado ou dados ainda não disponíveis
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (standings.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center space-y-4">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma Classificação</h3>
            <p className="text-slate-400 text-sm">
              As tabelas de classificação ainda não estão disponíveis
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {standings.map((group) => (
        <Card key={group.group}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h3 className="font-bold">Grupo {group.group}</h3>
              </div>
              {group.qualified && group.qualified.length === 2 && (
                <Badge variant="success" className="text-xs">Completo</Badge>
              )}
            </div>

            {/* Standings table — responsive layout */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-500">
                  <th className="text-left py-1 w-5">#</th>
                  <th className="text-left py-1">Time</th>
                  <th className="text-center py-1 w-6">J</th>
                  <th className="text-center py-1 w-6 text-green-500">V</th>
                  <th className="text-center py-1 w-6 text-yellow-500">E</th>
                  <th className="text-center py-1 w-6 text-rose-500">D</th>
                  <th className="text-center py-1 w-8 font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.teams.map((team, index) => {
                  const teamName = team.team || 'A Definir'
                  const isQualified = group.qualified?.includes(teamName)
                  return (
                    <tr
                      key={teamName}
                      className={`border-b border-slate-800/50 ${
                        isQualified ? 'bg-green-900/10' : ''
                      }`}
                    >
                      <td className="py-1.5 text-slate-400">{index + 1}</td>
                      <td className="py-1.5">
                        <div className="flex items-center gap-1">
                          {isQualified && <span className="text-green-400 shrink-0">✓</span>}
                          <span className="truncate max-w-[85px] font-medium">{teamName}</span>
                        </div>
                      </td>
                      <td className="text-center py-1.5">{team.played}</td>
                      <td className="text-center py-1.5 text-green-500">{team.won}</td>
                      <td className="text-center py-1.5 text-yellow-500">{team.drawn}</td>
                      <td className="text-center py-1.5 text-rose-500">{team.lost}</td>
                      <td className="text-center py-1.5 font-bold text-green-500">{team.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {group.qualified && group.qualified.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-700/50 text-xs text-green-400">
                ✓ {group.qualified.join(' · ')}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
