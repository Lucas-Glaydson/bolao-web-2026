import { api } from './client'
import type { Match, MatchStage, UpcomingMatch } from '@/lib/types'
import { APP_CONFIG } from '@/lib/constants'
import { MOCK_MATCHES } from '@/lib/mock-data'

export const matchService = {
  async getAllMatches(): Promise<Match[]> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return Promise.resolve(MOCK_MATCHES)
    }
    const { data } = await api.get<Match[]>('/matches')
    return data
  },

  async getMatchById(id: string): Promise<Match> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const match = MOCK_MATCHES.find(m => m._id === id)
      if (!match) throw new Error('Match not found')
      return Promise.resolve(match)
    }
    const { data } = await api.get<Match>(`/matches/${id}`)
    return data
  },

  async getMatchesByStage(stage: MatchStage): Promise<Match[]> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return Promise.resolve(MOCK_MATCHES.filter(m => m.stage === stage))
    }
    const { data } = await api.get<Match[]>(`/matches/stage/${stage}`)
    return data
  },

  async getUpcomingMatches(): Promise<UpcomingMatch[]> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const upcoming = MOCK_MATCHES
        .filter(m => m.status === 'scheduled')
        .map(m => ({
          ...m,
          deadline: m.kickoffAt,
          canPredict: true,
        }))
      return Promise.resolve(upcoming)
    }
    const { data } = await api.get<UpcomingMatch[]>('/matches/upcoming/deadlines')
    return data
  },

  /**
   * Admin: Sincronizar jogos com API externa
   */
  async syncMatches(): Promise<{ synced: number; message: string }> {
    const { data } = await api.post<{ synced: number; message: string }>('/matches/sync')
    return data
  },
}
