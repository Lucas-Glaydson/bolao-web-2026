import { api } from './client'
import type { StageControl } from '@/lib/types'
import { APP_CONFIG } from '@/lib/constants'

const MOCK_STAGES: StageControl[] = [
  {
    id: 'stage-1',
    stage: 'group_stage',
    isOpen: true,
    allowPredictions: true,
    openedAt: new Date().toISOString(),
    closedAt: null,
    displayOrder: 0,
  },
  {
    id: 'stage-2',
    stage: 'round_of_16',
    isOpen: false,
    allowPredictions: false,
    openedAt: null,
    closedAt: null,
    displayOrder: 1,
  },
  {
    id: 'stage-3',
    stage: 'quarter_finals',
    isOpen: false,
    allowPredictions: false,
    openedAt: null,
    closedAt: null,
    displayOrder: 2,
  },
  {
    id: 'stage-4',
    stage: 'semi_finals',
    isOpen: false,
    allowPredictions: false,
    openedAt: null,
    closedAt: null,
    displayOrder: 3,
  },
  {
    id: 'stage-5',
    stage: 'final',
    isOpen: false,
    allowPredictions: false,
    openedAt: null,
    closedAt: null,
    displayOrder: 4,
  },
]

export const stageService = {
  /**
   * Obter status de todas as fases
   */
  async getStages(): Promise<StageControl[]> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return Promise.resolve(MOCK_STAGES)
    }
    const { data } = await api.get<StageControl[]>('/stages')
    return data
  },

  /**
   * Verifica se uma fase está aberta para palpites
   */
  async isStageOpen(stage: string): Promise<boolean> {
    const stages = await this.getStages()
    const stageControl = stages.find(s => s.stage === stage)
    return stageControl?.allowPredictions ?? false
  },

  /**
   * Admin: Abrir fase para palpites
   */
  async openStage(stage: string): Promise<StageControl> {
    const { data } = await api.patch<StageControl>(`/stages/${stage}/open`)
    return data
  },

  /**
   * Admin: Fechar fase
   */
  async closeStage(stage: string): Promise<StageControl> {
    const { data } = await api.patch<StageControl>(`/stages/${stage}/close`)
    return data
  },
}
