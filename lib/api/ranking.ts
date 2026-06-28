import { api } from './client'
import type { RankingEntry, Scoreboard } from '@/lib/types'
import { APP_CONFIG } from '@/lib/constants'
import { MOCK_RANKING } from '@/lib/mock-data'

export const rankingService = {
  async getRanking(): Promise<RankingEntry[]> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return Promise.resolve(MOCK_RANKING)
    }
    const { data } = await api.get<RankingEntry[] | Scoreboard>('/ranking')
    // Handle both array and Scoreboard object responses
    if (Array.isArray(data)) return data
    return (data as Scoreboard).ranking ?? []
  },

  async getScoreboard(): Promise<Scoreboard> {
    const { data } = await api.get<Scoreboard>('/ranking/scoreboard')
    return data
  },

  /**
   * Admin: Recalcular pontos de todos os palpites
   */
  async recalculatePoints(): Promise<{ message: string; recalculated: number }> {
    const { data } = await api.post<{ message: string; recalculated: number }>('/ranking/recalculate')
    return data
  },
}
