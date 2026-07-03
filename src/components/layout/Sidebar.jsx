import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '../ui/button'
import { slideInLeft, springTransition, transition } from '../../lib/motion'
import { cn } from '../../lib/utils'

const Sidebar = memo(function Sidebar({
  brand,
  navigationItems = [],
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapse,
  logoIcon: LogoIcon = BarChart3,
  collapseLabel,
  expandLabel,
  closeLabel,
}) {
  return (
    <>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="sidebar-overlay"
            className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onClick={onCloseMobile}
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        variants={slideInLeft}
        initial="initial"
        animate="animate"
        transition={springTransition}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-200/60 md:sticky md:top-0 md:h-screen md:translate-x-0',
          collapsed ? 'md:w-20' : 'md:w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'w-72',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm">
              <LogoIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <AnimatePresence initial={false}>
              {!collapsed ? (
                <motion.div
                  key="brand-text"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={transition}
                  className="min-w-0"
                >
                  <p className="text-sm font-semibold text-slate-900">{brand?.name}</p>
                  <p className="text-xs text-slate-500">{brand?.subtitle}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onCloseMobile}
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-5" aria-label="Dashboard sections">
          {navigationItems.map((item, index) => (
            <motion.button
              key={item.label}
              type="button"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...transition, delay: index * 0.05 }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-600 transition-colors duration-200 hover:bg-cyan-50 hover:text-cyan-700',
                item.active && 'bg-cyan-50 text-cyan-700 shadow-sm',
                collapsed && 'md:justify-center md:px-0',
              )}
              onClick={item.onClick}
            >
              {item.icon ? <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" /> : null}
              <AnimatePresence initial={false}>
                {!collapsed ? (
                  <motion.span
                    key={`${item.label}-label`}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={transition}
                    className="overflow-hidden font-medium"
                  >
                    {item.label}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Button
            type="button"
            variant="outline"
            className="hidden w-full md:inline-flex"
            onClick={onToggleCollapse}
            aria-label={collapsed ? expandLabel : collapseLabel}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className={cn(collapsed && 'md:hidden')}>{collapseLabel}</span>
          </Button>
        </div>
      </motion.aside>
    </>
  )
})

export { Sidebar }
