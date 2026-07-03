import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'
import { DashboardSkeleton } from './components/common/DashboardSkeleton.jsx'
import { LiveDataProvider } from './context/LiveDataContext.jsx'
import { dashboardMockData } from './data/mockDashboardData.js'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary
      title="Application failed to start"
      description="The predictive maintenance dashboard encountered a critical error."
      retryLabel="Reload dashboard"
      onRetry={() => window.location.reload()}
    >
      <LiveDataProvider fallbackConnection={dashboardMockData.connection}>
        <Suspense fallback={<DashboardSkeleton />}>
          <App />
        </Suspense>
      </LiveDataProvider>
    </ErrorBoundary>
  </StrictMode>,
)
