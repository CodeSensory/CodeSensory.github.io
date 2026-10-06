import { formatMdField } from './mdText'

export type SiteNavItem = {
  to: string
  label: string
  end?: boolean
}

export type SiteCopy = {
  labName: string
  nameEn: string
  nameKo: string
  email: string
  githubHref: string
  githubLabel: string
  certify: string
  certifyMark: string
  skipToContent: string
  footerYear: string
  footerContact: string
  menuLabel: string
  menuOpen: string
  menuClose: string
  menuMobile: string
  nav: SiteNavItem[]
}

const SITE_TEXT_KEYS = [
  'labName',
  'nameEn',
  'nameKo',
  'email',
  'githubHref',
  'githubLabel',
  'certify',
  'certifyMark',
  'skipToContent',
  'footerYear',
  'footerContact',
  'menuLabel',
  'menuOpen',
  'menuClose',
  'menuMobile',
] as const

function requiredText(fields: Map<string, string>, key: string): string {
  const value = formatMdField(fields.get(key) ?? '')
  if (!value) {
    throw new Error(`03_페이지_문구.md: "${key}" 항목이 비어 있습니다.`)
  }
  return value
}

function parseNav(block: string): SiteNavItem[] {
  const lines = block
    .split('\n')
    .map((line) => formatMdField(line))
    .filter(Boolean)
  if (lines.length === 0 || lines.length % 2 !== 0) {
    throw new Error('03_페이지_문구.md: nav는 경로와 이름을 번갈아 적습니다.')
  }
  const items: SiteNavItem[] = []
  for (let index = 0; index < lines.length; index += 2) {
    const to = lines[index] ?? ''
    const label = lines[index + 1] ?? ''
    items.push({ to, label, end: to === '/' })
  }
  return items
}

export function parseSiteCopy(fields: Map<string, string>): SiteCopy {
  const copy = {} as Omit<SiteCopy, 'nav'>
  for (const key of SITE_TEXT_KEYS) {
    copy[key] = requiredText(fields, key)
  }
  return { ...copy, nav: parseNav(fields.get('nav') ?? '') }
}
