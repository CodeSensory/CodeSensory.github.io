import type { ReactNode } from 'react'
import { TRANSITION_PREMIUM } from '../../styles/motionClasses'

type BezelCardProps = {
  children: ReactNode
  className?: string
}

export function BezelCard({ children, className = '' }: BezelCardProps) {
  return (
    <div
      className={`rounded-[1.35rem] bg-zinc-200/35 p-1.5 ring-1 ring-zinc-900/[0.06] ${TRANSITION_PREMIUM} hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-42px_rgba(24,24,27,0.45)] motion-reduce:hover:translate-y-0 ${className}`}
    >
      <div className="rounded-[1.08rem] bg-white p-6 ring-1 ring-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:p-8">
        {children}
      </div>
    </div>
  )
}
