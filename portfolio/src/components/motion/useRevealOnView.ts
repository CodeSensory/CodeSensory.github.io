import { useEffect, type RefObject } from 'react'

const REVEAL_THRESHOLD = 0.2

function markVisible(entry: IntersectionObserverEntry, observer: IntersectionObserver) {
  if (!entry.isIntersecting) {
    return
  }
  entry.target.classList.add('is-shown')
  observer.unobserve(entry.target)
}

function showAll(nodes: HTMLElement[]) {
  for (const node of nodes) {
    node.classList.add('is-shown')
  }
}

export function useRevealOnView(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }
    const nodes = [...root.querySelectorAll<HTMLElement>('[data-reveal]')]
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches) {
      showAll(nodes)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          markVisible(entry, observer)
        }
      },
      { threshold: REVEAL_THRESHOLD },
    )
    for (const node of nodes) {
      observer.observe(node)
    }
    return () => observer.disconnect()
  }, [rootRef])
}
