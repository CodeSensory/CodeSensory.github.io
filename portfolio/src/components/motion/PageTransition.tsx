import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type PageTransitionProps = {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="animate-page-enter motion-reduce:animate-none">
      {children}
    </div>
  )
}
