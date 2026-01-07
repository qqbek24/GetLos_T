import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  // Upload CSV
  async uploadCSV(file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Get statistics
  async getStats() {
    const response = await apiClient.get('/stats')
    return response.data
  },

  // Generate picks
  async generatePicks(strategy = 'random', count = 1) {
    const response = await apiClient.post('/generate', {
      strategy,
      count
    })
    return response.data
  },

  // Get all picks
  async getPicks(limit = 50) {
    const response = await apiClient.get(`/picks?limit=${limit}`)
    return response.data
  },

  // Get all draws
  async getDraws(limit = 100) {
    const response = await apiClient.get(`/draws?limit=${limit}`)
    return response.data
  },

  // Delete pick
  async deletePick(pickId) {
    const response = await apiClient.delete(`/picks/${pickId}`)
    return response.data
  },

  // Validate numbers
  async validateNumbers(numbers) {
    const response = await apiClient.post('/validate', { numbers })
    return response.data
  },

  // Get pair/triple stats
  async getPairTripleStats(limit = 20) {
    const response = await apiClient.get(`/pairtriple-stats?limit=${limit}`)
    return response.data
  },

  // Clear all draws
  async clearAllDraws() {
    const response = await apiClient.delete('/draws/all')
    return response.data
  },

  // Clear all picks
  async clearAllPicks() {
    const response = await apiClient.delete('/picks/all')
    return response.data
  }
}
