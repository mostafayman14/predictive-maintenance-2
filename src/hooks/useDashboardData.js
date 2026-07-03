import { useMemo } from 'react'

import { dashboardMockData } from '../data/mockDashboardData'
import { buildDashboardData, getPayload } from '../services/dashboardNormalizer'
import { useDashboardApi } from './useDashboardApi'
import { useLiveData } from './useLiveData'

function useDashboardData(fallbackData = dashboardMockData) {
  const api = useDashboardApi()
  const live = useLiveData()

  const staticLabels = useMemo(
    () => ({
      brand: fallbackData.brand,
      navbar: fallbackData.navbar,
      layoutLabels: fallbackData.layoutLabels,
      apiLabels: fallbackData.apiLabels,
      liveLabels: fallbackData.liveLabels,
      hero: fallbackData.hero,
      sections: fallbackData.sections,
      navigation: fallbackData.navigation,
      recommendationPanel: fallbackData.recommendationPanel,
      connectionCard: fallbackData.connectionCard,
      systemInfoCard: fallbackData.systemInfoCard,
    }),
    [fallbackData],
  )

  const metrics = useMemo(
    () =>
      buildDashboardData({
        fallbackData,
        statusPayload: getPayload(api.status.data),
        historyPayload: getPayload(api.history.data),
        recommendationsPayload: getPayload(api.recommendations.data),
        systemInfoPayload: getPayload(api.systemInfo.data),
        livePatch: live.livePatch,
        liveConnection: live.connection,
        liveLastUpdate: live.lastUpdate,
      }),
    [
      fallbackData,
      api.status.data,
      api.history.data,
      api.recommendations.data,
      api.systemInfo.data,
      live.livePatch,
      live.connection,
      live.lastUpdate,
    ],
  )

  const data = useMemo(
    () => ({
      ...staticLabels,
      ...metrics,
    }),
    [staticLabels, metrics],
  )

  return {
    data,
    api,
    live,
    isOnline: live.connectionStatus === 'connected',
  }
}

export { useDashboardData }
