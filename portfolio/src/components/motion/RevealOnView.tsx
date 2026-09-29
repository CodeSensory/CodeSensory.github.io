import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'
import { EASE_PREMIUM } from '../../styles/motionClasses'

type RevealOnViewProps = {
  children: ReactNode
  className?: string
  delayMs?: number
  as?: ElementType
}

const HIDDEN = 'translate-y-8 opacity-0'
const VISIBLE = 'translate-y-0 opacity-100'

export function RevealOnView({
  children,
  className = '',
  delayMs = 0,
  as: Tag = 'div',
}: RevealOnViewProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const style: CSSProperties | undefined = delayMs
    ? { transitionDelay: `${delayMs}ms` }
    : undefined

  const motionClass = `transform transition-[transform,opacity] duration-[850ms] ${EASE_PREMIUM} motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none`

  return (
    <Tag
      ref={ref}
      className={`${motionClass} ${isVisible ? VISIBLE : HIDDEN} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  )
}
