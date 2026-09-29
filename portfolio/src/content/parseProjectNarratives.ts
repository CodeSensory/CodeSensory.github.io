import { formatMdField } from './mdText'
import { parseLinkLines } from './parseLinkLines'
import type { ContentLink, ProjectHighlight } from './types'

export type ProjectNarrative = {
  title: string
  period: string
  role: string
  summary: string
  stack: string[]
  highlights: ProjectHighlight[]
  links: ContentLink[]
}

const PAGE_FIELDS = new Set([
  'title',
  'lead',
  'previousLabel',
  'nextLabel',
  'featureLabel',
  'implementationLabel',
])

function fieldMap(block: string): Map<string, string> {
  const trimmed = block.trim().replace(/^#### /, '')
  const fields = new Map<string, string>()
  for (const part of trimmed.split(/\n#### /).filter(Boolean)) {
    const newline = part.indexOf('\n')
    const key = (newline === -1 ? part : part.slice(0, newline)).trim()
    fields.set(key, newline === -1 ? '' : part.slice(newline + 1).trim())
  }
  return fields
}

function requiredText(fields: Map<string, string>, key: string, id: string): string {
  const value = formatMdField(fields.get(key) ?? '')
  if (!value) {
    throw new Error(`03_페이지_문구.md: 프로젝트 "${id}"의 ${key}가 비어 있습니다.`)
  }
  return value
}

function parseStack(block: string, id: string): string[] {
  const stack = block
    .split('\n')
    .map((line) => formatMdField(line))
    .filter(Boolean)
  if (stack.length === 0) {
    throw new Error(`03_페이지_문구.md: 프로젝트 "${id}"의 stack이 비어 있습니다.`)
  }
  return stack
}

function parseHighlight(chunk: string, id: string): ProjectHighlight {
  const newline = chunk.indexOf('\n')
  const feature = (newline === -1 ? chunk : chunk.slice(0, newline)).trim()
  const implementation = formatMdField(newline === -1 ? '' : chunk.slice(newline + 1))
  if (!feature || !implementation) {
    throw new Error(`03_페이지_문구.md: 프로젝트 "${id}"의 기능 설명이 비어 있습니다.`)
  }
  return { feature, implementation }
}

function parseHighlights(block: string, id: string): ProjectHighlight[] {
  const trimmed = block.trim().replace(/^##### /, '')
  if (!trimmed) {
    throw new Error(`03_페이지_문구.md: 프로젝트 "${id}"의 highlights가 비어 있습니다.`)
  }
  return trimmed
    .split(/\n##### /)
    .filter(Boolean)
    .map((chunk) => parseHighlight(chunk, id))
}

function parseProjectBlock(id: string, block: string): ProjectNarrative {
  const fields = fieldMap(block)
  return {
    title: requiredText(fields, 'title', id),
    period: requiredText(fields, 'period', id),
    role: requiredText(fields, 'role', id),
    summary: requiredText(fields, 'summary', id),
    stack: parseStack(fields.get('stack') ?? '', id),
    highlights: parseHighlights(fields.get('highlights') ?? '', id),
    links: parseLinkLines(fields.get('links') ?? '', `프로젝트 "${id}"`),
  }
}

export function parseProjectNarratives(sectionBody: string): Record<string, ProjectNarrative> {
  const items: Record<string, ProjectNarrative> = {}
  const trimmed = sectionBody.trim().replace(/^### /, '')
  for (const chunk of trimmed.split(/\n### /).filter(Boolean)) {
    const newline = chunk.indexOf('\n')
    const id = (newline === -1 ? chunk : chunk.slice(0, newline)).trim()
    if (!id || PAGE_FIELDS.has(id)) {
      continue
    }
    items[id] = parseProjectBlock(id, newline === -1 ? '' : chunk.slice(newline + 1))
  }
  return items
}
