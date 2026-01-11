export interface Numbers {
  numbers: number[]
}

export interface Stats {
  total_draws: number
  total_picks: number
  coverage_pct: number
  freq: number[]
  min_sum: number
  max_sum: number
  avg_sum: number
  most_frequent: [number, number][]
  least_frequent: [number, number][]
}

export interface Draw {
  id: number
  numbers: number[]
  key: string
  created_at: string
  source?: string
}

export interface Pick {
  id: number
  numbers: number[]
  key: string
  strategy: string
  created_at: string
}

export type Strategy = 'random' | 'hot' | 'cold' | 'balanced' | 'combo_based'

export interface GenerateRequest {
  strategy: Strategy
  count: number
}

export interface UploadResponse {
  success: boolean
  total_processed: number
  new_draws: number
  duplicates: number
  message: string
}

export interface SyncLottoResponse {
  success: boolean
  new_draws: number
  latest_draw_date?: string
  message: string
  error?: string
}

export interface ManualDrawRequest {
  draws: {
    numbers: number[]
    date?: string
  }[]
}

export interface BackupResponse {
  success: boolean
  count: number
  message: string
  error?: string
}

export interface ValidateResponse {
  numbers: number[]
  key: string
  exists_in_history: boolean
  exists_in_picks: boolean
  is_unique: boolean
}

export interface PairTripleStats {
  pairs: { numbers: number[]; count: number }[]
  triples: { numbers: number[]; count: number }[]
}
