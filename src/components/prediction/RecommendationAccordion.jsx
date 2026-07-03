import { motion } from 'framer-motion'

import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AnimatedCard } from '../ui/animated-card'
import { staggerContainer, staggerItem, transition } from '../../lib/motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'

function RecommendationAccordion({ title, description, items = [], defaultValue, delay = 0 }) {
  return (
    <AnimatedCard delay={delay}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={defaultValue}>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {items.map((item, index) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                transition={transition}
                whileHover={{ x: 2 }}
              >
                <AccordionItem value={item.value ?? `item-${index}`}>
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </motion.div>
        </Accordion>
      </CardContent>
    </AnimatedCard>
  )
}

export { RecommendationAccordion }
