import { Loader2, PlugZap } from 'lucide-react'
import { memo, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  CHART_WINDOW_HOURS,
  formatChartTime,
  getChartWindowDomain,
  normalizeChartDataset,
} from '../../lib/chartUtils'
import { formatSensorValue } from '../../lib/formatSensorValue'
import { fadeIn, transition } from '../../lib/motion'
import { CardContent, CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { AnimatedValue } from '../ui/animated-value'
import { Skeleton } from '../ui/skeleton'

function ChartTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0].payload

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-500">{formatChartTime(point.timestamp)}</p>
      <p className="text-sm font-semibold text-slate-900">
        {formatSensorValue(point.value, unit)}
      </p>
    </div>
  )
}

function getWaitingContent(connectionStatus) {
  switch (connectionStatus) {
    case 'connected':
      return {
        title: 'Waiting for sensor data',
        description: 'Live data connected. The chart will draw as readings arrive.',
        pulse: true,
      }
    case 'connecting':
      return {
        title: 'Connecting to live data',
        description: 'Requesting live readings from the motor.',
        pulse: true,
      }
    case 'reconnecting':
      return {
        title: 'Reconnecting to live data',
        description: 'Retrying the live data request.',
        pulse: true,
      }
    case 'error':
      return {
        title: 'Connection error',
        description: 'Could not reach the live data feed. Retrying automatically.',
        pulse: false,
      }
    default:
      return {
        title: 'Waiting for live connection',
        description: 'The chart will start drawing once live data starts arriving.',
        pulse: false,
      }
  }
}

function ChartWaitingState({ connectionStatus }) {
  const { title, description, pulse } = getWaitingContent(connectionStatus)
  const Icon = pulse ? Loader2 : PlugZap

  return (
    <motion.div
      key="chart-waiting"
      className="flex h-full items-center justify-center p-4"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
      >
        <div className="mb-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-700">
          <Icon className={`h-5 w-5 ${pulse ? 'animate-spin' : ''}`} aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p>
      </div>
    </motion.div>
  )
}

function ChartLoadingState() {
  return (
    <motion.div
      key="chart-loading"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      className="flex h-full flex-col justify-end gap-2 p-2"
      aria-busy="true"
      aria-label="Loading chart"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.3, scaleX: 0.6 }}
          animate={{ opacity: [0.35, 0.7, 0.35], scaleX: [0.6, 1, 0.6] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: index * 0.12,
            ease: 'easeInOut',
          }}
        >
          <Skeleton className="h-3 w-full" />
        </motion.div>
      ))}
    </motion.div>
  )
}

const LiveLineChart = memo(function LiveLineChart({
  title,
  unit,
  dataset,
  points,
  reading,
  color = '#0891b2',
  icon: Icon,
  windowSeconds,
  delay = 0,
  isLoading = false,
  connectionStatus = 'disconnected',
}) {
  const normalizedDataset = useMemo(
    () => normalizeChartDataset(dataset ?? points ?? []),
    [dataset, points],
  )

  const chartData = useMemo(
    () =>
      normalizedDataset.map((point) => ({
        ...point,
        timeLabel: formatChartTime(point.timestamp),
      })),
    [normalizedDataset],
  )

  const [windowStart, windowEnd] = useMemo(
    () => getChartWindowDomain(normalizedDataset),
    [normalizedDataset],
  )

  const currentValue = normalizedDataset.length
    ? normalizedDataset[normalizedDataset.length - 1].value
    : reading ?? null

  const isEmpty = !isLoading && chartData.length === 0

  const yDomain = useMemo(() => {
    if (!chartData.length) {
      return [0, 1]
    }

    const values = chartData.map((point) => point.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min || 1) * 0.15

    return [min - padding, max + padding]
  }, [chartData])

  const displayValue = formatSensorValue(currentValue, unit)

  return (
    <AnimatedCard delay={delay}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-2 text-cyan-700">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
          ) : null}
          <div>
            <CardTitle>{title}</CardTitle>
            <AnimatedValue
              value={displayValue}
              className="mt-2 font-mono text-2xl font-semibold tracking-tight text-cyan-700"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-60 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:h-64">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <ChartLoadingState />
            ) : isEmpty ? (
              <ChartWaitingState connectionStatus={connectionStatus} />
            ) : (
              <motion.div
                key="chart-ready"
                className="h-full w-full"
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transition}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.35)" vertical={false} />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      domain={[windowStart, windowEnd]}
                      allowDataOverflow
                      tickFormatter={formatChartTime}
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      minTickGap={24}
                    />
                    <YAxis
                      domain={yDomain}
                      stroke="#64748b"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      width={42}
                      tickFormatter={(value) => Number(value).toFixed(1)}
                    />
                    <Tooltip
                      content={<ChartTooltip unit={unit} />}
                      cursor={{ stroke: 'rgba(34, 211, 238, 0.25)', strokeWidth: 1 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                      activeDot={{
                        r: 4,
                        fill: color,
                        stroke: '#ffffff',
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.p
          className="mt-2 text-right text-xs text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...transition, delay: 0.15 }}
        >
          Last {windowSeconds ? `${windowSeconds}s` : `${CHART_WINDOW_HOURS}h`} · rolling window
        </motion.p>
      </CardContent>
    </AnimatedCard>
  )
})

export { LiveLineChart }
