import { projectItems } from '../../content/projectCatalog'
import { SECTION_SHELL } from '../layout/sectionShell'
import { FeaturedProject } from './FeaturedProject'

const sortedProjects = [...projectItems].sort(
  (a, b) => a.featuredOrder - b.featuredOrder,
)

export function ProjectSection() {
  return (
    <section id="projects" className={`${SECTION_SHELL} pt-0`}>
      <FeaturedProject items={sortedProjects} />
    </section>
  )
}
