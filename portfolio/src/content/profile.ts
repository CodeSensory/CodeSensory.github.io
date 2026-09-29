import { pageCopy } from './pageCopy'
import type { Profile } from './types'

export const profile: Profile = {
  nameKo: pageCopy.site.nameKo,
  nameEn: pageCopy.site.nameEn,
  email: pageCopy.site.email,
  githubHref: pageCopy.site.githubHref,
  resumeHref: null,
}
