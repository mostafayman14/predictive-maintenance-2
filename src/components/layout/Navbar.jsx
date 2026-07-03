import { Cpu, Menu } from 'lucide-react'
import { memo } from 'react'
import { motion } from 'framer-motion'

import { StatusBadge } from '../cards/StatusBadge'
import { Button } from '../ui/button'
import { useClock } from '../../hooks/useClock'
import { slideInDown, transition } from '../../lib/motion'

const Navbar = memo(function Navbar({
  eyebrow,
  title,
  connection,
  logoIcon: LogoIcon = Cpu,
  onOpenSidebar,
  menuLabel,
  timeLabel,
}) {
  const currentTime = useClock()

  return (
    <motion.header
      variants={slideInDown}
      initial="initial"
      animate="animate"
      transition={transition}
      className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onOpenSidebar}
            aria-label={menuLabel}
          >
            <Menu className="h-5 w-5" />
          </Button> */}

          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-100"
          >
            <LogoIcon className="h-6 w-6" aria-hidden="true" />
          </motion.div>

          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-700">{eyebrow}</p>
            <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-2xl">{title}</h1>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <motion.div
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{timeLabel}</p>
            <time className="font-mono text-sm text-slate-700" aria-live="off">
              {currentTime}
            </time>
          </motion.div>

          <StatusBadge
            label={connection?.label}
            variant={connection?.variant}
            icon={connection?.icon}
            pulse
          />
        </div>
      </div>
    </motion.header>
  )
})

export { Navbar }
