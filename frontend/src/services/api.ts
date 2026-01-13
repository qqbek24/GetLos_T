import axios from 'axios'
import type {
  Stats,
  Pick,
  GenerateRequest,
  UploadResponse,
  SyncLottoResponse,
  ManualDrawRequest,
  BackupResponse,
  ValidateResponse,
  PairTripleStats,
  PaginatedPicksResponse,
  PaginatedDrawsResponse,
  IntegrityReport,
  IntegrityFixResponse,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Upload CSV
  async uploadCSV(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<UploadResponse>('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get statistics
  async getStats(): Promise<Stats> {
    const response = await apiClient.get<Stats>('/stats')
    return response.data
  },

  // Generate picks
  async generatePicks(request: GenerateRequest): Promise<Pick[]> {
    const response = await apiClient.post<Pick[]>('/generate', request)
    return response.data
  },

  // Add custom pick
  async addCustomPick(numbers: number[]): Promise<Pick> {
    const response = await apiClient.post<Pick>('/add-pick', { numbers })
    return response.data
  },

  // Get all picks
  async getPicks(limit: number = 50, offset: number = 0): Promise<PaginatedPicksResponse> {
    const response = await apiClient.get<PaginatedPicksResponse>(`/picks?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // Get all draws
  async getDraws(limit: number = 50, offset: number = 0): Promise<PaginatedDrawsResponse> {
    const response = await apiClient.get<PaginatedDrawsResponse>(`/draws?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // Delete pick
  async deletePick(pickId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/picks/${pickId}`)
    return response.data
  },

  // Delete draw
  async deleteDraw(drawId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/draws/${drawId}`)
    return response.data
  },

  // Delete multiple picks
  async deletePicksBatch(ids: number[]): Promise<{ success: boolean; deleted: number }> {
    const response = await apiClient.delete('/picks/batch', {
      data: { ids }
    })
    return response.data
  },

  // Delete multiple draws
  async deleteDrawsBatch(ids: number[]): Promise<{ success: boolean; deleted: number }> {
    const response = await apiClient.delete('/draws/batch', {
      data: { ids }
    })
    return response.data
  },

  // Validate numbers
  async validateNumbers(numbers: number[]): Promise<ValidateResponse> {
    const response = await apiClient.post<ValidateResponse>('/validate', { numbers })
    return response.data
  },

  // Get pair/triple stats
  async getPairTripleStats(limit: number = 20): Promise<PairTripleStats> {
    const response = await apiClient.get<PairTripleStats>(`/pairtriple-stats?limit=${limit}`)
    return response.data
  },

  // Clear all draws
  async clearAllDraws(): Promise<{ success: boolean; deleted: number }> {
    const response = await apiClient.delete('/draws/all')
    return response.data
  },

  // Clear all picks
  async clearAllPicks(): Promise<{ success: boolean; deleted: number }> {
    const response = await apiClient.delete('/picks/all')
    return response.data
  },

  // Sync with Lotto.pl API
  async syncLottoResults(): Promise<SyncLottoResponse> {
    const response = await apiClient.post<SyncLottoResponse>('/sync-lotto')
    return response.data
  },

  // Manually add draw(s)
  async addManualDraw(request: ManualDrawRequest): Promise<UploadResponse> {
    const response = await apiClient.post<UploadResponse>('/manual-draw', request)
    return response.data
  },

  // Export draws to JSON
  async exportDraws(): Promise<any> {
    const response = await apiClient.get('/export-draws')
    return response.data
  },

  // Import draws from JSON
  async importDraws(data: any): Promise<BackupResponse> {
    const response = await apiClient.post<BackupResponse>('/import-draws', data)
    return response.data
  },

  // Verify data integrity
  async verifyIntegrity(): Promise<IntegrityReport> {
    const response = await apiClient.get<IntegrityReport>('/verify-integrity')
    return response.data
  },

  // Fix data integrity issues
  async fixIntegrity(): Promise<IntegrityFixResponse> {
    const response = await apiClient.post<IntegrityFixResponse>('/fix-integrity')
    return response.data
  },

  // Check missing dates against API
  async checkMissingDates(dates: string[]): Promise<{
    success: boolean
    total_checked: number
    results: Array<{
      date: string
      exists_in_db: boolean
      exists_in_api: boolean
      should_add: boolean
      api_numbers?: number[]
      api_draw_id?: number
      weekday?: string
      error?: string
    }>
  }> {
    const response = await apiClient.post('/check-missing-dates', dates)
    return response.data
  },
}
