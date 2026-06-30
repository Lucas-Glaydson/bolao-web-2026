'use client'

import { useEffect, useRef, useState } from 'react'
import { Trophy, RefreshCw, Medal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { TeamLogo } from '@/components/ui/team-logo'
import { matchService } from '@/lib/api/matches'
import { predictionService } from '@/lib/api/predictions'
import { SyncMatchesButton } from '@/components/admin/sync-matches-button'
import { getTeamDisplayName, isMatchLive } from '@/lib/match-utils'
import type { Match, PredictionWithDetails } from '@/lib/types'

type ViewMode = 'real' | 'predictions'

// ─── Layout constants ──────────────────────────────────────────────────────
const S = 72   // base slot height (px) — R32 level
const W = 140  // match card width (px)
const C = 13   // connector strip width (px)

// ─── Helpers ───────────────────────────────────────────────────────────────
// Extrai o ÚLTIMO número do roundLabel — ex: "16 Avos de Final - R32-3" → 3
function bracketSeq(label: string): number {
  const nums = (label ?? '').match(/\d+/g)
  return nums ? parseInt(nums[nums.length - 1]) : 99
}

/**
 * Finds a match by the two teams involved — independent of home/away order.
 * Tolerant of partial name matches (e.g. "United States" ≈ "USA").
 * Primary strategy for round_of_32 where ALL matches share the same roundLabel.
 */
function byTeams(arr: Match[], teamA: string, teamB: string): Match | null {
  const a = teamA.toLowerCase()
  const b = teamB.toLowerCase()
  return arr.find(m => {
    const mh = m.homeTeam.toLowerCase()
    const ma = m.awayTeam.toLowerCase()
    const fwd = (mh.includes(a) || a.includes(mh)) && (ma.includes(b) || b.includes(ma))
    const rev = (mh.includes(b) || b.includes(mh)) && (ma.includes(a) || a.includes(ma))
    return fwd || rev
  }) ?? null
}

/**
 * Busca uma partida pelo número de sequência dentro de um stage.
 * Usado para R16 (1-8), QF (1-4), SF (1-2).
 */
function bySeq(arr: Match[], seq: number): Match | null {
  return arr.find(
    m => m.externalId === String(seq) || bracketSeq(m.roundLabel) === seq
  ) ?? null
}

/**
 * Se o mapeamento explícito retornar tudo null, cai para ordenação por
 * externalId numérico e fatiamento posicional — ao menos exibe times.
 */
function withFallback(
  slots: (Match | null)[],
  arr: Match[],
  start: number,
  count: number,
): (Match | null)[] {
  if (arr.length > 0 && slots.every(s => s === null)) {
    const sorted = [...arr].sort((a, b) => parseInt(a.externalId) - parseInt(b.externalId))
    const slice: (Match | null)[] = sorted.slice(start, start + count)
    while (slice.length < count) slice.push(null)
    return slice
  }
  return slots
}

// ─── Match slot card ────────────────────────────────────────────────────────
function BracketSlot({
  match, viewMode, pred,
}: {
  match: Match | null
  viewMode: ViewMode
  pred?: PredictionWithDetails
}) {
  const home = match ? getTeamDisplayName(match.homeTeam) : 'A Definir'
  const away = match ? getTeamDisplayName(match.awayTeam) : 'A Definir'
  const hs = viewMode === 'real'
    ? (match?.officialHomeScore ?? null)
    : (pred?.predictedHomeScore ?? null)
  const as_ = viewMode === 'real'
    ? (match?.officialAwayScore ?? null)
    : (pred?.predictedAwayScore ?? null)
  const live = match?.status === 'live'
  // For penalty matches in real mode, scores are equal — use penaltyWinner to highlight the advancing team
  const penaltyHome = viewMode === 'real' ? match?.penaltyWinner === 'home' : pred?.tiebreakWinner === 'home'
  const penaltyAway = viewMode === 'real' ? match?.penaltyWinner === 'away' : pred?.tiebreakWinner === 'away'
  const isDraw = hs !== null && as_ !== null && hs === as_
  const homeWon = (hs !== null && as_ !== null && hs > as_) || (isDraw && penaltyHome)
  const awayWon = (hs !== null && as_ !== null && as_ > hs) || (isDraw && penaltyAway)

  return (
    <div
      className={`rounded overflow-hidden shrink-0 border text-[11px] ${live ? 'border-red-500 animate-pulse' : 'border-slate-600'}`}
      style={{ width: W }}
    >
      <div className={`flex items-center gap-1 px-2 py-1.5 ${homeWon ? 'bg-green-900/40 text-green-200 font-semibold' : 'bg-slate-800 text-slate-300'}`}>
        {match && <TeamLogo src={match.homeTeamLogo} alt={home} className="w-3.5 h-3.5 shrink-0" teamName={match.homeTeam} />}
        <span className="truncate flex-1 leading-tight">{home}</span>
        {hs !== null && <span className="font-mono font-bold ml-1 shrink-0">{hs}</span>}
      </div>
      <div className="h-px bg-slate-700" />
      <div className={`flex items-center gap-1 px-2 py-1.5 ${awayWon ? 'bg-green-900/40 text-green-200 font-semibold' : 'bg-slate-800 text-slate-300'}`}>
        {match && <TeamLogo src={match.awayTeamLogo} alt={away} className="w-3.5 h-3.5 shrink-0" teamName={match.awayTeam} />}
        <span className="truncate flex-1 leading-tight">{away}</span>
        {as_ !== null && <span className="font-mono font-bold ml-1 shrink-0">{as_}</span>}
      </div>
    </div>
  )
}

// ─── Column of match slots ───────────────────────────────────────────────────
function Slots({
  matches, slotH, viewMode, predsMap,
}: {
  matches: (Match | null)[]
  slotH: number
  viewMode: ViewMode
  predsMap: Map<string, PredictionWithDetails>
}) {
  return (
    <div className="flex flex-col shrink-0">
      {matches.map((m, i) => (
        <div key={i} className="flex items-center justify-center py-1.5" style={{ height: slotH }}>
          <BracketSlot
            match={m}
            viewMode={viewMode}
            pred={m ? predsMap.get(m.id || m._id || '') : undefined}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Bracket arm pointing RIGHT (left half of bracket, outlet) ───────────────
function RightArm({ count, slotH }: { count: number; slotH: number }) {
  return (
    <div className="flex flex-col shrink-0" style={{ width: C }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="relative shrink-0" style={{ height: slotH }}>
          <div className="absolute border-t border-slate-600" style={{ top: '50%', left: 0, right: 0 }} />
          {i % 2 === 0
            ? <div className="absolute border-r border-slate-600" style={{ right: 0, top: '50%', bottom: 0 }} />
            : <div className="absolute border-r border-slate-600" style={{ right: 0, top: 0, bottom: '50%' }} />
          }
        </div>
      ))}
    </div>
  )
}

// ─── Bracket arm pointing LEFT (right half of bracket, outlet) ───────────────
function LeftArm({ count, slotH }: { count: number; slotH: number }) {
  return (
    <div className="flex flex-col shrink-0" style={{ width: C }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="relative shrink-0" style={{ height: slotH }}>
          <div className="absolute border-t border-slate-600" style={{ top: '50%', left: 0, right: 0 }} />
          {i % 2 === 0
            ? <div className="absolute border-l border-slate-600" style={{ left: 0, top: '50%', bottom: 0 }} />
            : <div className="absolute border-l border-slate-600" style={{ left: 0, top: 0, bottom: '50%' }} />
          }
        </div>
      ))}
    </div>
  )
}

// ─── Simple horizontal inlet strip ───────────────────────────────────────────
function Horiz({ count, slotH }: { count: number; slotH: number }) {
  return (
    <div className="flex flex-col shrink-0" style={{ width: C }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="relative shrink-0" style={{ height: slotH }}>
          <div className="absolute border-t border-slate-600" style={{ top: '50%', left: 0, right: 0 }} />
        </div>
      ))}
    </div>
  )
}

// ─── Column label header cell ─────────────────────────────────────────────────
function ColLabel({ label, width, highlight }: { label: string; width: number; highlight?: boolean }) {
  return (
    <div
      className={`text-center text-[10px] font-bold uppercase tracking-wide shrink-0 ${highlight ? 'text-yellow-500' : 'text-slate-500'}`}
      style={{ width }}
    >
      {label}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BracketPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<PredictionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('real')
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    try {
      const [m, p] = await Promise.all([
        matchService.getAllMatches(),
        predictionService.getMyPredictions(),
      ])
      setMatches(m)
      setPredictions(p)
      return m.some(isMatchLive)
    } catch (e: any) {
      console.warn('bracket fetch:', e?.message || e)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData().then(live => {
      if (live) {
        const t = setInterval(fetchData, 60000)
        return () => clearInterval(t)
      }
    })
  }, [])

  // Auto-scroll to center the Final card after data loads
  useEffect(() => {
    if (isLoading) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          const el = scrollRef.current
          el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
        }
      })
    })
  }, [isLoading])

  if (isLoading) return <LoadingSpinner fullScreen text="Carregando chaveamento..." />

  const ko = matches.filter(m => m.stage !== 'group_stage')

  const r32Raw = ko.filter(m => m.stage === 'round_of_32')
  const r16Raw = ko.filter(m => m.stage === 'round_of_16')
  const qf  = ko.filter(m => m.stage === 'quarter_finals')
  const sf  = ko.filter(m => m.stage === 'semi_finals')
  const fin = ko.find(m => m.stage === 'final') ?? null
  const tp  = ko.find(m => m.stage === 'third_place') ?? null

  // Debug: loga os primeiros jogos knockout para inspecionar o formato real
  // da API (externalId, stage, roundLabel). Verificar no Console do browser.
  if (ko.length > 0) {
    console.log('[Bracket] knockout matches sample:', ko.slice(0, 5).map(m => ({
      id: m.id,
      externalId: m.externalId,
      stage: m.stage,
      roundLabel: m.roundLabel,
      bracketSeq: bracketSeq(m.roundLabel),
      homeTeam: m.homeTeam,
    })))
    console.log('[Bracket] stage counts:', {
      round_of_32: r32Raw.length,
      round_of_16: r16Raw.length,
      quarter_finals: qf.length,
      semi_finals: sf.length,
      total_ko: ko.length,
    })
  }

  // Copa 2026: backend pode classificar os 16 jogos iniciais como round_of_16
  // (ao invés de round_of_32). Se round_of_32 está vazio e round_of_16 tem > 8
  // jogos, os excedentes SÃO os 16 avos. Se ambos vazios mas ko tem partidas,
  // trata todas ko (exceto qf/sf/final) como r32.
  const r32 = r32Raw.length > 0
    ? r32Raw
    : r16Raw.length > 8
      ? r16Raw
      : r32Raw
  const r16 = r32Raw.length > 0
    ? r16Raw
    : r16Raw.length > 8 ? [] : r16Raw

  // ── Explicit slot mapping — FIFA 2026 official bracket ──────────────────
  // r32: identified by team names (API roundLabel is "Rodada de 32" for ALL
  //   matches — bracketSeq is useless here; externalId is a football-API number).
  // r16/qf/sf: bySeq first, withFallback by sorted externalId if bySeq fails.
  //
  // LEFT SIDE — top to bottom:
  //   J73 / J75  →  O1  ┐
  //   J74 / J77  →  O2  ┤→ Q1 ─┐
  //   J83 / J84  →  O3  ┐      ├→ S1
  //   J81 / J82  →  O4  ┘→ Q2 ─┘
  //
  // RIGHT SIDE — top to bottom:
  //   J76 / J78  →  O5  ┐
  //   J79 / J80  →  O6  ┘→ Q3 ─┐
  //   J86 / J88  →  O7  ┐      ├→ S2
  //   J85 / J87  →  O8  ┘→ Q4 ─┘

  // API may pre-load extra placeholder matches per stage; cap to expected counts.
  const r16sorted = [...r16].sort((a, b) => parseInt(a.externalId) - parseInt(b.externalId)).slice(0, 8)
  const qfSorted  = [...qf].sort((a, b) => parseInt(a.externalId) - parseInt(b.externalId)).slice(0, 4)
  const sfSorted  = [...sf].sort((a, b) => parseInt(a.externalId) - parseInt(b.externalId)).slice(0, 2)

  const r32L = withFallback([
    byTeams(r32, 'South Africa', 'Canada'),       // J73
    byTeams(r32, 'Netherlands', 'Morocco'),        // J75
    byTeams(r32, 'Germany', 'Paraguay'),           // J74
    byTeams(r32, 'France', 'Sweden'),              // J77
    byTeams(r32, 'Portugal', 'Croatia'),           // J83
    byTeams(r32, 'Spain', 'Austria'),              // J84
    byTeams(r32, 'United States', 'Bosnia'),       // J81
    byTeams(r32, 'Belgium', 'Senegal'),            // J82
  ], r32, 0, 8)

  const r32R = withFallback([
    byTeams(r32, 'Brazil', 'Japan'),               // J76
    byTeams(r32, 'Ivory Coast', 'Norway'),         // J78
    byTeams(r32, 'Mexico', 'Ecuador'),             // J79
    byTeams(r32, 'England', 'Congo'),              // J80 — "DR Congo" / "Congo DR"
    byTeams(r32, 'Argentina', 'Cape Verde'),       // J86
    byTeams(r32, 'Australia', 'Egypt'),            // J88
    byTeams(r32, 'Switzerland', 'Algeria'),        // J85
    byTeams(r32, 'Colombia', 'Ghana'),             // J87
  ], r32, 8, 8)

  const r16L = withFallback([
    bySeq(r16sorted, 1), // O1 — W(J73) vs W(J75)
    bySeq(r16sorted, 2), // O2 — W(J74) vs W(J77)
    bySeq(r16sorted, 3), // O3 — W(J83) vs W(J84)
    bySeq(r16sorted, 4), // O4 — W(J81) vs W(J82)
  ], r16sorted, 0, 4)

  const r16R = withFallback([
    bySeq(r16sorted, 5), // O5 — W(J76) vs W(J78)
    bySeq(r16sorted, 6), // O6 — W(J79) vs W(J80)
    bySeq(r16sorted, 7), // O7 — W(J86) vs W(J88)
    bySeq(r16sorted, 8), // O8 — W(J85) vs W(J87)
  ], r16sorted, 4, 4)

  const qfL = withFallback([
    bySeq(qfSorted, 1), // Q1 — W(O1) vs W(O2)
    bySeq(qfSorted, 2), // Q2 — W(O3) vs W(O4)
  ], qfSorted, 0, 2)

  const qfR = withFallback([
    bySeq(qfSorted, 3), // Q3 — W(O5) vs W(O6)
    bySeq(qfSorted, 4), // Q4 — W(O7) vs W(O8)
  ], qfSorted, 2, 2)

  const sfL: (Match | null)[] = [bySeq(sfSorted, 1) ?? sfSorted[0] ?? null] // S1
  const sfR: (Match | null)[] = [bySeq(sfSorted, 2) ?? sfSorted[1] ?? null] // S2

  const hasR32 = r32.length > 0
  const hasR16 = r16.length > 0

  const predsMap = new Map(predictions.map(p => [p.matchId, p]))
  const totalH = S * 8  // 576px

  // ── Column label widths ─────────────────────────────────────────────────
  const r32LabelW = W + C
  const r16LabelW = C + W + C
  const qfLabelW  = C + W + C
  const sfLabelW  = C + W + C
  const finalLabelW = W

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Chaveamento</h1>
          <p className="text-slate-400">32 times convergindo para o centro</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={viewMode === 'real' ? 'primary' : 'outline'}
            onClick={() => setViewMode('real')}
          >
            ⚽ Placar Real
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'predictions' ? 'primary' : 'outline'}
            onClick={() => setViewMode('predictions')}
          >
            🎯 Meus Palpites
          </Button>
          <SyncMatchesButton compact onSynced={fetchData} />
          <Button size="sm" variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'predictions' && (
        <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-800/40 text-sm text-blue-300">
          Mostrando seus palpites para cada partida. Placares reais aparecem em verde quando finalizados.
        </div>
      )}

      <Card className="!p-0 overflow-hidden">
        <div ref={scrollRef} className="py-4 px-3 overflow-x-auto">
          {/* ── Column label row ──────────────────────────────────────────── */}
          <div className="flex mb-2" style={{ minWidth: 'max-content' }}>
            {hasR32 && <ColLabel label="16 Avos" width={r32LabelW} />}
            {hasR16 && <ColLabel label="Oitavas" width={r16LabelW} />}
            <ColLabel label="Quartas" width={qfLabelW} />
            <ColLabel label="Semifinal" width={sfLabelW} />
            <ColLabel label="FINAL" width={finalLabelW} highlight />
            <ColLabel label="Semifinal" width={sfLabelW} />
            <ColLabel label="Quartas" width={qfLabelW} />
            {hasR16 && <ColLabel label="Oitavas" width={r16LabelW} />}
            {hasR32 && <ColLabel label="16 Avos" width={r32LabelW} />}
          </div>

          {/* ── Bracket body ──────────────────────────────────────────────── */}
          <div className="flex" style={{ minWidth: 'max-content', height: totalH }}>

            {/* ════ LEFT HALF ════ */}

            {/* R32 left (8 matches) */}
            {hasR32 && (
              <>
                <Slots matches={r32L} slotH={S} viewMode={viewMode} predsMap={predsMap} />
                <RightArm count={8} slotH={S} />
              </>
            )}

            {/* R16 left (4 matches) */}
            {hasR16 && (
              <>
                {hasR32 && <Horiz count={4} slotH={S * 2} />}
                <Slots matches={r16L} slotH={S * 2} viewMode={viewMode} predsMap={predsMap} />
                <RightArm count={4} slotH={S * 2} />
              </>
            )}

            {/* QF left (2 matches) */}
            <>
              {(hasR32 || hasR16) && <Horiz count={2} slotH={S * 4} />}
              <Slots matches={qfL} slotH={S * 4} viewMode={viewMode} predsMap={predsMap} />
              <RightArm count={2} slotH={S * 4} />
            </>

            {/* SF left (1 match) */}
            <>
              <Horiz count={1} slotH={S * 8} />
              <Slots matches={sfL} slotH={S * 8} viewMode={viewMode} predsMap={predsMap} />
              <Horiz count={1} slotH={S * 8} />
            </>

            {/* ════ FINAL (center) ════ */}
            <div
              className="shrink-0 flex flex-col items-center justify-center gap-1"
              style={{ width: W, height: totalH }}
            >
              <Trophy className="w-4 h-4 text-yellow-500" />
              <BracketSlot
                match={fin}
                viewMode={viewMode}
                pred={fin ? predsMap.get(fin.id || fin._id || '') : undefined}
              />
              {fin?.winner && viewMode === 'real' && (() => {
                const advancing = fin.winner === 'home' || fin.winner === 'away'
                  ? fin.winner
                  : fin.penaltyWinner
                return advancing ? (
                  <div className="text-[10px] text-green-400 font-semibold text-center">
                    🏆 {getTeamDisplayName(advancing === 'home' ? fin.homeTeam : fin.awayTeam)}
                    {fin.penaltyWinner && <span className="text-yellow-400"> (pên.)</span>}
                  </div>
                ) : null
              })()}
            </div>

            {/* ════ RIGHT HALF ════ */}

            {/* SF right — [Horiz inlet] [SF] [Horiz outlet → arm] */}
            <Horiz count={1} slotH={S * 8} />
            <Slots matches={sfR} slotH={S * 8} viewMode={viewMode} predsMap={predsMap} />
            <Horiz count={1} slotH={S * 8} />

            {/* QF right — [SF→QF arm] [QF] [Horiz outlet → arm] */}
            <LeftArm count={2} slotH={S * 4} />
            <Slots matches={qfR} slotH={S * 4} viewMode={viewMode} predsMap={predsMap} />
            {(hasR32 || hasR16) && <Horiz count={2} slotH={S * 4} />}

            {/* R16 right — [QF→R16 arm] [R16] [Horiz outlet → arm] */}
            {(hasR32 || hasR16) && <LeftArm count={4} slotH={S * 2} />}
            {hasR16 && <Slots matches={r16R} slotH={S * 2} viewMode={viewMode} predsMap={predsMap} />}
            {hasR16 && hasR32 && <Horiz count={4} slotH={S * 2} />}

            {/* R32 right — [R16→R32 arm] [R32] */}
            {hasR16 && hasR32 && <LeftArm count={8} slotH={S} />}
            {hasR32 && <Slots matches={r32R} slotH={S} viewMode={viewMode} predsMap={predsMap} />}

          </div>
        </div>
      </Card>

      {/* Empty state */}
      {ko.length === 0 && (
        <Card>
          <div className="p-12 text-center text-slate-400">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p>Nenhuma partida do mata-mata disponível ainda.</p>
            <p className="text-sm mt-1">O chaveamento aparece aqui assim que a fase eliminatória começar.</p>
          </div>
        </Card>
      )}

      {/* Third place */}
      {tp && (
        <Card>
          <div className="p-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wide">
              <Medal className="w-4 h-4 text-amber-500" />
              Disputa do 3º Lugar
            </div>
            <BracketSlot match={tp} viewMode={viewMode} pred={predsMap.get(tp.id || tp._id || '')} />
          </div>
        </Card>
      )}
    </div>
  )
}
