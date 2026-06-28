import { api } from './client'
import type {
  Match,
  GroupStanding,
  GroupStandingsResponse,
  GenerateKnockoutResponse,
} from '@/lib/types'
import { APP_CONFIG } from '@/lib/constants'
import { MOCK_STANDINGS, MOCK_MATCHES } from '@/lib/mock-data'

export const groupService = {
  /**
   * Obter classificação dos grupos em tempo real
   */
  async getGroupStandingsRealTime(): Promise<GroupStandingsResponse> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return Promise.resolve({
        standings: MOCK_STANDINGS,
        message: 'Group standings (MOCK DATA)',
      })
    }
    const { data } = await api.get<GroupStandingsResponse>('/matches/standings/groups')
    return data
  },

  /**
   * Obter jogos da fase de grupos
   */
  async getGroupStageMatches(): Promise<Match[]> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return Promise.resolve(MOCK_MATCHES.filter(m => m.stage === 'group_stage'))
    }
    // API v3 usa snake_case para stages
    const { data } = await api.get<Match[]>('/matches/stage/group_stage')
    return data
  },

  /**
   * Admin: Definir placar manual
   */
  async setManualScore(
    matchId: string,
    homeScore: number,
    awayScore: number
  ): Promise<Match> {
    const { data } = await api.patch<Match>(`/matches/${matchId}/manual-score`, {
      manualHomeScore: homeScore,
      manualAwayScore: awayScore,
      useManualScore: true,
    })
    return data
  },

  /**
   * Admin: Remover placar manual
   */
  async removeManualScore(matchId: string): Promise<Match> {
    const { data } = await api.delete<Match>(`/matches/${matchId}/manual-score`)
    return data
  },

  /**
   * Admin: Gerar oitavas de final
   */
  async generateKnockout(): Promise<GenerateKnockoutResponse> {
    const { data } = await api.post<GenerateKnockoutResponse>('/matches/generate-knockout')
    return data
  },
}
