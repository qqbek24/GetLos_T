import axios from 'axios'
import type {
  Stats,
  Pick,
  Draw,
  GenerateRequest,
  UploadResponse,
  ValidateResponse,
  PairTripleStats,
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

  // Get all picks
  async getPicks(limit: number = 50, offset: number = 0): Promise<Pick[]> {
    const response = await apiClient.get<Pick[]>(`/picks?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // Get all draws
  async getDraws(limit: number = 50, offset: number = 0): Promise<Draw[]> {
    const response = await apiClient.get<Draw[]>(`/draws?limit=${limit}&offset=${offset}`)
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
}
