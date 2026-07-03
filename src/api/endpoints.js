export const API_ENDPOINTS = {
  status: '/status',
  history: '/history',
  recommendations: '/recommendations',
  systemInfo: '/system-info',
  live: '/live',
}

export function getWebSocketUrl() {
  const configured = import.meta.env.VITE_WS_BASE_URL

  if (configured) {
    return configured
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/api/v1${API_ENDPOINTS.live}`
}
