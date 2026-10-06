import { formatMdField } from './mdText'
import { parseLinkLines } from './parseLinkLines'
import type { ContentLink, ResearchStatus } from './types'

export type PaperNarrative = {
  title: string
  authors: string
  venue: string
  year: number
  abstract: string
  keywords: string
  summary: string
  status: ResearchStatus
  featuredOrder: number | null
  links: ContentLink[]
  showBestPaper: boolean
}

const STATUS_KEYS = ['published', 'accepted', 'submitted', 'draft', 'planned'] as const
const BEST_PAPER_MARK = '예'
const HORIZONTAL_RULE_LINE = /^---\s*$/

function stripHorizontalRuleLines(text: string): string {
  return text
    .split('\n')
    .filter((line) => !HORIZONTAL_RULE_LINE.test(line.trim()))
    .join('\n')
    .trim()
}

function readPaperFields(block: string): Map<string, string> {
  const trimmed = block.trim().replace(/^#### /, '')
  const fields = new Map<string, string>()
  for (const part of trimmed.split(/\n#### /).filter(Boolean)) {
    const newline = part.indexOf('\n')
    const key = (newline === -1 ? part : part.slice(0, newline)).trim()
    const value = stripHorizontalRuleLines(newline === -1 ? '' : part.slice(newline + 1))
    fields.set(key, value)
  }
  return fields
}

function requiredText(fields: Map<string, string>, key: string, id: string): string {
  const value = formatMdField(fields.get(key) ?? '')
  if (!value) {
    throw new Error(`03_페이지_문구.md: 논문 "${id}"의 ${key}가 비어 있습니다.`)
  }
  return value
}

function parseStatus(raw: string, id: string): ResearchStatus {
  if ((STATUS_KEYS as readonly string[]).includes(raw)) {
    return raw as ResearchStatus
  }
  throw new Error(`03_페이지_문구.md: 논문 "${id}"의 status가 올바르지 않습니다.`)
}

function parseYear(raw: string, id: string): number {
  const year = Number(raw)
  if (!Number.isInteger(year) || year <= 0) {
    throw new Error(`03_페이지_문구.md: 논문 "${id}"의 year가 올바르지 않습니다.`)
  }
  return year
}

function parseFeaturedOrder(raw: string | undefined, id: string): number | null {
  const value = formatMdField(raw ?? '')
  if (!value) {
    return null
  }
  const order = Number(value)
  if (!Number.isInteger(order) || order < 1) {
    throw new Error(`03_페이지_문구.md: 논문 "${id}"의 featured가 올바르지 않습니다.`)
  }
  return order
}

function parsePaperBody(id: string, block: string): PaperNarrative {
  const fields = readPaperFields(block)
  const title = requiredText(fields, 'title', id)
  return {
    title,
    authors: requiredText(fields, 'authors', id),
    venue: requiredText(fields, 'venue', id),
    year: parseYear(requiredText(fields, 'year', id), id),
    abstract: formatMdField(fields.get('abstract') ?? ''),
    keywords: formatMdField(fields.get('keywords') ?? ''),
    summary: formatMdField(fields.get('summary') ?? ''),
    status: parseStatus(requiredText(fields, 'status', id), id),
    featuredOrder: parseFeaturedOrder(fields.get('featured'), id),
    links: parseLinkLines(fields.get('links') ?? '', `논문 "${id}"`),
    showBestPaper: formatMdField(fields.get('bestPaper') ?? '') === BEST_PAPER_MARK,
  }
}

export function parsePaperNarratives(sectionBody: string): Record<string, PaperNarrative> {
  const papers: Record<string, PaperNarrative> = {}
  const trimmed = sectionBody.trim().replace(/^### /, '')
  for (const chunk of trimmed.split(/\n### /).filter(Boolean)) {
    const newline = chunk.indexOf('\n')
    const id = (newline === -1 ? chunk : chunk.slice(0, newline)).trim()
    if (!id) {
      continue
    }
    papers[id] = parsePaperBody(id, newline === -1 ? '' : chunk.slice(newline + 1))
  }
  return papers
}
