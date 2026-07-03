import axios from 'axios'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 600

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function shouldRetry(error) {
  const method = error.config?.method?.toLowerCase()
  const status = error.response?.status

  return method === 'get' && (!status || status >= 500 || status === 429)
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config ?? {}
    config.retryCount = config.retryCount ?? 0

    if (config.retryCount < MAX_RETRIES && shouldRetry(error)) {
      config.retryCount += 1
      await delay(RETRY_DELAY_MS * config.retryCount)
      return apiClient(config)
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.response?.data?.detail) {
    return typeof error.response.data.detail === 'string'
      ? error.response.data.detail
      : 'Backend returned a validation error.'
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please retry.'
  }

  if (!error.response) {
    return 'Unable to reach the backend service.'
  }

  return 'Unexpected API error.'
}
