import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { pageCopy } from '../content/pageCopy'
import { getResearchItemById } from '../content/researchCatalog'
import { SECTION_SHELL } from '../components/layout/sectionShell'
import { StatusBadges } from '../components/ui/StatusBadges'
import { BTN_OUTLINE } from '../styles/swissClasses'
import {
  TEXT_EN_BODY,
  TEXT_EN_TITLE,
  TEXT_KO_BODY,
  TEXT_MUTED,
  TEXT_VENUE,
} from '../styles/textClasses'

const PAPER_SERIF =
  'w-full whitespace-pre-line font-serif text-base leading-[1.8] text-ink/85 [overflow-wrap:break-word]'

type DetailRowProps = {
  label: string
  isEnglishLabel: boolean
  children: ReactNode
}

function DetailRow({ label, isEnglishLabel, children }: DetailRowProps) {
  const labelFont = isEnglishLabel
    ? 'font-sans text-sm uppercase tracking-[0.1em]'
    : 'font-sans text-base font-bold'
  return (
    <section className="grid gap-4 border-t border-ink py-10 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-8">
      <h2 lang={isEnglishLabel ? 'en' : undefined} className={`${labelFont} text-ink lg:col-span-3`}>
        {label}
      </h2>
      <div className="lg:col-span-9">{children}</div>
    </section>
  )
}

export function PublicationDetailPage() {
  const { publicationId } = useParams()
  const item = publicationId ? getResearchItemById(publicationId) : undefined
  const { publications: copy } = pageCopy

  if (!item) {
    return <Navigate to="/publications" replace />
  }

  const abstractText = item.abstract.trim() ? item.abstract : copy.abstractEmpty

  return (
    <>
      <div className={SECTION_SHELL}>
        <Link to="/publications" className={BTN_OUTLINE}>
          {copy.backToListLabel}
        </Link>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className={TEXT_MUTED}>{item.year}</span>
          <StatusBadges item={item} />
        </div>
        <h1 lang="en" className={`mt-4 text-3xl md:text-4xl ${TEXT_EN_TITLE}`}>
          {item.title}
        </h1>
        <p lang="en" className={`mt-5 ${TEXT_EN_BODY}`}>
          {item.authors}
        </p>
        <p lang="en" className={`mt-2 ${TEXT_VENUE}`}>
          {item.venue}
        </p>
      </div>
      <div className={`${SECTION_SHELL} border-t border-ink`}>
        <DetailRow label={copy.abstractLabel} isEnglishLabel>
          <p lang="en" className={PAPER_SERIF}>
            {abstractText}
          </p>
        </DetailRow>
        {item.keywords.trim() ? (
          <DetailRow label={copy.keywordsLabel} isEnglishLabel>
            <p lang="en" className={PAPER_SERIF}>
              {item.keywords}
            </p>
          </DetailRow>
        ) : null}
        {item.summary ? (
          <DetailRow label={copy.detailIntroTitle} isEnglishLabel={false}>
            <p className={TEXT_KO_BODY}>{item.summary}</p>
          </DetailRow>
        ) : null}
      </div>
    </>
  )
}
