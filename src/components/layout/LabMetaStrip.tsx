import { pageCopy } from '../../content/pageCopy'

export function LabMetaStrip() {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink bg-paper-elevated px-4 py-2 font-sans text-[11px] leading-relaxed text-ink/70 md:px-6">
      <p>{pageCopy.site.certify}</p>
      <span className="uppercase tracking-[0.14em] text-accent" aria-hidden>
        {pageCopy.site.certifyMark}
      </span>
    </div>
  )
}
