const industrialEase = [0.22, 1, 0.36, 1]

const transition = {
  duration: 0.35,
  ease: industrialEase,
}

const springTransition = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
}

const fadeInUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const slideInLeft = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
}

const slideInDown = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

const cardHover = {
  y: -3,
  transition: { duration: 0.2, ease: industrialEase },
}

const valueChange = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

export {
  cardHover,
  fadeIn,
  fadeInUp,
  industrialEase,
  scaleIn,
  slideInDown,
  slideInLeft,
  springTransition,
  staggerContainer,
  staggerItem,
  transition,
  valueChange,
}
