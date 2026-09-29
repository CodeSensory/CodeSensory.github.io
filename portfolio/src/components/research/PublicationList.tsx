import { Link } from 'react-router-dom'
import type { ResearchItem } from '../../content/types'
import {
  TEXT_EN_BODY,
  TEXT_EN_TITLE,
  TEXT_KO_BODY,
  TEXT_MUTED,
  TEXT_VENUE,
} from '../../styles/textClasses'
import { LINK_ACCENT } from '../../styles/swissClasses'
import { StatusBadges } from '../ui/StatusBadges'

type PublicationListProps = {
  items: ResearchItem[]
}

export function PublicationList({ items }: PublicationListProps) {
  return (
    <ul className="mt-8 divide-y divide-ink border-t border-ink">
      {items.map((item) => {
        const titleClass = `mt-3 whitespace-pre-line text-lg md:text-xl ${TEXT_EN_TITLE}`
        const statusNote = item.summary.split('\n\n').pop()?.trim()
        return (
          <li key={item.id} className="py-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className={TEXT_MUTED}>{item.year}</span>
              <StatusBadges item={item} />
            </div>
            <h3 lang="en" className={titleClass}>
              <Link to={`/publications/${item.id}`} className={LINK_ACCENT}>
                {item.title}
              </Link>
            </h3>
            <p lang="en" className={`mt-2 ${TEXT_EN_BODY}`}>
              {item.authors}
            </p>
            <p lang="en" className={`mt-1 ${TEXT_VENUE}`}>
              {item.venue}
            </p>
            {statusNote ? <p className={`mt-4 ${TEXT_KO_BODY} text-sm`}>{statusNote}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}
