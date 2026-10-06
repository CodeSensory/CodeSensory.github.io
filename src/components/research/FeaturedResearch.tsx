import { useState } from 'react'

import { pageCopy } from '../../content/pageCopy'
import type { ResearchItem } from '../../content/types'

import {

  TEXT_EN_BODY,

  TEXT_EN_TITLE,

  TEXT_KO_BODY,

  TEXT_MUTED,

  TEXT_VENUE,

} from '../../styles/textClasses'

import { BTN_OUTLINE, PANEL } from '../../styles/swissClasses'

import { ExternalLink } from '../ui/ExternalLink'

import { StatusBadges } from '../ui/StatusBadges'



type FeaturedResearchProps = {

  items: ResearchItem[]

}



function wrapIndex(index: number, length: number) {

  if (index < 0) {

    return length - 1

  }

  if (index >= length) {

    return 0

  }

  return index

}



export function FeaturedResearch({ items }: FeaturedResearchProps) {

  const [index, setIndex] = useState(0)

  const item = items[index]

  const total = items.length



  if (!item) {

    return null

  }



  return (

    <div className={PANEL}>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <p className={TEXT_MUTED}>

          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}

        </p>

        <div className="flex flex-wrap gap-2">

          <button

            type="button"

            className={BTN_OUTLINE}

            onClick={() => setIndex((current) => wrapIndex(current - 1, total))}

          >

            {pageCopy.research.previousLabel}

          </button>

          <button

            type="button"

            className={BTN_OUTLINE}

            onClick={() => setIndex((current) => wrapIndex(current + 1, total))}

          >

            {pageCopy.research.nextLabel}

          </button>

        </div>

      </div>

      <article key={item.id} className="mt-6 w-full min-w-0 animate-carousel-in motion-reduce:animate-none">

        <StatusBadges item={item} />

        <h3 lang="en" className={`mt-4 text-lg md:text-xl ${TEXT_EN_TITLE}`}>

          {item.title}

        </h3>

        <p lang="en" className={`mt-3 ${TEXT_EN_BODY}`}>

          {item.authors}

        </p>

        <p lang="en" className={`mt-2 ${TEXT_VENUE}`}>

          {item.venue} · {item.year}

        </p>

        {item.summary ? <p className={`mt-6 ${TEXT_KO_BODY}`}>{item.summary}</p> : null}

        {item.links.length > 0 ? (

          <div className="mt-6 flex flex-wrap gap-3">

            {item.links.map((link) => (

              <ExternalLink key={link.href} link={link} />

            ))}

          </div>

        ) : null}

      </article>

    </div>

  )

}

