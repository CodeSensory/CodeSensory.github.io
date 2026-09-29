import { Link } from 'react-router-dom'
import { pageCopy } from '../../content/pageCopy'
import { LAB_NAME } from './navItems'
import { LINK_ACCENT } from '../../styles/swissClasses'

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink bg-paper-elevated py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 font-sans text-[11px] uppercase tracking-[0.1em] text-ink/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {pageCopy.site.footerYear} {LAB_NAME}</p>
        <Link to="/contact" className={LINK_ACCENT}>
          {pageCopy.site.footerContact}
        </Link>
      </div>
    </footer>
  )
}
