import { api } from './client'
import type { DashboardStats } from '@/lib/types'
import { APP_CONFIG } from '@/lib/constants'
import { MOCK_STATS } from '@/lib/mock-data'

export const statsService = {
  async getDashboard(): Promise<DashboardStats> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return Promise.resolve(MOCK_STATS)
    }
    const { data } = await api.get<DashboardStats>('/stats/dashboard')
    return data
  },
}
