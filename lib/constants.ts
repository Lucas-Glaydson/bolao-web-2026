export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  TIMEOUT: 15000,
}

export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Bet Glaydson',
  THEME: process.env.NEXT_PUBLIC_APP_THEME || 'dark',
  PRIMARY_COLOR: process.env.NEXT_PUBLIC_APP_PRIMARY_COLOR || 'green',
  ENABLE_ONBOARDING: process.env.NEXT_PUBLIC_ENABLE_ONBOARDING === 'true',
  DEADLINE_HOURS: parseInt(process.env.NEXT_PUBLIC_DEADLINE_HOURS || '1'),
  USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@BetGlaydson:token',
  USER_DATA: '@BetGlaydson:user',
  ONBOARDING_COMPLETED: '@BetGlaydson:onboarding',
}

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    GROUPS: '/groups',
    STANDINGS: '/standings',
    PREDICTIONS: '/predictions',
    ALL_PREDICTIONS: '/predictions/all',
    RANKING: '/ranking',
    BRACKET: '/bracket',
    STATISTICS: '/statistics',
    ANALYSIS: '/analysis',
    PROFILE: '/profile',
  },
}

export const STAGE_LABELS: Record<string, string> = {
  group_stage: 'Fase de Grupos',
  round_of_32: '16 Avos de Final',
  round_of_16: 'Oitavas de Final',
  quarter_finals: 'Quartas de Final',
  semi_finals: 'Semifinal',
  final: 'Final',
  // Legado (manter para compatibilidade)
  GROUP_STAGE: 'Fase de Grupos',
  ROUND_OF_16: 'Oitavas de Final',
  ROUND_OF_8: 'Oitavas de Final',
  ROUND_OF_4: 'Quartas de Final',
  SEMI_FINAL: 'Semifinal',
  FINAL: 'Final',
}

export const GROUP_LABELS: Record<string, string> = {
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

export const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  live: 'Ao Vivo',
  finished: 'Finalizado',
  postponed: 'Adiado',
  cancelled: 'Cancelado',
  // Legado (manter para compatibilidade)
  SCHEDULED: 'Agendado',
  IN_PLAY: 'Ao Vivo',
  FINISHED: 'Finalizado',
  POSTPONED: 'Adiado',
  CANCELLED: 'Cancelado',
}

export const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-slate-700 text-slate-300 border-slate-600',
  live: 'bg-red-600 text-white border-red-500 animate-pulse',
  finished: 'bg-green-700 text-green-100 border-green-600',
  postponed: 'bg-yellow-700 text-yellow-100 border-yellow-600',
  cancelled: 'bg-gray-600 text-gray-300 border-gray-500',
  // Legado
  SCHEDULED: 'bg-slate-700 text-slate-300 border-slate-600',
  IN_PLAY: 'bg-red-600 text-white border-red-500 animate-pulse',
  FINISHED: 'bg-green-700 text-green-100 border-green-600',
  POSTPONED: 'bg-yellow-700 text-yellow-100 border-yellow-600',
  CANCELLED: 'bg-gray-600 text-gray-300 border-gray-500',
}
