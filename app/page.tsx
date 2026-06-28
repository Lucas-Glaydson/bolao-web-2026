import Link from 'next/link'
import {
  Trophy,
  Target,
  Award,
  Users,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const features = [
    {
      icon: Trophy,
      title: 'Sistema Mata-mata',
      description: 'Faça palpites em todas as fases eliminatórias do torneio',
      color: 'text-yellow-500',
    },
    {
      icon: Target,
      title: 'Pontuação Progressiva',
      description: 'Quanto mais avançada a fase, mais pontos você pode ganhar',
      color: 'text-green-500',
    },
    {
      icon: Award,
      title: 'Bônus Placar Exato',
      description: 'Acerte o placar exato (+2pts) ou empate com penálti correto (+3pts)',
      color: 'text-purple-500',
    },
    {
      icon: Users,
      title: 'Palpites Públicos',
      description: 'Veja os palpites dos outros participantes e compare',
      color: 'text-green-500',
    },
    {
      icon: TrendingUp,
      title: 'Ranking em Tempo Real',
      description: 'Acompanhe sua posição e compete com seus amigos',
      color: 'text-green-600',
    },
    {
      icon: Clock,
      title: 'Prazo Automático',
      description: 'Palpites travam 1 hora antes de cada jogo',
      color: 'text-orange-500',
    },
  ]

  const scoringRules = [
    { phase: '16 avos', points: 1, badge: '16' },
    { phase: 'Oitavas', points: 1, badge: '8' },
    { phase: 'Quartas', points: 1, badge: '4' },
    { phase: 'Semifinal', points: 2, badge: '2' },
    { phase: 'Final', points: 2, badge: '🏆' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-slate-950 to-slate-950 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent -z-10" />

        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-3">
              <span className="text-4xl">💰</span>
              <span className="text-2xl font-bold">Bet Glaydson</span>
            </div>
            <Link href="/login">
              <Button variant="outline" className="gap-2">
                Entrar
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Main Hero */}
          <div className="text-center space-y-6 mb-12">
            <Badge className="bg-green-600/20 text-green-400 border-green-600/50">
              Bolão Mata-mata 2026
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              O Bolão Mais<br />
              <span className="text-green-500">Emocionante</span> do Grupo
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              O bolão mais emocionante para o mata-mata de futebol. Faça seus palpites,
              ganhe pontos e dispute o ranking com seus amigos!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/login">
                <Button size="lg" variant="primary" className="min-w-[200px]">
                  Entrar
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  Como Funciona
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Como Funciona
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index}>
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Scoring System */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Sistema de Pontuação
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {scoringRules.map((rule, index) => (
              <Card key={index}>
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-green-600/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-green-500">{rule.badge}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">{rule.phase}</p>
                    <p className="text-2xl font-bold text-green-500">
                      {rule.points} {rule.points === 1 ? 'ponto' : 'pontos'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-green-600/10 to-slate-900 border-green-600/30">
            <div className="p-8 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-600/50">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-400">Bônus Especial</span>
              </div>
              <h3 className="text-2xl font-bold">Placar Exato</h3>
              <p className="text-lg text-slate-300 max-w-xl mx-auto">
                Acerte o placar exato e ganhe{' '}
                <span className="text-green-500 font-bold">+2 pontos extras</span>.
                Em caso de empate, acertando também quem avança nos pênaltis:{' '}
                <span className="text-blue-400 font-bold">+3 pontos</span>!
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Palpites travados 1h antes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Liberação por fase</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-900/20 to-slate-950">
        <div className="container mx-auto max-w-3xl text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-slate-300">
            Entre agora e faça seus palpites antes que seja tarde!
          </p>
          <Link href="/login">
            <Button size="lg" variant="primary" className="min-w-[250px]">
              Entrar no Bolão
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
