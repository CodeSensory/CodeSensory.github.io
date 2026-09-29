import { pageCopy } from '../../content/pageCopy'

export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed left-4 top-4 z-50 -translate-y-24 border-2 border-ink bg-ink px-4 py-2 font-sans text-xs uppercase tracking-wider text-paper-elevated focus:translate-y-0"
    >
      {pageCopy.site.skipToContent}
    </a>
  )
}
