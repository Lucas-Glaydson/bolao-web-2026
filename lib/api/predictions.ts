import { api } from './client'
import type {
  Prediction,
  PredictionWithDetails,
  BoardPrediction,
  CreatePredictionDto,
} from '@/lib/types'
import { APP_CONFIG } from '@/lib/constants'
import { MOCK_MY_PREDICTIONS } from '@/lib/mock-data'

export const predictionService = {
  async createOrUpdatePrediction(matchId: string, data: CreatePredictionDto): Promise<Prediction> {
    // API v3 espera predictedHomeScore e predictedAwayScore
    const payload: Record<string, unknown> = {
      predictedHomeScore: data.homeScore,
      predictedAwayScore: data.awayScore,
    }
    if (data.tiebreakWinner !== undefined) {
      payload.tiebreakWinner = data.tiebreakWinner
    }
    const { data: prediction } = await api.put<Prediction>(`/predictions/${matchId}`, payload)
    return prediction
  },

  async getMyPredictions(): Promise<PredictionWithDetails[]> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return Promise.resolve(MOCK_MY_PREDICTIONS as any)
    }
    const { data } = await api.get<PredictionWithDetails[]>('/predictions/me')
    return data
  },

  async getPredictionsByMatch(matchId: string): Promise<PredictionWithDetails[]> {
    const { data } = await api.get<PredictionWithDetails[]>(`/predictions/match/${matchId}`)
    return data
  },

  async getAllPredictionsBoard(): Promise<BoardPrediction[]> {
    const { data } = await api.get<any>('/predictions/board')
    const raw: any[] = Array.isArray(data)
      ? data
      : ((data as any).board ?? (data as any).matches ?? (data as any).predictions ?? (data as any).data ?? [])

    if (raw.length === 0) return []

    // Flat array: each item is a prediction with matchId (not a grouped board entry)
    if ('matchId' in raw[0] && !('predictions' in raw[0])) {
      const grouped: Record<string, BoardPrediction> = {}
      raw.forEach((pred: any) => {
        if (!pred.matchId) return
        if (!grouped[pred.matchId]) {
          grouped[pred.matchId] = { matchId: pred.matchId, match: pred.match ?? ({} as any), predictions: [] }
        }
        grouped[pred.matchId].predictions.push(pred as PredictionWithUser)
      })
      return Object.values(grouped)
    }

    return raw as BoardPrediction[]
  },
}
