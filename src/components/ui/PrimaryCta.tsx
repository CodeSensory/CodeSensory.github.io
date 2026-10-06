import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BTN_PRIMARY } from '../../styles/swissClasses'

type PrimaryCtaProps = {
  to: string
  children: ReactNode
}

export function PrimaryCta({ to, children }: PrimaryCtaProps) {
  return (
    <Link to={to} className={BTN_PRIMARY}>
      <span>{children}</span>
      <span className="text-paper-elevated/90 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
        &gt;&gt;&gt;
      </span>
    </Link>
  )
}
