import { profile } from '../content/profile'
import { pageCopy } from '../content/pageCopy'
import type { HomeMetricCopy, ResearchAxisCopy } from '../content/parsePageCopy'
import heroMark from '../assets/hero-mark.png'
import { SECTION_SHELL } from '../components/layout/sectionShell'
import { GridPanel } from '../components/ui/GridPanel'
import { PrimaryCta } from '../components/ui/PrimaryCta'
import { FRAME_TAG, GRID_GUTTER, MACRO_EN } from '../styles/swissClasses'
import { TEXT_KO_BODY, TEXT_MUTED, TEXT_PROFILE_LINE } from '../styles/textClasses'

const HERO_SPLIT =
  'grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-16'

const HERO_MARK =
  'hero-pop mx-auto block h-auto w-full max-w-72 object-contain md:mx-0 md:ml-auto md:max-w-none'

const CARD_INDEX_WIDTH = 2

function formatCardIndex(index: number) {
  return String(index + 1).padStart(CARD_INDEX_WIDTH, '0')
}

function ResearchAxisCell({ axis, index }: { axis: ResearchAxisCopy; index: number }) {
  return (
    <li className="research-axis-card h-full bg-paper-elevated">
      <div className="axis-rise h-full">
      <GridPanel className="h-full">
        <p className="font-sans text-xs font-medium tracking-[0.14em] text-accent">
          {formatCardIndex(index)}
        </p>
        <h3 lang="en" className="mt-4">
          {axis.title}
        </h3>
        <p className={`mt-3 ${TEXT_KO_BODY} text-sm`}>{axis.body}</p>
      </GridPanel>
      </div>
    </li>
  )
}

function HomeHero({
  eyebrow,
  tagline,
  affiliation,
}: {
  eyebrow: string
  tagline: string
  affiliation: string
}) {
  return (
    <div className={HERO_SPLIT}>
      <div className="min-w-0">
        <p className={FRAME_TAG}>[ {eyebrow} ]</p>
        <div className="mt-5 inline-block max-w-full">
          <h1 lang="en" className={`text-5xl md:text-6xl ${MACRO_EN}`}>
            {profile.nameEn}
          </h1>
          <div aria-hidden className="mt-4 w-full bg-rule animate-rule-draw" />
        </div>
        <p lang="ko" className={`mt-6 ${TEXT_KO_BODY} text-lg`}>
          {tagline}
        </p>
        <p className={`mt-4 ${TEXT_PROFILE_LINE}`}>{affiliation}</p>
      </div>
      <img src={heroMark} alt={pageCopy.home.heroAlt} className={HERO_MARK} />
    </div>
  )
}

function HomeMetrics({ metrics }: { metrics: HomeMetricCopy[] }) {
  return (
    <div className="mt-16 border-t border-ink pt-12 md:mt-20">
      <dl className={`grid grid-cols-2 md:grid-cols-4 ${GRID_GUTTER}`}>
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-paper-elevated p-4 md:p-5">
            <dt className={TEXT_MUTED}>{metric.label}</dt>
            <dd className="mt-2 whitespace-pre-line break-keep font-sans text-base font-semibold leading-snug tracking-[-0.01em] text-ink md:text-lg">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ResearchAxisList({ axes }: { axes: ResearchAxisCopy[] }) {
  return (
    <ul className={`mt-10 grid md:grid-cols-2 ${GRID_GUTTER}`}>
      {axes.map((axis, index) => (
        <ResearchAxisCell key={axis.title} axis={axis} index={index} />
      ))}
    </ul>
  )
}

export function HomePage() {
  const { home } = pageCopy

  return (
    <section className={`${SECTION_SHELL} border-b border-ink pb-28`}>
      <HomeHero eyebrow={home.eyebrow} tagline={home.tagline} affiliation={home.affiliation} />
      <h2 className="mt-16 text-2xl font-bold tracking-tight text-ink md:mt-20">
        {home.researchSectionTitle}
      </h2>
      <ResearchAxisList axes={home.researchAxes} />
      <div className="mt-10">
        <PrimaryCta to="/research">{home.researchCta}</PrimaryCta>
      </div>
      <HomeMetrics metrics={home.metrics} />
    </section>
  )
}
