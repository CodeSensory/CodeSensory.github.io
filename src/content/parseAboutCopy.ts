import { formatMdField, splitMdFieldParts } from './mdText'

export type AboutTimelineEntry = {
  period: string
  body: string
}

export type AboutCopy = {
  sectionTitle: string
  paragraphs: string[]
  keywordsTitle: string
  keywords: string[]
  skillsTitle: string
  skills: string[]
  methodsTitle: string
  howIResearch: string[]
  experienceTitle: string
  educationTitle: string
  experience: AboutTimelineEntry[]
  education: AboutTimelineEntry[]
  awardsTitle: string
  awards: string[]
}

function requiredField(fields: Map<string, string>, key: string): string {
  const value = formatMdField(fields.get(key)?.trim() ?? '')
  if (!value) {
    throw new Error(`03_페이지_문구.md: "${key}" 항목이 비어 있습니다.`)
  }
  return value
}

function parsePlainLines(block: string, label: string): string[] {
  const lines = block
    .split('\n')
    .map((line) => formatMdField(line))
    .filter(Boolean)
  if (lines.length === 0) {
    throw new Error(`03_페이지_문구.md: ${label} 목록이 비어 있습니다.`)
  }
  return lines
}

function parseTimelineEntry(chunk: string): AboutTimelineEntry {
  const newline = chunk.indexOf('\n')
  const period = (newline === -1 ? chunk : chunk.slice(0, newline)).trim()
  const body = formatMdField(newline === -1 ? '' : chunk.slice(newline + 1))
  if (!period || !body) {
    throw new Error('03_페이지_문구.md: 기간과 내용을 모두 적어 주세요.')
  }
  return { period, body }
}

function parseTimeline(block: string, label: string): AboutTimelineEntry[] {
  const trimmed = block.trim().replace(/^#### /, '')
  if (!trimmed) {
    throw new Error(`03_페이지_문구.md: ${label} 목록이 비어 있습니다.`)
  }
  return trimmed.split(/\n#### /).filter(Boolean).map(parseTimelineEntry)
}

function parseSeparatedItems(block: string, label: string): string[] {
  const items = block
    .split(/\n\s*\n/)
    .map((part) => formatMdField(part))
    .filter(Boolean)
  if (items.length === 0) {
    throw new Error(`03_페이지_문구.md: ${label} 목록이 비어 있습니다.`)
  }
  return items
}

export function parseAboutCopy(fields: Map<string, string>): AboutCopy {
  return {
    sectionTitle: requiredField(fields, 'sectionTitle'),
    paragraphs: splitMdFieldParts(fields.get('paragraphs') ?? '', '\n\n'),
    keywordsTitle: requiredField(fields, 'keywordsTitle'),
    keywords: parsePlainLines(fields.get('keywords') ?? '', 'keywords'),
    skillsTitle: requiredField(fields, 'skillsTitle'),
    skills: parsePlainLines(fields.get('skills') ?? '', 'skills'),
    methodsTitle: requiredField(fields, 'methodsTitle'),
    howIResearch: splitMdFieldParts(fields.get('howIResearch') ?? '', '\n\n'),
    experienceTitle: requiredField(fields, 'experienceTitle'),
    educationTitle: requiredField(fields, 'educationTitle'),
    experience: parseTimeline(fields.get('experience') ?? '', 'experience'),
    education: parseTimeline(fields.get('education') ?? '', 'education'),
    awardsTitle: requiredField(fields, 'awardsTitle'),
    awards: parseSeparatedItems(fields.get('awards') ?? '', 'awards'),
  }
}
