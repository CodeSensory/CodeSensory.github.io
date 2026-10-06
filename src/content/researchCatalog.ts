import { pageCopy } from './pageCopy'
import type { ResearchItem } from './types'

function toResearchItem(id: string, paper: (typeof pageCopy.papers)[string]): ResearchItem {
  return {
    id,
    title: paper.title,
    authors: paper.authors,
    venue: paper.venue,
    year: paper.year,
    status: paper.status,
    abstract: paper.abstract,
    keywords: paper.keywords,
    summary: paper.summary,
    featured: paper.featuredOrder !== null,
    featuredOrder: paper.featuredOrder,
    links: paper.links,
    showBestPaper: paper.showBestPaper,
  }
}

export const researchItems = Object.entries(pageCopy.papers).map(([id, paper]) =>
  toResearchItem(id, paper),
)

export function getResearchItemById(id: string): ResearchItem | undefined {
  return researchItems.find((item) => item.id === id)
}

export function getFeaturedResearchItems(): ResearchItem[] {
  return researchItems
    .filter((item) => item.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
}

export function getListedPublications(): ResearchItem[] {
  return [...researchItems]
    .filter((item) => item.status !== 'planned')
    .sort((a, b) => b.year - a.year)
}

export function getPlannedPublications(): ResearchItem[] {
  return researchItems
    .filter((item) => item.status === 'planned')
    .sort((a, b) => b.year - a.year)
}
