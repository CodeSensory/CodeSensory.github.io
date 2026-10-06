import { pageCopy } from '../../content/pageCopy'
import { EASE_PREMIUM } from '../../styles/motionClasses'

type SiteHeaderMenuToggleProps = {
  isOpen: boolean
  onToggle: () => void
}

export function SiteHeaderMenuToggle({ isOpen, onToggle }: SiteHeaderMenuToggleProps) {
  const barBase = `absolute left-1/2 h-0.5 w-5 -translate-x-1/2 bg-ink transition-[transform,opacity] duration-500 ${EASE_PREMIUM}`
  const topBar = isOpen ? `${barBase} top-[19px] rotate-45` : `${barBase} top-[13px] rotate-0`
  const midBar = isOpen
    ? `${barBase} top-[19px] scale-x-0 opacity-0`
    : `${barBase} top-[19px] scale-x-100 opacity-100`
  const bottomBar = isOpen
    ? `${barBase} top-[19px] -rotate-45`
    : `${barBase} top-[25px] rotate-0`

  return (
    <button
      type="button"
      className="relative m-2 h-10 w-10 cursor-pointer border border-ink bg-paper-elevated md:hidden"
      aria-expanded={isOpen}
      aria-label={isOpen ? pageCopy.site.menuClose : pageCopy.site.menuOpen}
      onClick={onToggle}
    >
      <span className={topBar} />
      <span className={midBar} />
      <span className={bottomBar} />
    </button>
  )
}
