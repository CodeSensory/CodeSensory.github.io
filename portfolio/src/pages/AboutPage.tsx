import { useRef } from 'react'
import { AboutSection } from '../components/sections/AboutSection'
import { AwardsSection } from '../components/sections/AwardsSection'
import { ExperienceSection } from '../components/sections/ExperienceSection'
import { useRevealOnView } from '../components/motion/useRevealOnView'

export function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  useRevealOnView(pageRef)

  return (
    <div ref={pageRef}>
      <AboutSection />
      <ExperienceSection />
      <AwardsSection />
    </div>
  )
}
