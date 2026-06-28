'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Medal, Trophy, Award, Target, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { rankingService } from '@/lib/api/ranking'
import { statsService } from '@/lib/api/stats'
import type { RankingEntry } from '@/lib/types'

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const [data, stats] = await Promise.allSettled([
          rankingService.getRanking(),
          statsService.getDashboard(),
        ])
        if (data.status === 'fulfilled') setRanking(data.value)
        // totalUsers: prefer backend stats (includes 0-point users), fallback to ranking length
        if (stats.status === 'fulfilled' && stats.value.totalUsers > 0) {
          setTotalUsers(stats.value.totalUsers)
        } else if (data.status === 'fulfilled') {
          setTotalUsers(data.value.length)
        }
      } catch (error) {
        console.error('Error fetching ranking:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRanking()
  }, [])

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Carregando ranking..." />
  }

  const topThree = ranking.slice(0, 3)
  const restOfRanking = ranking.slice(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Ranking</h1>
        <p className="text-slate-400">Classificação geral dos participantes</p>
      </div>

      {/* Stats Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <div className="p-6 space-y-2">
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold">{totalUsers}</p>
            <p className="text-sm text-slate-400">Participantes</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-2">
            <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-3xl font-bold">{ranking[0]?.totalPoints || 0}</p>
            <p className="text-sm text-slate-400">Pontos do Líder</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-2">
            <Target className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-3xl font-bold">
              {ranking.reduce((sum, r) => sum + (r.exactScores || 0), 0)}
            </p>
            <p className="text-sm text-slate-400">Placares Exatos</p>
          </div>
        </Card>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <Card className="bg-gradient-to-br from-yellow-900/20 to-slate-900">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">🏆 Pódio</h2>
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="text-center space-y-3">
                  <div className="h-24 bg-slate-700/50 rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl">🥈</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm truncate px-1">{topThree[1].userName}</p>
                    <p className="text-xl font-bold text-slate-300">
                      {topThree[1].totalPoints}
                    </p>
                    <p className="text-xs text-slate-400">
                      {topThree[1].exactScores} exatos
                    </p>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="text-center space-y-3 -mt-8">
                  <div className="h-32 bg-gradient-to-b from-yellow-600/50 to-yellow-800/50 rounded-t-lg flex items-center justify-center border-2 border-yellow-600/50">
                    <span className="text-5xl">🥇</span>
                  </div>
                  <div>
                    <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/50 mb-2">
                      Líder
                    </Badge>
                    <p className="font-bold text-sm truncate px-1">{topThree[0].userName}</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {topThree[0].totalPoints}
                    </p>
                    <p className="text-xs text-slate-400">
                      {topThree[0].exactScores} exatos
                    </p>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="text-center space-y-3">
                  <div className="h-20 bg-slate-700/50 rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl">🥉</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm truncate px-1">{topThree[2].userName}</p>
                    <p className="text-xl font-bold text-orange-300">
                      {topThree[2].totalPoints}
                    </p>
                    <p className="text-xs text-slate-400">
                      {topThree[2].exactScores} exatos
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Full Ranking Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Classificação Completa</h2>
          <div className="space-y-2">
            {ranking.map((entry, index) => {
              const isPodium = index < 3
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null

              return (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${isPodium
                    ? 'bg-gradient-to-r from-yellow-900/20 to-slate-800/50 border border-yellow-800/30'
                    : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-center w-12 shrink-0">
                      {medal || (
                        <span className="text-lg font-bold text-slate-400">
                          {index + 1}º
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg truncate">{entry.userName}</p>
                      <p className="text-sm text-slate-400">
                        {entry.outcomeHits || 0} acertos •{' '}
                        {entry.exactScores || 0} placares exatos
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">
                      {entry.totalPoints}
                    </p>
                    <p className="text-xs text-slate-400">pontos</p>
                  </div>
                </div>
              )
            })}
          </div>

          {ranking.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Ainda não há dados de ranking</p>
            </div>
          )}

          {/* Users with 0 points not in ranking */}
          {totalUsers > ranking.length && (
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-500">
                + {totalUsers - ranking.length} participante{totalUsers - ranking.length !== 1 ? 's' : ''} ainda sem pontos
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
