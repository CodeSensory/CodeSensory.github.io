import { pageCopy } from '../content/pageCopy'
import {
  getListedPublications,
  getPlannedPublications,
} from '../content/researchCatalog'
import { PageHeading } from '../components/layout/PageHeading'
import { SECTION_SHELL } from '../components/layout/sectionShell'
import { PublicationList } from '../components/research/PublicationList'

export function PublicationsPage() {
  const { publications: copy } = pageCopy
  const listed = getListedPublications()
  const planned = getPlannedPublications()

  return (
    <>
      <PageHeading title={copy.title} lead={copy.lead} />
      <div className={`${SECTION_SHELL} pt-0`}>
        <PublicationList items={listed} />
        {planned.length > 0 ? (
          <>
            <h2 className="mt-16 font-sans text-xl font-bold text-ink">
              {copy.plannedSectionTitle}
            </h2>
            <PublicationList items={planned} />
          </>
        ) : null}
      </div>
    </>
  )
}
