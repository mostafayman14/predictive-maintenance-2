import { useMemo } from 'react'

import { dashboardUiConfig } from '../data/dashboardUiConfig'
import { buildDashboardData, getPayload } from '../services/dashboardNormalizer'
import { useChartData } from './useChartData'
import { useDashboardApi } from './useDashboardApi'
import { useLiveData } from './useLiveData'

function useDashboardData(fallbackData = dashboardUiConfig) {
  const api = useDashboardApi()
  const live = useLiveData()
  const chartData = useChartData()

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
        historyPayload: {},
        recommendationsPayload: getPayload(api.recommendations.data),
        systemInfoPayload: getPayload(api.systemInfo.data),
        livePatch: live.livePatch,
        liveConnection: live.connection,
        liveLastUpdate: live.lastUpdate,
        chartSeries: chartData.charts,
        chartLastUpdate: chartData.lastUpdate,
      }),
    [
      fallbackData,
      api.status.data,
      api.recommendations.data,
      api.systemInfo.data,
      live.livePatch,
      live.connection,
      live.lastUpdate,
      chartData.charts,
      chartData.lastUpdate,
    ],
  )

  const data = useMemo(
    () => ({
      ...staticLabels,
      ...metrics,
    }),
    [staticLabels, metrics],
  )

  const apiState = useMemo(() => {
    const errors = [...api.errors]
    if (chartData.historyError) {
      errors.push({ key: 'history', message: chartData.historyError })
    }

    return {
      ...api,
      isLoading: api.isLoading || chartData.isHistoryLoading,
      errors,
      hasError: errors.length > 0,
      retryAll: async () => {
        await Promise.all([api.retryAll(), chartData.retryHistory()])
      },
    }
  }, [api, chartData.historyError, chartData.isHistoryLoading, chartData.retryHistory])

  return {
    data,
    api: apiState,
    live,
    chartData,
    isOnline: live.connectionStatus === 'connected',
  }
}

export { useDashboardData }
