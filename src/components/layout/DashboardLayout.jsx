import { memo } from 'react'
import { motion } from 'framer-motion'

import { fadeInUp, transition } from '../../lib/motion'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

const DashboardLayout = memo(function DashboardLayout({
  children,
  sidebar,
  navbar,
  sidebarCollapsed,
  mobileSidebarOpen,
  onCloseMobileSidebar,
  onToggleSidebar,
  onOpenMobileSidebar,
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a href="#main-content" className="skip-link">
        Skip to dashboard content
      </a>

      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        {/* <Sidebar
          {...sidebar}
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={onCloseMobileSidebar}
          onToggleCollapse={onToggleSidebar}
        /> */}

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar {...navbar} onOpenSidebar={onOpenMobileSidebar} />
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...transition, delay: 0.08 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
})

export { DashboardLayout }
