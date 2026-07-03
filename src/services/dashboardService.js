import { apiClient } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'

async function unwrap(request) {
  const response = await request
  return response.data
}

export const dashboardService = {
  getStatus() {
    return unwrap(apiClient.get(API_ENDPOINTS.status))
  },

  getHistory() {
    return unwrap(apiClient.get(API_ENDPOINTS.history))
  },

  getRecommendations() {
    return unwrap(apiClient.get(API_ENDPOINTS.recommendations))
  },

  getSystemInfo() {
    return unwrap(apiClient.get(API_ENDPOINTS.systemInfo))
  },
}
