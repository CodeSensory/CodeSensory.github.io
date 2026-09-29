import {
  getFeaturedResearchItems,
  researchItems,
} from '../../content/researchCatalog'
import { SECTION_SHELL } from '../layout/sectionShell'
import { FeaturedResearch } from './FeaturedResearch'
import { PublicationList } from './PublicationList'

const featuredResearch = getFeaturedResearchItems()
const otherResearch = researchItems.filter((item) => !item.featured)

export function ResearchSection() {
  return (
    <section id="research" className={SECTION_SHELL}>
      <h2 className="text-3xl font-bold tracking-tight text-ink">연구</h2>
      <div className="mt-10">
        <FeaturedResearch items={featuredResearch} />
      </div>
      <h3 className="mt-16 font-sans text-sm uppercase tracking-[0.1em] text-ink">게재와 예정</h3>
      <PublicationList items={otherResearch} />
    </section>
  )
}
