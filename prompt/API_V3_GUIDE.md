# 🚀 Guia Rápido - API v3 do Bolão

## Mudanças Principais

### 1. **Tipos de Match Atualizados**
```typescript
interface Match {
  id: string                        // Antes: _id
  externalId: string               
  stage: 'group_stage' | 'round_of_16' | ...  // snake_case agora
  status: 'scheduled' | 'live' | 'finished' | ...  // lowercase
  
  // Novos campos
  roundLabel: string               // Ex: "Group A - 1" ou "Oitavas de Final - R16-1"
  homeTeamLogo?: string            // URL do escudo
  awayTeamLogo?: string            
  officialHomeScore: number | null // Placar oficial
  officialAwayScore: number | null
  canPredict: boolean              // Controle de deadline
  syncedAt: string                 // Última sincronização
  kickoffAt: string                // Substitui utcDate
}
```

### 2. **Helpers Criados**

```typescript
import {
  getTeamDisplayName,     // Converte "TBD-B2" → "A Definir"
  getTeamDisplayLogo,     // Retorna placeholder para times TBD
  getStatusColor,         // Classe Tailwind para cor do status
  getStatusIcon,          // Emoji do status
  isMatchLive,            // match.status === 'live'
  isMatchFinished,        // match.status === 'finished'
  canMakePrediction,      // Usa match.canPredict
  getScore,               // "2 × 1" ou "- × -"
  formatKickoff,          // "11/06 às 15h"
  formatRoundLabel,       // "Grupo A · Rodada 1"
} from '@/lib/match-utils'
```

### 3. **Novo Serviço: Stages**

```typescript
import { stageService } from '@/lib/api/stages'

// Obter todas as fases e status
const stages = await stageService.getStages()
// [{stage: 'group_stage', allowPredictions: true, ...}, ...]

// Verificar se fase aceita palpites
const canPredict = await stageService.isStageOpen('round_of_16')
```

### 4. **Constantes Atualizadas**

```typescript
import { STAGE_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'

STAGE_LABELS['group_stage']  // "Fase de Grupos"
STAGE_LABELS['round_of_16']  // "Oitavas de Final"

STATUS_LABELS['live']         // "Ao Vivo"
STATUS_COLORS['live']         // "bg-red-600 text-white animate-pulse"
```

## 📦 Exemplos de Uso

### Renderizar Card de Partida

```tsx
import { getTeamDisplayName, getTeamDisplayLogo, getScore, formatKickoff } from '@/lib/match-utils'
import { TeamLogo } from '@/components/ui/team-logo'
import { STATUS_LABELS } from '@/lib/constants'

function MatchCard({ match }: { match: Match }) {
  const homeTeam = getTeamDisplayName(match.homeTeam)
  const awayTeam = getTeamDisplayName(match.awayTeam)
  const homeLogo = getTeamDisplayLogo(match.homeTeamLogo, match.homeTeam)
  const awayLogo = getTeamDisplayLogo(match.awayTeamLogo, match.awayTeam)
  
  return (
    <div>
      <Badge>{STATUS_LABELS[match.status]}</Badge>
      
      <div className="flex items-center gap-4">
        <TeamLogo src={homeLogo} alt={homeTeam} className="w-12 h-12" teamName={match.homeTeam} />
        <span>{homeTeam}</span>
        
        {match.status === 'finished' ? (
          <div className="text-2xl font-bold">{getScore(match)}</div>
        ) : (
          <span className="text-slate-500">vs</span>
        )}
        
        <span>{awayTeam}</span>
        <TeamLogo src={awayLogo} alt={awayTeam} className="w-12 h-12" teamName={match.awayTeam} />
      </div>
      
      {match.status === 'scheduled' && (
        <div className="text-sm text-slate-400">
          {formatKickoff(match.kickoffAt)}
        </div>
      )}
      
      {match.canPredict && (
        <Button>Fazer Palpite</Button>
      )}
    </div>
  )
}
```

**Nota:** O componente `TeamLogo` automaticamente mostra um ícone "?" quando a imagem não existe ou falha ao carregar.

### Verificar Polling para Jogos Ao Vivo

```tsx
import { isMatchLive } from '@/lib/match-utils'

useEffect(() => {
  const hasLiveMatches = matches.some(isMatchLive)
  
  if (hasLiveMatches) {
    // Polling a cada 60 segundos
    const interval = setInterval(() => {
      fetchMatches()
    }, 60000)
    
    return () => clearInterval(interval)
  }
}, [matches])
```

### Buscar Classificação dos Grupos

```tsx
import { groupService } from '@/lib/api/groups'

const { standings } = await groupService.getGroupStandingsRealTime()

standings.forEach(group => {
  console.log(`Grupo ${group.group}`)
  group.teams.forEach((team, i) => {
    const qualified = group.qualified.includes(team.team) ? '✅' : ''
    console.log(`${i+1}º ${team.team} - ${team.points}pts ${qualified}`)
  })
})
```

### Buscar Partidas por Fase

```tsx
import { matchService } from '@/lib/api/matches'

// Fase de grupos
const groupMatches = await matchService.getMatchesByStage('group_stage')

// Oitavas de final
const r16Matches = await matchService.getMatchesByStage('round_of_16')
```

## 🖼️ Componente TeamLogo

O componente `TeamLogo` lida automaticamente com imagens de times que não existem ou falham ao carregar.

### Como Funciona

```tsx
import { TeamLogo } from '@/components/ui/team-logo'

// Mostra logo se existir, senão mostra "?" em círculo cinza
<TeamLogo 
  src={match.homeTeamLogo} 
  alt="Brasil" 
  className="w-12 h-12"
  teamName={match.homeTeam}
/>
```

### Comportamento

1. **Imagem existe e carrega** → Mostra a imagem
2. **Imagem não existe** → Mostra "?" em círculo cinza
3. **Imagem falha ao carregar** → Mostra "?" em círculo cinza
4. **Time é TBD** → Mostra "?" em círculo cinza

### Propriedades

- `src` (opcional): URL da imagem do logo
- `alt` (obrigatório): Texto alternativo
- `className` (opcional): Classes CSS personalizadas (padrão: `w-12 h-12`)
- `teamName` (opcional): Nome do time para detectar "TBD-"

### Customização

O fallback é um círculo com fundo `bg-slate-700`, texto `text-slate-400` e borda arredondada. Você pode ajustar o tamanho via `className`.

**Exemplos:**

```tsx
// Pequeno (8px)
<TeamLogo src={logo} alt="Time" className="w-8 h-8" />

// Médio (12px) - padrão
<TeamLogo src={logo} alt="Time" className="w-12 h-12" />

// Grande (16px)
<TeamLogo src={logo} alt="Time" className="w-16 h-16" />
```

## 🎨 Estilo de Status

Use as classes do `STATUS_COLORS`:

```tsx
import { STATUS_COLORS } from '@/lib/constants'

<Badge className={STATUS_COLORS[match.status]}>
  {STATUS_LABELS[match.status]}
</Badge>
```

**Resultado:**
- `scheduled` → Cinza neutro
- `live` → Vermelho pulsante 🔴
- `finished` → Verde ✅
- `postponed` → Amarelo ⏸️
- `cancelled` → Cinza apagado ❌

## 🔄 Compatibilidade com Código Legado

Os tipos mantêm campos de compatibilidade:
```typescript
match._id       // Equivalente a match.id
match.date      // Equivalente a match.kickoffAt
match.teamA     // Equivalente a match.homeTeam
match.teamB     // Equivalente a match.awayTeam
```

As constantes também mantêm valores antigos:
```typescript
STAGE_LABELS['GROUP_STAGE']  // Ainda funciona (legado)
STAGE_LABELS['group_stage']  // Novo formato (preferido)
```

## 📊 Sistema de Pontuação

```typescript
const POINTS_BY_STAGE = {
  group_stage: { outcome: 1, exact: 3 },
  round_of_16: { outcome: 1, exact: 3 },
  quarter_finals: { outcome: 1, exact: 3 },
  semi_finals: { outcome: 2, exact: 4 },
  final: { outcome: 2, exact: 4 },
}
```

## 🚦 Próximos Passos

1. ✅ Tipos atualizados
2. ✅ Helpers criados
3. ✅ Serviço de stages
4. ✅ Constantes atualizadas
5. ⏳ Atualizar mock data
6. ⏳ Atualizar componentes de UI
7. ⏳ Testar integração com backend real

---

**Nota:** O modo mock está ativo (`USE_MOCK_DATA=true`). Para conectar ao backend real, altere no [.env.local](.env.local):
```
NEXT_PUBLIC_USE_MOCK_DATA=false
```
