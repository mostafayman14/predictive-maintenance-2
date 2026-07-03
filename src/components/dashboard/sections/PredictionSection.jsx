import { memo } from 'react'
import { ListChecks } from 'lucide-react'

import { SectionHeader } from '../../common/SectionHeader'
import { EmptyState } from '../../common/EmptyState'
import { FaultCard } from '../../prediction/FaultCard'
import { PredictionCard } from '../../prediction/PredictionCard'
import { RecommendationAccordion } from '../../prediction/RecommendationAccordion'

const PredictionSection = memo(function PredictionSection({
  section,
  prediction,
  fault,
  recommendationPanel,
  recommendations,
}) {
  const hasRecommendations = recommendations?.length > 0

  return (
    <section aria-labelledby="prediction-section-title">
      <SectionHeader {...section} />
      <h2 id="prediction-section-title" className="sr-only">
        {section.title}
      </h2>
      <div className="grid gap-4 xl:grid-cols-3">
        <PredictionCard {...prediction} delay={0.05} />
        <FaultCard {...fault} delay={0.1} />
        <div className="xl:row-span-2">
          {hasRecommendations ? (
            <RecommendationAccordion
              {...recommendationPanel}
              items={recommendations}
              delay={0.15}
            />
          ) : (
            <EmptyState
              icon={ListChecks}
              title="No recommendations yet"
              description="Maintenance guidance will appear here when the diagnostic engine produces results."
            />
          )}
        </div>
      </div>
    </section>
  )
})

export { PredictionSection }
