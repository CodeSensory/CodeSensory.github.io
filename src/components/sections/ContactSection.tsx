import type { CSSProperties } from 'react'
import { profile } from '../../content/profile'
import { pageCopy } from '../../content/pageCopy'
import { SECTION_SHELL } from '../layout/sectionShell'
import { SectionMark } from '../ui/SectionMark'
import { TEXT_KO_BODY } from '../../styles/textClasses'

const PAGE_HEADING = 'text-3xl font-bold tracking-tight text-ink'
const LEAD_DELAY_MS = 420
const LINK_DELAY_MS = 560
const LINK_STEP_MS = 140
const CONTACT_ROW =
  'contact-register flex w-full flex-col items-start gap-1 py-6 font-sans text-lg font-medium text-ink transition-colors duration-300 hover:text-accent sm:flex-row sm:items-baseline sm:justify-between sm:gap-6'

const CONTACT_LINKS = [
  { label: profile.email, href: `mailto:${profile.email}`, isExternal: false },
  { label: pageCopy.site.githubLabel, href: profile.githubHref, isExternal: true },
] as const

function revealDelay(delayMs: number) {
  return { '--reveal-delay': `${delayMs}ms` } as CSSProperties
}

function displayHref(href: string) {
  return href.replace(/^https?:\/\//, '')
}

function ContactLinks() {
  return (
    <ul className="mt-10 border-y border-ink">
      {CONTACT_LINKS.map((link, linkIndex) => (
        <li key={link.label} className="border-t border-ink first:border-t-0">
          <a
            href={link.href}
            className={CONTACT_ROW}
            style={revealDelay(LINK_DELAY_MS + linkIndex * LINK_STEP_MS)}
            {...(link.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span>{link.label}</span>
            {link.isExternal ? (
              <span className="max-w-full break-all font-sans text-sm font-normal">{displayHref(link.href)}</span>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function ContactSection() {
  const { contact } = pageCopy

  return (
    <section id="contact" className={SECTION_SHELL}>
      <SectionMark title={contact.title} className={PAGE_HEADING} drawsOnEnter />
      <p className={`contact-rise mt-8 ${TEXT_KO_BODY}`} style={revealDelay(LEAD_DELAY_MS)}>
        {contact.lead}
      </p>
      <ContactLinks />
    </section>
  )
}
