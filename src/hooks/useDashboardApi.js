import { useCallback, useMemo } from 'react'

import { dashboardService } from '../services/dashboardService'
import { useApiResource } from './useApiResource'

function useDashboardApi() {
  const status = useApiResource(useCallback(() => dashboardService.getStatus(), []))
  const history = useApiResource(useCallback(() => dashboardService.getHistory(), []))
  const recommendations = useApiResource(
    useCallback(() => dashboardService.getRecommendations(), []),
  )
  const systemInfo = useApiResource(useCallback(() => dashboardService.getSystemInfo(), []))

  const resources = useMemo(
    () => ({ status, history, recommendations, systemInfo }),
    [status, history, recommendations, systemInfo],
  )

  const isLoading = Object.values(resources).some((resource) => resource.isLoading)
  const isRetrying = Object.values(resources).some((resource) => resource.isRetrying)
  const errors = Object.entries(resources)
    .filter(([, resource]) => resource.error)
    .map(([key, resource]) => ({ key, message: resource.error }))

  return {
    ...resources,
    isLoading,
    isRetrying,
    errors,
    hasError: errors.length > 0,
    retryAll: () => Promise.all(Object.values(resources).map((resource) => resource.retry())),
  }
}

export { useDashboardApi }
