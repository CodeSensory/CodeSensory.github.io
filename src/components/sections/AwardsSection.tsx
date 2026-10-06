import { pageCopy } from '../../content/pageCopy'
import { SECTION_READ } from '../layout/sectionShell'
import { SectionMark } from '../ui/SectionMark'
import { GRID_GUTTER } from '../../styles/swissClasses'
import { TEXT_KO_BODY } from '../../styles/textClasses'

const AWARD_COLUMNS = 'md:grid-cols-3'
const PAGE_HEADING = 'text-3xl font-bold tracking-tight text-ink'
const AWARD_DATE = 'font-sans text-sm tabular-nums text-ink'

function splitFirstLine(text: string) {
  const breakAt = text.indexOf('\n')
  if (breakAt < 0) {
    return { lead: text, detail: '' }
  }
  return { lead: text.slice(0, breakAt), detail: text.slice(breakAt + 1).trim() }
}

export function AwardsSection() {
  const { about } = pageCopy
  return (
    <section id="awards" className={SECTION_READ}>
      <SectionMark title={about.awardsTitle} className={PAGE_HEADING} />
      <div data-reveal="register">
        <ul className={`register-sheet mt-8 grid ${AWARD_COLUMNS} ${GRID_GUTTER}`}>
          {about.awards.map((award) => {
            const { lead, detail } = splitFirstLine(award)
            return (
              <li key={award} className="bg-paper-elevated p-6 md:p-8">
                <p className={AWARD_DATE}>{lead}</p>
                {detail ? <p className={`mt-3 text-pretty ${TEXT_KO_BODY}`}>{detail}</p> : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
