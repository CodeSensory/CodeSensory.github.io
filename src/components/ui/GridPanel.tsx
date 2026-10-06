import type { ReactNode } from 'react'
import { GRID_CELL } from '../../styles/swissClasses'
import { TRANSITION_PREMIUM } from '../../styles/motionClasses'

type GridPanelProps = {
  children: ReactNode
  className?: string
}

export function GridPanel({ children, className = '' }: GridPanelProps) {
  return (
    <div
      className={`${GRID_CELL} p-6 md:p-8 ${TRANSITION_PREMIUM} hover:bg-paper motion-reduce:hover:bg-paper-elevated md:hover:-translate-y-px ${className}`}
    >
      {children}
    </div>
  )
}
