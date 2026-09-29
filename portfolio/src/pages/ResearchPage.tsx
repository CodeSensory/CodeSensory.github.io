import { pageCopy } from '../content/pageCopy'
import { getFeaturedResearchItems } from '../content/researchCatalog'
import { PageHeading } from '../components/layout/PageHeading'
import { SECTION_SHELL } from '../components/layout/sectionShell'
import { FeaturedResearch } from '../components/research/FeaturedResearch'
import { TEXT_KO_BODY } from '../styles/textClasses'

export function ResearchPage() {
  const { research } = pageCopy
  const featured = getFeaturedResearchItems()

  return (
    <>
      <PageHeading title={research.title} lead={research.lead} />
      <div className={`${SECTION_SHELL} pt-0`}>
        <FeaturedResearch items={featured} />
        <h2 className="mt-16 font-sans text-sm uppercase tracking-[0.1em] text-ink">
          {research.methodsTitle}
        </h2>
        <ol className="mt-6 space-y-5">
          {research.howIResearch.map((step, stepIndex) => (
            <li key={step.slice(0, 16)} className="flex gap-4">
              <span className="shrink-0 font-sans text-xs uppercase tracking-widest text-ink/45">
                {String(stepIndex + 1).padStart(2, '0')}
              </span>
              <p className={`min-w-0 flex-1 ${TEXT_KO_BODY}`}>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}
