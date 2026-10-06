import { pageCopy } from '../content/pageCopy'
import { PageHeading } from '../components/layout/PageHeading'
import { ProjectSection } from '../components/projects/ProjectSection'

export function ProjectsPage() {
  const { projects } = pageCopy

  return (
    <>
      <PageHeading title={projects.title} lead={projects.lead} />
      <ProjectSection />
    </>
  )
}
