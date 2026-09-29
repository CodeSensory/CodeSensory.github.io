import { ArrowUpRight } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EASE_PREMIUM } from '../../styles/motionClasses'

type PillLinkProps = {
  to: string
  children: ReactNode
}

export function PillLink({ to, children }: PillLinkProps) {
  const shell = `group inline-flex cursor-pointer items-center gap-3 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-[transform,box-shadow] duration-500 ${EASE_PREMIUM} hover:shadow-[0_18px_44px_-22px_rgba(15,118,110,0.55)] active:scale-[0.98] motion-reduce:transition-none`
  const iconShell = `flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ${EASE_PREMIUM} group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105`

  return (
    <Link to={to} className={shell}>
      <span>{children}</span>
      <span className={iconShell} aria-hidden>
        <ArrowUpRight size={16} weight="light" />
      </span>
    </Link>
  )
}
