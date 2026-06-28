import type { Match } from './types'

/**
 * Helper para exibir nome do time
 * Times com nome iniciando em "TBD-" são "A Definir"
 */
export function getTeamDisplayName(teamName: string): string {
  if (!teamName) return 'A Definir'
  return teamName.startsWith('TBD-') || teamName.startsWith('TBD') ? 'A Definir' : teamName
}

/**
 * Helper para exibir logo do time
 * Retorna placeholder se logo não estiver disponível ou for time "TBD"
 */
export function getTeamDisplayLogo(logo?: string | null, teamName?: string): string | null {
  if (!logo || !teamName) return null
  if (teamName.startsWith('TBD')) return null
  return logo
}

/**
 * Helper para obter cor de status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: 'text-slate-400',
    live: 'text-red-500 font-bold animate-pulse',
    finished: 'text-green-500',
    postponed: 'text-yellow-500',
    cancelled: 'text-gray-500',
  }
  return colors[status] || colors.scheduled
}

/**
 * Helper para obter ícone de status
 */
export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    scheduled: '📅',
    live: '🔴',
    finished: '✅',
    postponed: '⏸️',
    cancelled: '❌',
  }
  return icons[status] || icons.scheduled
}

/**
 * Verifica se um jogo está ao vivo
 */
export function isMatchLive(match: Match): boolean {
  return match.status === 'live'
}

/**
 * Verifica se um jogo foi finalizado
 */
export function isMatchFinished(match: Match): boolean {
  return match.status === 'finished'
}

/**
 * Verifica se pode fazer palpite.
 * Usa o campo canPredict da API — o backend é a fonte de verdade para o prazo.
 */
export function canMakePrediction(match: Match): boolean {
  return match.canPredict && match.status === 'scheduled'
}

/**
 * Verifica se a partida é fase eliminatória (não é fase de grupos)
 */
export function isKnockoutStage(match: Match): boolean {
  return match.stage !== 'group_stage'
}

/**
 * Obtém placar formatado
 */
export function getScore(match: Match): string {
  if (match.officialHomeScore === null || match.officialAwayScore === null) {
    return '- × -'
  }
  return `${match.officialHomeScore} × ${match.officialAwayScore}`
}

/**
 * Obtém informação do placar
 */
export function getScoreInfo(match: Match): { home: number | null; away: number | null } {
  return {
    home: match.officialHomeScore,
    away: match.officialAwayScore,
  }
}

/**
 * Formata data de kickoff
 */
export function formatKickoff(kickoffAt: string): string {
  try {
    const date = new Date(kickoffAt)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(date)
  } catch {
    return 'Data inválida'
  }
}

/**
 * Formata data de kickoff (versão longa)
 */
export function formatKickoffLong(kickoffAt: string): string {
  try {
    const date = new Date(kickoffAt)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(date)
  } catch {
    return 'Data inválida'
  }
}

/**
 * Retorna label amigável do roundLabel
 * Ex: "Group A - 1" → "Grupo A · Rodada 1"
 * Ex: "Oitavas de Final - R16-1" → "Oitavas de Final · Jogo 1"
 */
export function formatRoundLabel(roundLabel: string): string {
  if (!roundLabel) return ''
  
  // Para fase de grupos
  if (roundLabel.includes('Group')) {
    const match = roundLabel.match(/Group ([A-L]) - (\d)/)
    if (match) {
      return `Grupo ${match[1]} · Rodada ${match[2]}`
    }
  }
  
  // Para mata-mata
  if (roundLabel.includes('R16')) {
    const num = roundLabel.split('-')[1] || ''
    return `Oitavas de Final · Jogo ${num.replace('R16-', '')}`
  }
  
  if (roundLabel.includes('Quarter')) {
    return `Quartas de Final`
  }
  
  if (roundLabel.includes('Semi')) {
    return `Semifinal`
  }
  
  if (roundLabel.includes('Final')) {
    return `Final`
  }
  
  return roundLabel
}
