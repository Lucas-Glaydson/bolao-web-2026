'use client'

import { useEffect, useState } from 'react'
import { Activity, TrendingUp, Users, Target, Trophy, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { statsService } from '@/lib/api/stats'
import type { DashboardStats } from '@/lib/types'

export default function AnalysisPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const fetchAnalysis = async () => {
    try {
      const data = await statsService.getDashboard()
      setStats(data)
    } catch (error) {
      console.error('Error fetching analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Carregando análise..." />
  }

  const insights = [
    {
      icon: Users,
      title: 'Engajamento',
      description: 'Participação ativa dos usuários no bolão',
      value: `${stats?.totalUsers || 0} participantes`,
      color: 'text-green-500',
    },
    {
      icon: Target,
      title: 'Atividade de Palpites',
      description: 'Total de palpites registrados até agora',
      value: `${stats?.totalPredictions || 0} palpites`,
      color: 'text-green-500',
    },
    {
      icon: Trophy,
      title: 'Competitividade',
      description: 'Média de pontos entre os participantes',
      value: `${stats?.averagePointsPerUser?.toFixed(1) || 0} pts/usuário`,
      color: 'text-yellow-500',
    },
    {
      icon: TrendingUp,
      title: 'Progresso',
      description: 'Partidas finalizadas do total',
      value: `${stats?.finishedMatches || 0}/${stats?.totalMatches || 0} jogos`,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Análise</h1>
        <p className="text-slate-400">Análise detalhada do bolão</p>
      </div>

      {/* Key Insights */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <Card key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900">
              <div className="p-6 space-y-3">
                <Icon className={`w-8 h-8 ${insight.color}`} />
                <div>
                  <h3 className="font-bold text-lg">{insight.title}</h3>
                  <p className="text-sm text-slate-400">{insight.description}</p>
                </div>
                <p className="text-2xl font-bold">{insight.value}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Detailed Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trends */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Tendências
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400 mb-2">Status do Bolão</p>
                <Badge variant={stats && stats.finishedMatches > 0 ? 'success' : 'secondary'}>
                  {stats && stats.finishedMatches > 0 ? 'Em Andamento' : 'Aguardando Início'}
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400 mb-2">Fase Atual</p>
                <Badge variant="primary">{stats?.currentStage || 'Fase Inicial'}</Badge>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400 mb-2">Fases Abertas</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stats?.openStages && stats.openStages.length > 0 ? (
                    stats.openStages.map((stage: string) => (
                      <Badge key={stage} variant="success">
                        {stage}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Nenhuma fase aberta</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-500" />
              Métricas de Desempenho
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Conclusão de Partidas</span>
                  <span className="font-semibold">
                    {stats?.totalMatches
                      ? ((stats.finishedMatches / stats.totalMatches) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: stats?.totalMatches
                        ? `${(stats.finishedMatches / stats.totalMatches) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Engajamento de Usuários</span>
                  <span className="font-semibold">
                    {stats?.totalUsers && stats?.totalMatches
                      ? (
                        ((stats.totalPredictions || 0) / (stats.totalUsers * stats.totalMatches)) *
                        100
                      ).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width:
                        stats?.totalUsers && stats?.totalMatches
                          ? `${((stats.totalPredictions || 0) / (stats.totalUsers * stats.totalMatches)) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/50 mt-4">
                <p className="text-sm text-yellow-400">
                  💡 Dica: Quanto maior o engajamento, mais competitivo fica o bolão!
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Future Insights */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-slate-900 border-purple-800/30">
        <div className="p-8 text-center space-y-4">
          <Activity className="w-16 h-16 text-purple-500 mx-auto" />
          <h3 className="text-2xl font-bold">Análises Avançadas em Breve</h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Em breve você terá acesso a gráficos detalhados, análise de tendências por usuário,
            estatísticas por fase e muito mais!
          </p>
        </div>
      </Card>
    </div>
  )
}
