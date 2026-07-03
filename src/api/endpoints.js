export const API_ENDPOINTS = {
  status: '/status',
  history: '/history',
  recommendations: '/recommendations',
  systemInfo: '/system-info',
  live: '/live',
}

const DEFAULT_LIVE_POLL_INTERVAL_MS = 1000

export function getLivePollInterval() {
  const configured = Number(import.meta.env.VITE_LIVE_POLL_INTERVAL)

  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_LIVE_POLL_INTERVAL_MS
}
