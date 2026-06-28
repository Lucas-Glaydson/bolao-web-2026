'use client'

import { useEffect, useRef, useState } from 'react'
import { Trophy, RefreshCw } from 'lucide-react'
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
function sortByNum(arr: Match[], re: RegExp) {
  return [...arr].sort(
    (a, b) =>
      (parseInt((a.roundLabel ?? '').match(re)?.[1] ?? '99')) -
      (parseInt((b.roundLabel ?? '').match(re)?.[1] ?? '99'))
  )
}

function padNull(arr: Match[], n: number): (Match | null)[] {
  const r: (Match | null)[] = [...arr]
  while (r.length < n) r.push(null)
  return r
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
  const homeWon = hs !== null && as_ !== null && hs > as_
  const awayWon = hs !== null && as_ !== null && as_ > hs

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

  // ── Sort matches by stage and number ────────────────────────────────────
  const ko = matches.filter(m => m.stage !== 'group_stage')

  // Fixed stages (names don't change)
  const qfAll = sortByNum(ko.filter(m => m.stage === 'quarter_finals'), /(\d+)/)
  const sfAll = ko.filter(m => m.stage === 'semi_finals')
  const fin = ko.find(m => m.stage === 'final') ?? null

  // First/second knockout rounds: detect flexibly.
  // Backend may use 'round_of_32' OR 'round_of_16' for Copa 2026's "16 avos".
  const r32Named = sortByNum(ko.filter(m => m.stage === 'round_of_32'), /(\d+)/)
  const r16Named = sortByNum(ko.filter(m => m.stage === 'round_of_16'), /(\d+)/)

  // If round_of_32 is populated → use it. Otherwise fall back to count-based:
  // round_of_16 with > 8 matches → those ARE the "16 avos" (all 16 are treated as r32).
  // round_of_16 with ≤ 8 matches → standard oitavas only.
  const r32All = r32Named.length > 0
    ? r32Named
    : r16Named.length > 8 ? r16Named : []
  const r16All = r32Named.length > 0
    ? r16Named
    : r16Named.length > 8 ? [] : r16Named

  const hasR32 = r32All.length > 0
  // Se 16 avos existem, sempre exibe oitavas (mesmo vazia) — Copa 2026 sempre tem as duas fases
  const hasR16 = r16All.length > 0 || hasR32

  // ── Split into left (1-8) and right (9-16) halves ───────────────────────
  const r32L = padNull(r32All.slice(0, 8), 8)
  const r32R = padNull(r32All.slice(8, 16), 8)
  const r16L = padNull(r16All.slice(0, 4), 4)
  const r16R = padNull(r16All.slice(4, 8), 4)
  const qfL = padNull(qfAll.slice(0, 2), 2)
  const qfR = padNull(qfAll.slice(2, 4), 2)
  const sfL: (Match | null)[] = [sfAll[0] ?? null]
  const sfR: (Match | null)[] = [sfAll[1] ?? null]

  const predsMap = new Map(predictions.map(p => [p.matchId, p]))
  const totalH = S * 8  // 576px

  // ── Column label widths ─────────────────────────────────────────────────
  const r32LabelW = W + C               // slots + arm
  const r16LabelW = C + W + C           // inlet + slots + arm
  const qfLabelW = C + W + C
  const sfLabelW = C + W + C
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
              {fin?.winner && viewMode === 'real' && (
                <div className="text-[10px] text-green-400 font-semibold text-center">
                  🏆 {fin.winner === 'home'
                    ? getTeamDisplayName(fin.homeTeam)
                    : fin.winner === 'away'
                      ? getTeamDisplayName(fin.awayTeam)
                      : '–'}
                </div>
              )}
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
    </div>
  )
}
