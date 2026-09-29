import type { CSSProperties } from 'react'
import { pageCopy } from '../../content/pageCopy'
import { SECTION_READ } from '../layout/sectionShell'
import { SectionMark } from '../ui/SectionMark'
import { TEXT_KO_BODY } from '../../styles/textClasses'

const PAGE_HEADING = 'text-3xl font-bold tracking-tight text-ink'

const INTRO_REVEAL_MS = 420
const CHIP_REVEAL_STEP_MS = 55
const STEP_REVEAL_MS = 110
const SUBHEAD = 'font-sans text-lg font-bold normal-case tracking-tight text-ink'
const ABOUT_CHIP =
  'border border-ink bg-paper-elevated px-3 py-1.5 font-sans text-sm font-medium leading-snug text-ink'
const STEP_INDEX = 'w-8 shrink-0 pt-1 font-sans text-sm font-semibold tabular-nums text-accent'

function revealDelay(delayMs: number) {
  return { '--reveal-delay': `${delayMs}ms` } as CSSProperties
}

function IntroParagraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className={`mt-8 space-y-6 ${TEXT_KO_BODY}`}>
      {paragraphs.map((paragraph, paragraphIndex) => (
        <p
          key={paragraph.slice(0, 24)}
          data-reveal
          className="text-pretty"
          style={revealDelay(INTRO_REVEAL_MS + paragraphIndex * STEP_REVEAL_MS)}
        >
          {paragraph}
        </p>
      ))}
    </div>
  )
}

function KeywordList({ keywords, delayStart }: { keywords: string[]; delayStart: number }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2.5">
      {keywords.map((keyword, keywordIndex) => (
        <li
          key={keyword}
          lang={keyword.includes(' ') ? 'en' : undefined}
          data-reveal
          style={revealDelay(delayStart + keywordIndex * CHIP_REVEAL_STEP_MS)}
          className={ABOUT_CHIP}
        >
          {keyword}
        </li>
      ))}
    </ul>
  )
}

function SkillList({ skills, delayStart }: { skills: string[]; delayStart: number }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2.5">
      {skills.map((skill, skillIndex) => (
        <li
          key={skill}
          lang="en"
          data-reveal
          style={revealDelay(delayStart + skillIndex * CHIP_REVEAL_STEP_MS)}
          className={ABOUT_CHIP}
        >
          {skill}
        </li>
      ))}
    </ul>
  )
}

function MethodList({ steps, delayStart }: { steps: string[]; delayStart: number }) {
  return (
    <ol className="mt-6 space-y-8 border-l border-ink pl-5">
      {steps.map((step, stepIndex) => (
        <li
          key={step.slice(0, 20)}
          data-reveal
          style={revealDelay(delayStart + stepIndex * STEP_REVEAL_MS)}
          className="flex gap-4"
        >
          <span className={STEP_INDEX}>{String(stepIndex + 1).padStart(2, '0')}</span>
          <p className={`min-w-0 flex-1 text-pretty ${TEXT_KO_BODY}`}>{step}</p>
        </li>
      ))}
    </ol>
  )
}

export function AboutSection() {
  const { about } = pageCopy
  const skillDelay = INTRO_REVEAL_MS + about.keywords.length * CHIP_REVEAL_STEP_MS
  const methodDelay = skillDelay + about.skills.length * CHIP_REVEAL_STEP_MS

  return (
    <section id="about" className={SECTION_READ}>
      <SectionMark title={about.sectionTitle} className={PAGE_HEADING} drawsOnEnter />
      <IntroParagraphs paragraphs={about.paragraphs} />
      <div className="mt-14">
        <h3 className={SUBHEAD}>{about.keywordsTitle}</h3>
        <KeywordList keywords={about.keywords} delayStart={INTRO_REVEAL_MS} />
      </div>
      <div className="mt-10">
        <h3 lang="en" className={SUBHEAD}>{about.skillsTitle}</h3>
        <SkillList skills={about.skills} delayStart={skillDelay} />
      </div>
      <div className="mt-14">
        <h3 lang="en" className={SUBHEAD}>{about.methodsTitle}</h3>
        <MethodList steps={about.howIResearch} delayStart={methodDelay} />
      </div>
    </section>
  )
}
