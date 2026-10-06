import { pageCopy } from './pageCopy'
import type { ResearchStatus } from './types'

export function statusLabel(status: ResearchStatus): string {
  return pageCopy.publications.statusLabels[status]
}
