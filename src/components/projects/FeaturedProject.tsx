import { useState } from 'react'

import { pageCopy } from '../../content/pageCopy'
import type { ProjectItem } from '../../content/types'

import { TEXT_KO_BODY, TEXT_MUTED } from '../../styles/textClasses'

import { BTN_OUTLINE, PANEL, TAG_CHIP_EN } from '../../styles/swissClasses'

import { ExternalLink } from '../ui/ExternalLink'



type FeaturedProjectProps = {

  items: ProjectItem[]

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



export function FeaturedProject({ items }: FeaturedProjectProps) {

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

            {pageCopy.projects.previousLabel}

          </button>

          <button

            type="button"

            className={BTN_OUTLINE}

            onClick={() => setIndex((current) => wrapIndex(current + 1, total))}

          >

            {pageCopy.projects.nextLabel}

          </button>

        </div>

      </div>

      <article key={item.id} className="mt-6 w-full min-w-0 animate-carousel-in motion-reduce:animate-none">

        <h3 className="text-xl font-bold text-ink md:text-2xl">{item.title}</h3>

        <p className={`mt-2 ${TEXT_MUTED}`}>

          {item.period} · {item.role}

        </p>

        <p className={`mt-6 ${TEXT_KO_BODY}`}>{item.summary}</p>

        <ul className="mt-4 flex flex-wrap gap-2">

          {item.stack.map((tech) => (

            <li key={tech} className={TAG_CHIP_EN}>

              {tech}

            </li>

          ))}

        </ul>

        <ol className="mt-8 divide-y divide-ink border-t border-ink">

          {item.highlights.map((highlight, highlightIndex) => (

            <li key={highlight.feature} className="grid gap-3 py-6 md:grid-cols-12 md:gap-8">

              <div className="md:col-span-5">

                <p className={TEXT_MUTED}>{String(highlightIndex + 1).padStart(2, '0')} · {pageCopy.projects.featureLabel}</p>

                <p className="mt-2 break-keep font-sans text-base font-semibold leading-snug text-ink">

                  {highlight.feature}

                </p>

              </div>

              <div className="md:col-span-7">

                <p className={TEXT_MUTED}>{pageCopy.projects.implementationLabel}</p>

                <p className={`mt-2 ${TEXT_KO_BODY}`}>{highlight.implementation}</p>

              </div>

            </li>

          ))}

        </ol>

        <div className="mt-6 flex flex-wrap gap-3">

          {item.links.map((link) => (

            <ExternalLink key={link.href} link={link} />

          ))}

        </div>

      </article>

    </div>

  )

}

