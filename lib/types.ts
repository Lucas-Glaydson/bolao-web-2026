// User Types
export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

// Match Types
export type GroupLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'
export type MatchStage = 'group_stage' | 'round_of_32' | 'round_of_16' | 'quarter_finals' | 'semi_finals' | 'final'
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
export type MatchWinner = 'home' | 'away' | 'draw' | null

export interface Match {
  id: string
  externalId: string
  competition: string
  stage: MatchStage
  group?: GroupLabel
  round?: number
  roundLabel: string
  homeTeam: string
  homeTeamLogo?: string
  awayTeam: string
  awayTeamLogo?: string
  kickoffAt: string
  status: MatchStatus
  officialHomeScore: number | null
  officialAwayScore: number | null
  useManualScore: boolean
  manualHomeScore: number | null
  manualAwayScore: number | null
  winner: MatchWinner
  penaltyWinner: 'home' | 'away' | null
  canPredict: boolean
  syncedAt: string
  createdAt: string
  updatedAt: string
  
  // Campos de compatibilidade com código legado
  _id?: string
  date?: string
  teamA?: string
  teamB?: string
  homeScore?: number
  awayScore?: number
}

export interface TeamStanding {
  team: string
  teamLogo?: string
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface GroupStanding {
  group: GroupLabel
  teams: TeamStanding[]
  qualified: string[]
}

// Prediction Types
export interface CreatePredictionDto {
  homeScore: number
  awayScore: number
  tiebreakWinner?: 'home' | 'away'
}

// API v3 Response
export interface Prediction {
  id: string
  userId: string
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  tiebreakWinner: 'home' | 'away' | null
  lockedAt: string | null
  canEditUntil: string
  pointsAwarded: number | null
  exactScoreHit: boolean
  outcomeHit: boolean
  createdAt: string
  updatedAt: string
  
  // Campos de compatibilidade com código legado
  _id?: string
  homeScore?: number
  awayScore?: number
  points?: number | null
  isExactScore?: boolean
}

// Board público com dados do usuário
export interface PredictionWithUser {
  id: string
  userId: string
  userName: string
  userEmail: string
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  tiebreakWinner: 'home' | 'away' | null
  pointsAwarded: number | null
  exactScoreHit: boolean
  outcomeHit: boolean
  createdAt: string
}

export interface PredictionWithDetails extends Prediction {
  user: User
  match: Match
}

export interface BoardPrediction {
  matchId: string
  match: Match
  predictions: PredictionWithUser[]
}

// Ranking Types
export interface RankingEntry {
  position: number
  userId: string
  userName: string
  userEmail: string
  totalPoints: number
  exactScores: number
  outcomeHits: number
  totalPredictions: number
}

export interface Scoreboard {
  totalUsers: number
  ranking: RankingEntry[]
}

// Statistics Types
export interface DashboardStats {
  totalMatches: number
  finishedMatches: number
  scheduledMatches: number
  totalPredictions: number
  totalUsers: number
  topScorer: {
    user: User
    points: number
  } | null
  averagePointsPerUser: number
  mostPredictedMatch: {
    match: Match
    predictionsCount: number
  } | null
}

export interface UpcomingMatch extends Match {
  deadline: string
}

export interface GroupStandingsResponse {
  standings: GroupStanding[]
  message?: string
}

export interface GenerateKnockoutResponse {
  generated: number
  updated: number
  message: string
}

// Stage Control
export interface StageControl {
  id: string
  stage: MatchStage
  isOpen: boolean
  allowPredictions: boolean
  openedAt: string | null
  closedAt: string | null
  displayOrder: number
}

// Type aliases for API v3 compatibility
export type PredictionResponse = Prediction
export type StandingsResponse = GroupStandingsResponse
export type ScoreboardResponse = Scoreboard
