import { lazy, Suspense, useCallback, useMemo, useState } from 'react'

import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardSkeleton } from './components/common/DashboardSkeleton'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { OfflineBanner } from './components/common/OfflineBanner'
import { navigationIcons } from './constants/dashboardIcons'
import { dashboardMockData } from './data/mockDashboardData'
import { useDashboardData } from './hooks/useDashboardData'
import { useOnlineStatus } from './hooks/useOnlineStatus'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { data, api } = useDashboardData(dashboardMockData)
  const isOnline = useOnlineStatus()

  const navigationItems = useMemo(
    () =>
      data.navigation.map((item, index) => ({
        ...item,
        icon: navigationIcons[index],
      })),
    [data.navigation],
  )

  const labels = data.layoutLabels

  const handleCloseMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false)
  }, [])

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((value) => !value)
  }, [])

  const handleOpenMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(true)
  }, [])

  return (
    <>
      {!isOnline ? (
        <OfflineBanner
          title={data.offlineLabels?.title ?? 'You are offline'}
          description={
            data.offlineLabels?.description ??
            'Network connection lost. Cached dashboard data is shown until connectivity returns.'
          }
        />
      ) : null}

      <DashboardLayout
        sidebar={{
          brand: data.brand,
          navigationItems,
          collapseLabel: labels.collapseSidebar,
          expandLabel: labels.expandSidebar,
          closeLabel: labels.closeSidebar,
        }}
        navbar={{
          ...data.navbar,
          connection: data.connection,
          menuLabel: labels.openSidebar,
          timeLabel: labels.currentTime,
        }}
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        onCloseMobileSidebar={handleCloseMobileSidebar}
        onToggleSidebar={handleToggleSidebar}
        onOpenMobileSidebar={handleOpenMobileSidebar}
      >
        <ErrorBoundary
          title="Dashboard unavailable"
          description="The monitoring dashboard failed to render. Retry or refresh the application."
        >
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPage data={data} apiState={api} />
          </Suspense>
        </ErrorBoundary>
      </DashboardLayout>
    </>
  )
}

export default App
