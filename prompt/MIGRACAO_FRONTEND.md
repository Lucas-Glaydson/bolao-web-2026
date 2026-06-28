# Prompt de Migração - Frontend Next.js
## Sistema: Bet Glaydson - Copa do Mundo 2026 (Grupos + Mata-mata)

## 📋 Contexto

Você está adaptando o frontend Next.js que atualmente suporta apenas **mata-mata** para incluir também a **fase de grupos**. O sistema antigo tinha interface completa para grupos, que precisa ser integrada ao novo design.

## 🎯 Objetivo

Adaptar o frontend Next.js para:
1. Adicionar visualizações da fase de grupos (12 grupos, 3 rodadas)
2. Manter todo o suporte ao mata-mata existente
3. Unificar navegação entre grupos e mata-mata
4. Preservar o tema escuro moderno e visual premium
5. Mobile first em todas as novas telas

---

## 🆕 NOVOS ENDPOINTS - Sistema Tempo Real

### 📡 Endpoints Implementados no Backend

#### 1. Ver Classificação dos Grupos em Tempo Real

```http
GET /api/v1/matches/standings/groups
Authorization: Bearer {token}
```

**Descrição**: Retorna a classificação atual de todos os 12 grupos baseado nos resultados dos jogos finalizados.

**Critérios de Classificação (FIFA)**:
1. Pontos (Vitória: 3, Empate: 1, Derrota: 0)
2. Saldo de gols
3. Gols marcados
4. Ordem alfabética (desempate)

**Response (200 OK)**:
```json
{
  "standings": [
    {
      "group": "A",
      "teams": [
        {
          "team": "México",
          "points": 9,
          "played": 3,
          "won": 3,
          "drawn": 0,
          "lost": 0,
          "goalsFor": 8,
          "goalsAgainst": 2,
          "goalDifference": 6
        }
      ],
      "qualified": ["México", "Canadá"]
    }
  ],
  "message": "Group standings calculated successfully"
}
```

#### 2. Gerar Oitavas de Final (Admin)

```http
POST /api/v1/matches/generate-knockout
Authorization: Bearer {admin_token}
```

**Descrição**: Gera/atualiza os confrontos das oitavas de final baseado nos times classificados dos grupos.

**Response (200 OK)**:
```json
{
  "generated": 0,
  "updated": 12,
  "message": "Generated/updated knockout matches: 0 new, 12 updated"
}
```

**Chaveamento das Oitavas** (12 confrontos):
- R16-1: 1º Grupo A vs 2º Grupo B
- R16-2: 1º Grupo C vs 2º Grupo D
- R16-3: 1º Grupo E vs 2º Grupo F
- R16-4: 1º Grupo G vs 2º Grupo H
- R16-5: 1º Grupo I vs 2º Grupo J
- R16-6: 1º Grupo K vs 2º Grupo L
- R16-7: 1º Grupo B vs 2º Grupo A
- R16-8: 1º Grupo D vs 2º Grupo C
- R16-9: 1º Grupo F vs 2º Grupo E
- R16-10: 1º Grupo H vs 2º Grupo G
- R16-11: 1º Grupo J vs 2º Grupo I
- R16-12: 1º Grupo L vs 2º Grupo K

### 🤖 Processos Automáticos (Cron Jobs)

**A cada 30 minutos**:
- Sincroniza resultados da API externa
- Atualiza classificação dos grupos
- Gera oitavas se todos grupos completos

**A cada 5 minutos**:
- Detecta jogos finalizados
- Calcula pontos dos palpites automaticamente

**Diariamente à meia-noite**:
- Limpa cache de cálculos

### ⚠️ CRÍTICO - Mapeamento de Jogos

**Os jogos no banco estão com times placeholder** enquanto a API oficial da Copa 2026 não tem dados.

**Para o frontend funcionar corretamente**:
- ✅ Busque jogos pela **ordem de criação** (IDs MongoDB em ordem crescente)
- ✅ Os primeiros 87 jogos correspondem aos IDs 1-87 do sistema antigo
- ✅ Os palpites migrados estão mapeados corretamente por ordem de jogo
- ✅ Use `GET /api/v1/matches` e pegue pela posição no array (índice 0 = jogo 1)

**Exemplo de Mapeamento**:
```typescript
// ❌ ERRADO: Buscar por ID fixo assumindo ordem
const match5 = await fetch('/api/v1/matches/5')

// ✅ CERTO: Buscar todos e pegar por índice
const matches = await fetch('http://localhost:3001/api/v1/matches')
const data = await matches.json()
const match5 = data[4]  // Jogo 5 do sistema antigo = índice 4
const match87 = data[86] // Jogo 87 do sistema antigo = índice 86

// Para ver palpites de um jogo específico
const matchId = data[4]._id // ID do MongoDB
const predictions = await fetch(`/api/v1/predictions/match/${matchId}`)
```

**Quando a API oficial da Copa 2026 tiver dados**:
- Execute `POST /api/v1/matches/sync`
- Os times placeholder serão substituídos pelos times reais
- Os palpites continuam funcionando (estão vinculados por ID interno do MongoDB)

### 📊 Estrutura de Dados do Backend

```typescript
interface GroupStanding {
  group: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'
  teams: TeamStanding[]
  qualified: string[] // Top 2 times classificados
}

interface TeamStanding {
  team: string           // Nome do time
  points: number         // Pontos totais
  played: number         // Jogos disputados
  won: number            // Vitórias
  drawn: number          // Empates
  lost: number           // Derrotas
  goalsFor: number       // Gols marcados
  goalsAgainst: number   // Gols sofridos
  goalDifference: number // Saldo de gols
}

interface GenerateKnockoutResponse {
  generated: number      // Jogos criados
  updated: number        // Jogos atualizados
  message: string
}
```

### 🔑 Autenticação Backend

**Base URL**: `http://localhost:3001/api/v1`

**Login**:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "alefe.gla@bolao.com",
  "password": "419604"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Alefe",
    "email": "alefe.gla@bolao.com",
    "role": "admin"
  }
}
```

**Endpoints que requerem autenticação**:
- `GET /matches/standings/groups` - Qualquer usuário autenticado
- `POST /matches/generate-knockout` - Apenas admin

**Documentação Swagger**: `http://localhost:3001/api/docs`

---

## 🎨 Design System Atual

### Tema
- **Cores**: Vermelho (#DC2626) + Tema escuro
- **Componentes**: Cards, Badges, Buttons, Modal, Toast
- **Ícones**: Lucide React
- **Layout**: Mobile first com bottom nav + sidebar desktop

### Páginas Existentes (Mata-mata)
- Dashboard
- Meus Palpites (mata-mata)
- Todos os Palpites (mata-mata)
- Ranking (unificado)
- Mapa Mata-mata
- Estatísticas
- Análise
- Perfil

## 📱 Funcionalidades do Sistema Antigo (HTML)

### Visualizações Principais
1. **Jogos de Hoje** - Filtro automático por data
2. **Ranking** - Classificação geral com tabelas por pessoa
3. **Tabelas de Palpites** - Matrix de palpites por jogo
4. **Calendário** - Visão cronológica dos jogos
5. **Por Pessoa** - Palpites individuais agrupados

### Filtros Disponíveis
- Grupo (A-L)
- Rodada (1-3)
- Status (Agendado, Ao vivo, Finalizado)
- Pessoa
- Time
- Data
- Agrupamento (Por Dia, Por Grupo, Por Time)

### Funcionalidades Admin
- Palpites aleatórios
- Limpar palpites
- Placar manual
- Importar/Exportar JSON
- Forçar atualização de placares

## 🏗️ Estrutura de Implementação

### 1. Atualizar Types

**Arquivo**: `lib/types.ts`

```typescript
// Adicionar aos tipos existentes

export type GroupLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Match {
  id: string;
  externalId?: string;
  competition: string;
  stage: MatchStage;
  group?: GroupLabel;        // NOVO
  round?: number;            // NOVO (1, 2 ou 3)
  roundLabel: string;
  homeTeam: string;
  awayTeam: string;
  teamA: string;  // Alias para homeTeam
  teamB: string;  // Alias para awayTeam
  date: string;   // Alias para kickoffAt
  kickoffAt: string;
  status: MatchStatus;
  homeScore?: number;        // Alias para officialHomeScore
  awayScore?: number;        // Alias para officialAwayScore
  officialHomeScore?: number;
  officialAwayScore?: number;
  manualHomeScore?: number;  // NOVO
  manualAwayScore?: number;  // NOVO
  useManualScore?: boolean;  // NOVO
  finalHomeScore?: number;   // NOVO - computed (manual ou official)
  finalAwayScore?: number;   // NOVO - computed (manual ou official)
  winner?: MatchWinner;
  canPredict?: boolean;
}

export interface GroupStanding {
  group: GroupLabel;
  teams: {
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    position: number;
  }[];
}
```

### 2. Criar Serviços de Grupos

**Arquivo**: `lib/api/groups.ts`

```typescript
import { api } from './client'
import type { Match, GroupStanding, GroupLabel } from '@/lib/types'

export const groupService = {
  // Obter jogos por grupo
  async getMatchesByGroup(group: GroupLabel): Promise<Match[]> {
    const { data } = await api.get<Match[]>(`/matches/group/${group}`)
    return data
  },

  // Obter jogos por rodada
  async getMatchesByRound(round: number): Promise<Match[]> {
    const { data } = await api.get<Match[]>(`/matches/round/${round}`)
    return data
  },

  // Obter classificação dos grupos
  async getGroupStandings(): Promise<GroupStanding[]> {
    const { data } = await api.get<GroupStanding[]>('/matches/group-standings')
    return data
  },

  // Obter jogos da fase de grupos
  async getGroupStageMatches(): Promise<Match[]> {
    const { data } = await api.get<Match[]>('/matches/stage/GROUP_STAGE')
    return data
  },

  // Admin: Definir placar manual
  async setManualScore(matchId: string, homeScore: number, awayScore: number): Promise<Match> {
    const { data } = await api.patch<Match>(`/matches/${matchId}/manual-score`, {
      manualHomeScore: homeScore,
      manualAwayScore: awayScore,
      useManualScore: true
    })
    return data
  },

  // Admin: Remover placar manual
  async removeManualScore(matchId: string): Promise<Match> {
    const { data } = await api.delete<Match>(`/matches/${matchId}/manual-score`)
    return data
  }
}
```

### 3. Atualizar Constantes

**Arquivo**: `lib/constants.ts`

```typescript
// Adicionar aos existentes

export const GROUP_LABELS: Record<GroupLabel, string> = {
  A: 'Grupo A',
  B: 'Grupo B',
  C: 'Grupo C',
  D: 'Grupo D',
  E: 'Grupo E',
  F: 'Grupo F',
  G: 'Grupo G',
  H: 'Grupo H',
  I: 'Grupo I',
  J: 'Grupo J',
  K: 'Grupo K',
  L: 'Grupo L',
}

export const ROUND_LABELS: Record<number, string> = {
  1: 'Rodada 1',
  2: 'Rodada 2',
  3: 'Rodada 3',
}

export const GROUPING_OPTIONS = {
  day: 'Por Dia',
  group: 'Por Grupo',
  round: 'Por Rodada',
  team: 'Por Time',
}
```

### 4. Criar Página de Fase de Grupos

**Arquivo**: `app/(protected)/groups/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Calendar, Users, Trophy, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { groupService } from '@/lib/api/groups'
import { GROUP_LABELS, ROUND_LABELS } from '@/lib/constants'
import type { Match, GroupLabel } from '@/lib/types'

export default function GroupStagePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedGroup, setSelectedGroup] = useState<GroupLabel | 'ALL'>('ALL')
  const [selectedRound, setSelectedRound] = useState<number | 'ALL'>('ALL')
  const [groupBy, setGroupBy] = useState<'day' | 'group' | 'round'>('day')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const data = await groupService.getGroupStageMatches()
      setMatches(data)
    } catch (error) {
      console.error('Error fetching group matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Carregando fase de grupos..." />
  }

  const groups: GroupLabel[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  const rounds = [1, 2, 3]

  const filteredMatches = matches.filter(m => {
    if (selectedGroup !== 'ALL' && m.group !== selectedGroup) return false
    if (selectedRound !== 'ALL' && m.round !== selectedRound) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fase de Grupos</h1>
        <p className="text-slate-400">Acompanhe os jogos e palpites da primeira fase</p>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-4 space-y-4">
          {/* Filtro de Grupo */}
          <div>
            <label className="block text-sm font-semibold mb-2">Filtrar por Grupo</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedGroup === 'ALL' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedGroup('ALL')}
              >
                Todos
              </Button>
              {groups.map(group => (
                <Button
                  key={group}
                  variant={selectedGroup === group ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGroup(group)}
                >
                  {group}
                </Button>
              ))}
            </div>
          </div>

          {/* Filtro de Rodada */}
          <div>
            <label className="block text-sm font-semibold mb-2">Filtrar por Rodada</label>
            <div className="flex gap-2">
              <Button
                variant={selectedRound === 'ALL' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedRound('ALL')}
              >
                Todas
              </Button>
              {rounds.map(round => (
                <Button
                  key={round}
                  variant={selectedRound === round ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRound(round)}
                >
                  Rodada {round}
                </Button>
              ))}
            </div>
          </div>

          {/* Agrupamento */}
          <div>
            <label className="block text-sm font-semibold mb-2">Agrupar por</label>
            <div className="flex gap-2">
              <Button
                variant={groupBy === 'day' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('day')}
              >
                Dia
              </Button>
              <Button
                variant={groupBy === 'group' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('group')}
              >
                Grupo
              </Button>
              <Button
                variant={groupBy === 'round' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('round')}
              >
                Rodada
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de Jogos */}
      <MatchList matches={filteredMatches} groupBy={groupBy} />
    </div>
  )
}
```

### 5. Criar Componente de Tabelas de Classificação

**Arquivo**: `components/groups/group-standings.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { groupService } from '@/lib/api/groups'
import type { GroupStanding } from '@/lib/types'

export function GroupStandings() {
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStandings()
  }, [])

  const fetchStandings = async () => {
    try {
      const data = await groupService.getGroupStandings()
      setStandings(data)
    } catch (error) {
      console.error('Error fetching standings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="Carregando classificação..." />
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {standings.map(group => (
        <Card key={group.group}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-lg">Grupo {group.group}</h3>
            </div>
            <div className="space-y-2">
              {group.teams.map(team => (
                <div
                  key={team.name}
                  className={`flex items-center justify-between p-2 rounded ${
                    team.position <= 2
                      ? 'bg-green-900/20 border border-green-800/50'
                      : 'bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold w-6">{team.position}º</span>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400">{team.played}J</span>
                    <span className="font-bold text-red-500">{team.points}pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

### 6. Criar Modal de Placar Manual (Admin)

**Arquivo**: `components/admin/manual-score-modal.tsx`

```typescript
'use client'

import { useState } from 'react'
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
  onSuccess
}: ManualScoreModalProps) {
  const [homeScore, setHomeScore] = useState(match?.manualHomeScore?.toString() || '0')
  const [awayScore, setAwayScore] = useState(match?.manualAwayScore?.toString() || '0')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!match) return

    setIsSubmitting(true)
    try {
      await groupService.setManualScore(
        match.id,
        parseInt(homeScore),
        parseInt(awayScore)
      )
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
      await groupService.removeManualScore(match.id)
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
            {match.group && `Grupo ${match.group} •`} Rodada {match.round}
          </p>
          <p className="font-semibold">
            {match.homeTeam} <span className="text-slate-500">vs</span> {match.awayTeam}
          </p>
        </div>

        {match.useManualScore && (
          <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/50">
            <p className="text-sm text-yellow-400">
              ⚠️ Este jogo já possui placar manual
            </p>
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
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting}
            >
              💾 Salvar
            </Button>
            {match.useManualScore && (
              <Button
                type="button"
                variant="danger"
                onClick={handleRemove}
                isLoading={isSubmitting}
              >
                🗑️ Remover
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  )
}
```

### 7. Atualizar Sidebar com Nova Navegação

**Arquivo**: `components/navigation/sidebar.tsx`

```typescript
// Adicionar ao array navItems:

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/groups', icon: Grid, label: 'Fase de Grupos' },  // NOVO
  { href: '/predictions', icon: Target, label: 'Meus Palpites' },
  { href: '/predictions/all', icon: Users, label: 'Todos os Palpites' },
  { href: '/bracket', icon: Trophy, label: 'Mata-mata' },
  { href: '/standings', icon: BarChart2, label: 'Classificação' },  // NOVO
  { href: '/ranking', icon: TrendingUp, label: 'Ranking' },
  { href: '/statistics', icon: BarChart3, label: 'Estatísticas' },
  { href: '/analysis', icon: Activity, label: 'Análise' },
  { href: '/profile', icon: User, label: 'Perfil' },
]
```

### 8. Criar Página de Classificação dos Grupos

**Arquivo**: `app/(protected)/standings/page.tsx`

```typescript
'use client'

import { GroupStandings } from '@/components/groups/group-standings'

export default function StandingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Classificação dos Grupos</h1>
        <p className="text-slate-400">Tabelas atualizadas da fase de grupos</p>
      </div>

      <GroupStandings />
    </div>
  )
}
```

### 9. Adaptar Dashboard para Mostrar Grupos e Mata-mata

**Arquivo**: `app/(protected)/dashboard/page.tsx`

```typescript
// No componente DashboardPage, adicionar seção de próximos jogos de grupos:

<div className="grid lg:grid-cols-2 gap-6">
  {/* Próximos Jogos - Grupos */}
  <Card>
    <CardHeader
      title="Próximos Jogos - Grupos"
      subtitle="Fase de grupos em andamento"
    />
    <div className="p-6 space-y-3">
      {upcomingGroupMatches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  </Card>

  {/* Próximos Jogos - Mata-mata */}
  <Card>
    <CardHeader
      title="Próximos Jogos - Mata-mata"
      subtitle="Fase eliminatória"
    />
    {/* ... */}
  </Card>
</div>
```

## 📊 Componentes Reutilizáveis

### Match Card com Palpite

**Arquivo**: `components/groups/match-card.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Clock, Lock, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDateTime, canPredictMatch } from '@/lib/date-utils'
import { predictionService } from '@/lib/api/predictions'
import { useAuthStore } from '@/lib/store/auth'
import type { Match } from '@/lib/types'
import toast from 'react-hot-toast'

interface MatchCardProps {
  match: Match
  prediction?: { predictedHomeScore: number; predictedAwayScore: number }
  onPredictionSaved?: () => void
  showPredictionForm?: boolean
}

export function MatchCard({
  match,
  prediction,
  onPredictionSaved,
  showPredictionForm = true
}: MatchCardProps) {
  const { user } = useAuthStore()
  const [homeScore, setHomeScore] = useState(prediction?.predictedHomeScore?.toString() || '')
  const [awayScore, setAwayScore] = useState(prediction?.predictedAwayScore?.toString() || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canPredict = canPredictMatch(match.kickoffAt)
  const hasScores = match.finalHomeScore !== undefined && match.finalAwayScore !== undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!homeScore || !awayScore) {
      toast.error('Preencha ambos os placares')
      return
    }

    setIsSubmitting(true)
    try {
      await predictionService.createOrUpdatePrediction(match.id, {
        predictedHomeScore: parseInt(homeScore),
        predictedAwayScore: parseInt(awayScore)
      })
      toast.success('Palpite salvo!')
      onPredictionSaved?.()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar palpite')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Header com grupo e rodada */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {match.group && (
              <Badge variant="secondary">Grupo {match.group}</Badge>
            )}
            {match.round && (
              <Badge variant="secondary">R{match.round}</Badge>
            )}
          </div>
          {match.useManualScore && (
            <Badge variant="warning" className="text-xs">
              ✏️ Manual
            </Badge>
          )}
        </div>

        {/* Times e Placares */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Time Casa */}
          <div className="text-right">
            <p className="font-semibold">{match.homeTeam}</p>
            {hasScores && (
              <p className="text-3xl font-bold text-red-500 mt-1">
                {match.finalHomeScore}
              </p>
            )}
          </div>

          {/* VS */}
          <div className="text-center">
            <span className="text-slate-500">vs</span>
          </div>

          {/* Time Fora */}
          <div className="text-left">
            <p className="font-semibold">{match.awayTeam}</p>
            {hasScores && (
              <p className="text-3xl font-bold text-red-500 mt-1">
                {match.finalAwayScore}
              </p>
            )}
          </div>
        </div>

        {/* Data/Hora */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          {formatDateTime(match.kickoffAt)}
        </div>

        {/* Palpite Existente */}
        {prediction && !canPredict && (
          <div className="p-3 rounded-lg bg-slate-700/50">
            <p className="text-sm text-slate-400 mb-1">Seu palpite:</p>
            <p className="text-xl font-bold text-center">
              {prediction.predictedHomeScore} × {prediction.predictedAwayScore}
            </p>
          </div>
        )}

        {/* Form de Palpite */}
        {showPredictionForm && canPredict && !prediction && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-2 items-center">
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="text-center"
              />
              <span className="text-center text-slate-400">×</span>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="text-center"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full"
              isLoading={isSubmitting}
            >
              Salvar Palpite
            </Button>
          </form>
        )}

        {/* Bloqueado */}
        {!canPredict && !prediction && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-800/50">
            <Lock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Palpites encerrados</span>
          </div>
        )}
      </div>
    </Card>
  )
}
```

## ✅ Checklist de Implementação Frontend

- [ ] Atualizar types (Match, GroupLabel, GroupStanding)
- [ ] Criar serviço de grupos (groupService)
- [ ] Atualizar constantes (GROUP_LABELS, ROUND_LABELS)
- [ ] Criar página de Fase de Grupos
- [ ] Criar página de Classificação dos Grupos
- [ ] Criar componente GroupStandings
- [ ] Criar componente MatchCard
- [ ] Criar modal de placar manual (admin)
- [ ] Atualizar sidebar com nova navegação
- [ ] Atualizar dashboard para mostrar grupos
- [ ] Adaptar Meus Palpites para grupos
- [ ] Adaptar Todos os Palpites para grupos
- [ ] Atualizar ranking (unificado)
- [ ] Atualizar estatísticas (separar grupos/mata-mata)
- [ ] Testes em mobile
- [ ] Testes de usabilidade

## 🎨 Melhorias Visuais Sugeridas

1. **Cores por Fase**
   - Fase de Grupos: Verde
   - Mata-mata: Vermelho

2. **Badges Distintos**
   - Grupo + Rodada em badges pequenos
   - Status visual claro (agendado, ao vivo, finalizado)

3. **Animações**
   - Transições suaves entre filtros
   - Loading states consistentes
   - Feedback visual ao salvar palpites

4. **Responsividade**
   - Tabelas de classificação em grid responsivo
   - Cards de jogos empilhados no mobile
   - Filtros em accordion no mobile

## 🚀 Deploy

Após implementação:
```bash
# Build e teste
npm run build
npm run start

# Verificar erros
npm run lint

# Deploy
# (seguir processo de deploy existente)
```

---

## 🎯 Exemplos de Uso dos Novos Endpoints

### Exemplo 1: Buscar e Exibir Classificação em Tempo Real

```typescript
// components/groups/group-standings.tsx
const response = await groupService.getGroupStandingsRealTime()

// Exibir classificação
response.standings.forEach((group) => {
  console.log(`Grupo ${group.group}:`)
  
  group.teams.forEach((team, index) => {
    const position = index + 1
    const isQualified = group.qualified?.includes(team.team)
    
    console.log(
      `  ${position}º ${isQualified ? '🏆' : '  '} ${team.team}: ` +
      `${team.points}pts | ${team.played}J | SG:${team.goalDifference}`
    )
  })
  
  console.log(`  Classificados: ${group.qualified.join(', ')}\n`)
})
```

**Saída Esperada**:
```
Grupo A:
  1º 🏆 México: 9pts | 3J | SG:+6
  2º 🏆 Canadá: 6pts | 3J | SG:+2
  3º    País A3: 3pts | 3J | SG:-2
  4º    País A4: 0pts | 3J | SG:-6
  Classificados: México, Canadá
```

### Exemplo 2: Verificar Status dos Grupos

```typescript
// Verificar se todos grupos estão completos
const response = await groupService.getGroupStandingsRealTime()

const statusGrupos = {
  total: response.standings.length,
  completos: response.standings.filter(g => g.qualified.length === 2).length,
  incompletos: response.standings.filter(g => g.qualified.length < 2).length
}

const prontoParaOitavas = statusGrupos.completos === 12

console.log(`Status: ${statusGrupos.completos}/12 grupos completos`)
console.log(prontoParaOitavas ? '✅ Pode gerar oitavas!' : '⏳ Aguardando...')
```

### Exemplo 3: Gerar Oitavas (Admin Only)

```typescript
// components/admin/generate-knockout-button.tsx
import { groupService } from '@/lib/api/groups'
import { useAuthStore } from '@/lib/store/auth'

const { user } = useAuthStore()

// Verificar se é admin
if (user?.role !== 'admin') {
  return null // Botão invisível para não-admins
}

const handleGenerate = async () => {
  try {
    const result = await groupService.generateKnockout()
    
    toast.success(
      `Oitavas geradas! ${result.generated} criados, ${result.updated} atualizados`
    )
    
    console.log(result.message)
    // "Generated/updated knockout matches: 0 new, 12 updated"
  } catch (error) {
    toast.error('Erro ao gerar oitavas')
  }
}
```

### Exemplo 4: Mapeamento Correto de Jogos

```typescript
// ❌ ERRADO: Assumir IDs sequenciais
async function getMatchById(id: number) {
  // Isso NÃO funciona pois IDs são MongoDB ObjectIds
  return await fetch(`/api/v1/matches/${id}`)
}

// ✅ CERTO: Buscar por índice
async function getMatchByOldId(oldId: number) {
  const matches = await matchService.getAllMatches()
  // Jogo 1 do sistema antigo = índice 0
  // Jogo 5 do sistema antigo = índice 4
  const match = matches[oldId - 1]
  return match
}

// Exemplo de uso
const jogo5Antigo = await getMatchByOldId(5) // Índice 4 no array
const jogo87Antigo = await getMatchByOldId(87) // Índice 86 no array

console.log(jogo5Antigo._id) // ObjectId do MongoDB
console.log(jogo5Antigo.group) // Ex: "B"
console.log(jogo5Antigo.round) // Ex: 2
```

### Exemplo 5: Integração Completa no Dashboard

```typescript
// app/(protected)/dashboard/page.tsx
const [standings, setStandings] = useState<GroupStanding[]>([])
const [knockoutReady, setKnockoutReady] = useState(false)

useEffect(() => {
  async function loadDashboard() {
    // Buscar classificação
    const response = await groupService.getGroupStandingsRealTime()
    setStandings(response.standings)
    
    // Verificar se pode gerar oitavas
    const allComplete = response.standings.every(g => g.qualified.length === 2)
    setKnockoutReady(allComplete)
  }
  
  loadDashboard()
}, [])

// Renderizar status
{knockoutReady && (
  <Badge variant="success">
    ✅ Fase de grupos concluída! Oitavas disponíveis.
  </Badge>
)}

// Mostrar top 3 grupos mais competitivos (menor diferença entre 1º e 4º)
{standings
  .sort((a, b) => {
    const diffA = a.teams[0].points - a.teams[3].points
    const diffB = b.teams[0].points - b.teams[3].points
    return diffA - diffB
  })
  .slice(0, 3)
  .map(group => (
    <Card key={group.group}>
      <h3>Grupo {group.group} - Mais Equilibrado</h3>
      <p>Diferença: {group.teams[0].points - group.teams[3].points} pontos</p>
    </Card>
  ))
}
```

### Exemplo 6: Atualização Automática (Real-time)

```typescript
// Hook personalizado para classificação em tempo real
function useGroupStandingsRealTime(intervalMs = 30000) {
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>()
  
  useEffect(() => {
    async function update() {
      const response = await groupService.getGroupStandingsRealTime()
      setStandings(response.standings)
      setLastUpdate(new Date())
    }
    
    // Buscar imediatamente
    update()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(update, intervalMs)
    
    return () => clearInterval(interval)
  }, [intervalMs])
  
  return { standings, lastUpdate }
}

// Uso no componente
const { standings, lastUpdate } = useGroupStandingsRealTime()

<p className="text-xs text-slate-400">
  Última atualização: {lastUpdate?.toLocaleTimeString()}
</p>
```

---

## 📌 Checklist Final de Integração

### Backend
- [ ] Servidor rodando em `http://localhost:3001`
- [ ] Swagger docs acessível em `http://localhost:3001/api/docs`
- [ ] Endpoint `/matches/standings/groups` funcionando
- [ ] Endpoint `/matches/generate-knockout` funcionando (admin)
- [ ] Cron jobs ativos (30min, 5min, diário)
- [ ] 87 jogos da fase de grupos cadastrados
- [ ] Palpites migrados do sistema antigo
- [ ] Admin user criado (alefe.gla@bolao.com)

### Frontend
- [ ] Servidor rodando em `http://localhost:3006`
- [ ] Variável `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1`
- [ ] Login funcionando e gerando JWT
- [ ] Página `/groups` acessível
- [ ] Página `/standings` acessível
- [ ] Componente `GroupStandings` renderizando
- [ ] Componente `GenerateKnockoutButton` visível para admin
- [ ] Filtros de grupo e rodada funcionando
- [ ] MatchCard exibindo corretamente
- [ ] Modal de placar manual funcionando (admin)

### Integração
- [ ] Token JWT sendo enviado em todas requisições
- [ ] Tratamento de erro quando backend offline
- [ ] Loading states em todas telas
- [ ] Toast notifications funcionando
- [ ] Navegação entre grupos e mata-mata fluida
- [ ] Mobile first validado
- [ ] Tema escuro aplicado em todos componentes

---

**Resultado Esperado**: Sistema completo com fase de grupos + mata-mata totalmente integrados, mantendo o design premium e experiência mobile first!
