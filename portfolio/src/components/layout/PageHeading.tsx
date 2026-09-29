import type { ReactNode } from 'react'
import { SECTION_SHELL } from './sectionShell'
import { TEXT_KO_BODY } from '../../styles/textClasses'

type PageHeadingProps = {
  title: string
  lead?: string
  children?: ReactNode
}

export function PageHeading({ title, lead, children }: PageHeadingProps) {
  return (
    <div className={SECTION_SHELL}>
      <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">{title}</h1>
      {lead ? <p className={`mt-6 ${TEXT_KO_BODY} text-lg`}>{lead}</p> : null}
      {children}
    </div>
  )
}
