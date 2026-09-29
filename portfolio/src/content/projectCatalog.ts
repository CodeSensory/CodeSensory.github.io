import { pageCopy } from './pageCopy'
import type { ProjectItem } from './types'

const FEATURED_ORDER_ORIGIN = 1

export const projectItems: ProjectItem[] = Object.entries(pageCopy.projects.items).map(
  ([id, narrative], index) => ({
    id,
    featuredOrder: index + FEATURED_ORDER_ORIGIN,
    ...narrative,
  }),
)
