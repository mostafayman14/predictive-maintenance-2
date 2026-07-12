import { lazy, memo, Suspense, useMemo } from 'react'
import { motion } from 'framer-motion'

import { ApiStatePanel } from '../components/dashboard/ApiStatePanel'
import { HeroBanner } from '../components/dashboard/sections/HeroBanner'
import { PredictionSection } from '../components/dashboard/sections/PredictionSection'
import { ChartSkeleton } from '../components/common/ChartSkeleton'
import { staggerContainer, staggerItem } from '../lib/motion'

const LiveChartsSection = lazy(() =>
  import('../components/dashboard/LiveChartsSection').then((module) => ({
    default: module.LiveChartsSection,
  })),
)

const DashboardPage = memo(function DashboardPage({
  data,
  apiState,
  connectionStatus,
  chartsLoading = false,
}) {
  const exportCondition = useMemo(
    () => ({
      detectedCondition: data.detectedCondition,
      diagnosis: data.prediction?.prediction ?? data.fault?.fault ?? null,
      recommendedAction:
        data.prediction?.description ?? data.recommendations?.[0]?.content ?? null,
      recommendations: data.recommendations,
    }),
    [
      data.detectedCondition,
      data.prediction,
      data.fault,
      data.recommendations,
    ],
  )

  return (
    <motion.main
      className="space-y-6 p-4 sm:p-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      id="main-content"
      tabIndex={-1}
    >
      {apiState ? (
        <motion.div variants={staggerItem}>
          <ApiStatePanel
            isLoading={apiState.isLoading}
            isRetrying={apiState.isRetrying}
            errors={apiState.errors}
            onRetry={apiState.retryAll}
            loadingLabel={data.apiLabels.loading}
            errorTitle={data.apiLabels.errorTitle}
            retryLabel={data.apiLabels.retry}
          />
        </motion.div>
      ) : null}

      <HeroBanner
        hero={data.hero}
        liveLabels={data.liveLabels}
        lastUpdate={data.lastUpdate}
      />

      <motion.div variants={staggerItem}>
        <Suspense
          fallback={
            <div className="grid gap-4 xl:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          }
        >
          <LiveChartsSection
            section={data.sections.charts}
            charts={data.charts}
            sensors={data.sensors}
            connectionStatus={connectionStatus}
            isLoading={chartsLoading}
            exportCondition={exportCondition}
          />
        </Suspense>
      </motion.div>

      <motion.div variants={staggerItem}>
        <PredictionSection
          section={data.sections.prediction}
          prediction={data.prediction}
          fault={data.fault}
          recommendationPanel={data.recommendationPanel}
          recommendations={data.recommendations}
        />
      </motion.div>
    </motion.main>
  )
})

export default DashboardPage
