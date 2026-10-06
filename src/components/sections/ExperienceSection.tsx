import type { CSSProperties } from 'react'
import { pageCopy } from '../../content/pageCopy'
import type { AboutTimelineEntry } from '../../content/parseAboutCopy'
import { SECTION_READ } from '../layout/sectionShell'
import { SectionMark } from '../ui/SectionMark'
import { GRID_GUTTER } from '../../styles/swissClasses'
import { TEXT_KO_BODY } from '../../styles/textClasses'

const OPEN_PERIOD_MARKERS = ['현재', '재학'] as const
const PERIOD_RAIL = 'md:grid-cols-[11rem_minmax(0,1fr)] md:items-baseline md:gap-8'
const PERIOD_OPEN = 'whitespace-nowrap font-sans text-sm font-semibold tabular-nums text-accent'
const PERIOD_CLOSED = 'whitespace-nowrap font-sans text-sm tabular-nums text-ink'
const ENTRY_DETAIL =
  'mt-3 whitespace-pre-line font-sans text-sm leading-relaxed tabular-nums text-ink'
const PAGE_HEADING = 'text-3xl font-bold tracking-tight text-ink'
const EDUCATION_HEADING = 'text-2xl font-bold tracking-tight text-ink'
const REGISTER_STEP_MS = 80

function registerDelay(index: number) {
  return { '--reveal-delay': `${index * REGISTER_STEP_MS}ms` } as CSSProperties
}

function isOpenPeriod(period: string) {
  return OPEN_PERIOD_MARKERS.some((marker) => period.includes(marker))
}

function periodClass(period: string) {
  return isOpenPeriod(period) ? PERIOD_OPEN : PERIOD_CLOSED
}

function splitFirstLine(text: string) {
  const breakAt = text.indexOf('\n')
  if (breakAt < 0) {
    return { lead: text, detail: '' }
  }
  return { lead: text.slice(0, breakAt), detail: text.slice(breakAt + 1).trim() }
}

function CareerRegister({ entries }: { entries: AboutTimelineEntry[] }) {
  if (entries.length === 0) {
    return null
  }
  return (
    <ol className="mt-8 border-y border-ink">
      {entries.map((entry, entryIndex) => (
        <li
          key={entry.period + entry.body}
          data-reveal="register"
          style={registerDelay(entryIndex)}
        >
          <div
            className={`register-sheet grid gap-2 border-t border-ink py-6 ${PERIOD_RAIL} ${entryIndex === 0 ? 'border-t-0' : ''}`}
          >
            <p className={periodClass(entry.period)}>{entry.period}</p>
            <p className={`text-pretty ${TEXT_KO_BODY}`}>{entry.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function EducationGrid({ entries }: { entries: AboutTimelineEntry[] }) {
  if (entries.length === 0) {
    return null
  }
  return (
    <div data-reveal="register">
      <ul className={`register-sheet mt-8 grid md:grid-cols-2 ${GRID_GUTTER}`}>
        {entries.map((entry) => (
          <li key={entry.period + entry.body} className="bg-paper-elevated p-6 md:p-8">
            <EducationEntry entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function EducationEntry({ entry }: { entry: AboutTimelineEntry }) {
  const { lead, detail } = splitFirstLine(entry.body)
  return (
    <>
      <p className={periodClass(entry.period)}>{entry.period}</p>
      <p className={`mt-4 text-pretty ${TEXT_KO_BODY}`}>{lead}</p>
      {detail ? <p className={ENTRY_DETAIL}>{detail}</p> : null}
    </>
  )
}

export function ExperienceSection() {
  const { about } = pageCopy
  return (
    <section id="experience" className={SECTION_READ}>
      <SectionMark title={about.experienceTitle} className={PAGE_HEADING} />
      <CareerRegister entries={about.experience} />
      <div className="mt-16">
        <SectionMark as="h3" title={about.educationTitle} className={EDUCATION_HEADING} />
      </div>
      <EducationGrid entries={about.education} />
    </section>
  )
}
