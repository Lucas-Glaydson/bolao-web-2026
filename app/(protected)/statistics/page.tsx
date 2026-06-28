'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Trophy, Target, Award, TrendingUp, Percent } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { statsService } from '@/lib/api/stats'
import { useAuthStore } from '@/lib/store/auth'
import type { DashboardStats } from '@/lib/types'

export default function StatisticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await statsService.getDashboard()
      setStats(data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Carregando estatísticas..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Estatísticas</h1>
        <p className="text-slate-400">Dados e métricas do bolão</p>
      </div>

      {/* Global Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/20 to-slate-900">
          <div className="p-6 space-y-3">
            <Trophy className="w-10 h-10 text-green-500" />
            <div>
              <p className="text-4xl font-bold">{stats?.totalMatches || 0}</p>
              <p className="text-sm text-slate-400">Total de Partidas</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-slate-900">
          <div className="p-6 space-y-3">
            <Target className="w-10 h-10 text-green-500" />
            <div>
              <p className="text-4xl font-bold">{stats?.finishedMatches || 0}</p>
              <p className="text-sm text-slate-400">Partidas Finalizadas</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-slate-900">
          <div className="p-6 space-y-3">
            <Award className="w-10 h-10 text-green-600" />
            <div>
              <p className="text-4xl font-bold">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-slate-400">Participantes</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-slate-900">
          <div className="p-6 space-y-3">
            <TrendingUp className="w-10 h-10 text-yellow-500" />
            <div>
              <p className="text-4xl font-bold">{stats?.totalPredictions || 0}</p>
              <p className="text-sm text-slate-400">Total de Palpites</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Scorer */}
      {stats?.topScorer && (
        <Card className="bg-gradient-to-br from-yellow-900/20 to-slate-900 border-yellow-800/30">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h2 className="text-2xl font-bold">Maior Pontuador</h2>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0">
                <p className="text-2xl font-bold truncate">{stats.topScorer.user?.name}</p>
                <p className="text-slate-400 text-sm truncate">{stats.topScorer.user?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-500">{stats.topScorer.points}</p>
                <p className="text-sm text-slate-400">pontos</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Match Stats */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-500" />
              Estatísticas de Partidas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <span className="text-slate-300">Taxa de Conclusão</span>
                <span className="font-bold text-green-500">
                  {stats?.totalMatches
                    ? ((stats.finishedMatches / stats.totalMatches) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <span className="text-slate-300">Partidas Restantes</span>
                <span className="font-bold">
                  {(stats?.totalMatches || 0) - (stats?.finishedMatches || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <span className="text-slate-300">Palpites por Partida</span>
                <span className="font-bold">
                  {stats?.totalMatches
                    ? ((stats.totalPredictions || 0) / stats.totalMatches).toFixed(1)
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* User Stats */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Percent className="w-6 h-6 text-green-600" />
              Estatísticas de Participação
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <span className="text-slate-300">Média de Pontos</span>
                <span className="font-bold text-green-500">
                  {stats?.averagePointsPerUser?.toFixed(1) || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <span className="text-slate-300">Taxa de Engajamento</span>
                <span className="font-bold">
                  {stats?.totalUsers && stats?.totalMatches
                    ? (
                      ((stats.totalPredictions || 0) / (stats.totalUsers * stats.totalMatches)) *
                      100
                    ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <span className="text-slate-300">Palpites por Usuário</span>
                <span className="font-bold">
                  {stats?.totalUsers
                    ? ((stats.totalPredictions || 0) / stats.totalUsers).toFixed(1)
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Personal Stats */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-500" />
            Suas Estatísticas
          </h3>
          <p className="text-slate-400 text-center py-8">
            Estatísticas pessoais detalhadas estarão disponíveis em breve
          </p>
        </div>
      </Card>
    </div>
  )
}
