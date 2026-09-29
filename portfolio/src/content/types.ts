export type ResearchStatus =
  | 'published'
  | 'accepted'
  | 'submitted'
  | 'draft'
  | 'planned'

export type ContentLink = {
  label: string
  href: string
}

export type ResearchItem = {
  id: string
  title: string
  authors: string
  venue: string
  year: number
  status: ResearchStatus
  /** 논문 상세 페이지 Abstract */
  abstract: string
  /** 논문 상세 Keywords (영문, 저널 표기) */
  keywords: string
  /** 논문 상세·목록용 연구 소개(한국어) */
  summary: string
  featured: boolean
  featuredOrder: number | null
  links: ContentLink[]
  showBestPaper: boolean
}

export type ProjectHighlight = {
  feature: string
  implementation: string
}

export type ProjectItem = {
  id: string
  title: string
  period: string
  role: string
  summary: string
  stack: string[]
  highlights: ProjectHighlight[]
  featuredOrder: number
  links: ContentLink[]
}

export type Profile = {
  nameKo: string
  nameEn: string
  email: string
  githubHref: string
  resumeHref: string | null
}
