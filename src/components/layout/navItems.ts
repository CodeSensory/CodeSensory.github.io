import { pageCopy } from '../../content/pageCopy'

export type NavItem = {
  to: string
  label: string
  end?: boolean
}

export const LAB_NAME = pageCopy.site.labName

export const NAV_ITEMS: NavItem[] = pageCopy.site.nav
