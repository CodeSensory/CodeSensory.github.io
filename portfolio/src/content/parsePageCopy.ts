export type ResearchAxisCopy = {
  title: string
  body: string
}

export type HomeMetricCopy = {
  label: string
  value: string
}

export type PageLeadCopy = {
  title: string
  lead: string
}

export type PublicationsCopy = PageLeadCopy & {
  plannedSectionTitle: string
  abstractEmpty: string
  detailIntroTitle: string
  backToListLabel: string
  bestPaperLabel: string
  abstractLabel: string
  keywordsLabel: string
  statusLabels: Record<ResearchStatus, string>
}

export type PageCopy = {
  site: SiteCopy
  home: {
    eyebrow: string
    tagline: string
    affiliation: string
    metrics: HomeMetricCopy[]
    researchSectionTitle: string
    researchAxes: ResearchAxisCopy[]
    heroAlt: string
    researchCta: string
  }
  research: PageLeadCopy & {
    methodsTitle: string
    howIResearch: string[]
    previousLabel: string
    nextLabel: string
  }
  publications: PublicationsCopy
  projects: PageLeadCopy & {
    previousLabel: string
    nextLabel: string
    featureLabel: string
    implementationLabel: string
    items: Record<string, ProjectNarrative>
  }
  about: AboutCopy
  contact: PageLeadCopy
  papers: Record<string, PaperNarrative>
}

import { formatMdField, splitMdFieldParts } from './mdText'
import { parseAboutCopy, type AboutCopy } from './parseAboutCopy'
import { parsePaperNarratives, type PaperNarrative } from './parsePaperNarratives'
import { parseProjectNarratives, type ProjectNarrative } from './parseProjectNarratives'
import { parseSiteCopy, type SiteCopy } from './parseSiteCopy'
import type { ResearchStatus } from './types'

const PAGE_IDS = ['site', 'home', 'research', 'publications', 'projects', 'about', 'contact'] as const

const HORIZONTAL_RULE_LINE = /^---\s*$/

function normalizeNewlines(markdown: string): string {
  return markdown.replace(/\r\n/g, '\n').replace(/<!--[\s\S]*?-->/g, '')
}

function stripHorizontalRuleLines(text: string): string {
  return text
    .split('\n')
    .filter((line) => !HORIZONTAL_RULE_LINE.test(line.trim()))
    .join('\n')
    .trim()
}

function stripPreamble(markdown: string): string {
  const normalized = normalizeNewlines(markdown).trimStart()
  const pageHeading = /^## (?:site|home|research|publications|projects|about|contact)\s*$/m
  const atStart = normalized.match(pageHeading)
  if (atStart?.index !== undefined) {
    return normalized.slice(atStart.index)
  }
  const nested = normalized.match(/\n## (?:site|home|research|publications|projects|about|contact)\s*$/m)
  if (nested?.index !== undefined) {
    return normalized.slice(nested.index + 1)
  }
  return normalized
}

function splitPageSections(markdown: string): Map<string, string> {
  const sections = new Map<string, string>()
  const body = stripPreamble(markdown)
  const chunks = body.split(/^## /m).filter(Boolean)
  for (const chunk of chunks) {
    const newline = chunk.indexOf('\n')
    const id = (newline === -1 ? chunk : chunk.slice(0, newline)).trim()
    const content = newline === -1 ? '' : chunk.slice(newline + 1)
    sections.set(id, content.trim())
  }
  return sections
}

const STATUS_KEYS = ['published', 'accepted', 'submitted', 'draft', 'planned'] as const

function isStatusKey(key: string): key is ResearchStatus {
  return (STATUS_KEYS as readonly string[]).includes(key)
}

function parseStatusLabels(block: string): Record<ResearchStatus, string> {
  const trimmed = block.trim().replace(/^#### /, '')
  const labels = {} as Record<ResearchStatus, string>
  for (const chunk of trimmed.split(/\n#### /).filter(Boolean)) {
    const newline = chunk.indexOf('\n')
    const key = (newline === -1 ? chunk : chunk.slice(0, newline)).trim()
    const value = formatMdField(newline === -1 ? '' : chunk.slice(newline + 1))
    if (!isStatusKey(key) || !value) {
      throw new Error('03_페이지_문구.md: statusLabels 형식이 올바르지 않습니다.')
    }
    labels[key] = value
  }
  for (const key of STATUS_KEYS) {
    if (!labels[key]) {
      throw new Error(`03_페이지_문구.md: statusLabels.${key}가 없습니다.`)
    }
  }
  return labels
}

function parsePublications(fields: Map<string, string>): PublicationsCopy {
  return {
    ...parsePageLead(fields),
    plannedSectionTitle: fieldText(fields, 'plannedSectionTitle'),
    abstractEmpty: fieldText(fields, 'abstractEmpty'),
    detailIntroTitle: fieldText(fields, 'detailIntroTitle'),
    backToListLabel: fieldText(fields, 'backToListLabel'),
    bestPaperLabel: fieldText(fields, 'bestPaperLabel'),
    abstractLabel: fieldText(fields, 'abstractLabel'),
    keywordsLabel: fieldText(fields, 'keywordsLabel'),
    statusLabels: parseStatusLabels(fields.get('statusLabels') ?? ''),
  }
}

function splitFields(sectionBody: string): Map<string, string> {
  const fields = new Map<string, string>()
  const trimmed = sectionBody.trim().replace(/^### /, '')
  const parts = trimmed.split(/\n### /).filter(Boolean)
  for (const part of parts) {
    const newline = part.indexOf('\n')
    const key = (newline === -1 ? part : part.slice(0, newline)).trim()
    const rawValue = newline === -1 ? '' : part.slice(newline + 1)
    fields.set(key, stripHorizontalRuleLines(rawValue))
  }
  return fields
}

function fieldText(fields: Map<string, string>, key: string): string {
  const raw = fields.get(key)?.trim() ?? ''
  if (!raw) {
    throw new Error(`03_페이지_문구.md: "${key}" 항목이 비어 있습니다.`)
  }
  return formatMdField(raw)
}

function parseResearchAxes(block: string): ResearchAxisCopy[] {
  const trimmed = block.trim().replace(/^#### /, '')
  const chunks = trimmed.split(/\n#### /).filter(Boolean)
  return chunks.map((chunk) => {
    const newline = chunk.indexOf('\n')
    const title = (newline === -1 ? chunk : chunk.slice(0, newline)).trim()
    const body = formatMdField(
      stripHorizontalRuleLines(newline === -1 ? '' : chunk.slice(newline + 1)),
    )
    if (!title || !body) {
      throw new Error('03_페이지_문구.md: researchAxes 카드 형식이 올바르지 않습니다.')
    }
    return { title, body }
  })
}

function parsePageLead(fields: Map<string, string>): PageLeadCopy {
  return {
    title: fieldText(fields, 'title'),
    lead: fieldText(fields, 'lead'),
  }
}

function parseHomeMetrics(block: string): HomeMetricCopy[] {
  const trimmed = block.trim().replace(/^#### /, '')
  const chunks = trimmed.split(/\n#### /).filter(Boolean)
  const metrics = chunks.map((chunk) => {
    const newline = chunk.indexOf('\n')
    const label = (newline === -1 ? chunk : chunk.slice(0, newline)).trim()
    const value = formatMdField(
      stripHorizontalRuleLines(newline === -1 ? '' : chunk.slice(newline + 1)),
    )
    if (!label || !value) {
      throw new Error('03_페이지_문구.md: metrics 칸 형식이 올바르지 않습니다.')
    }
    return { label, value }
  })
  if (metrics.length === 0) {
    throw new Error('03_페이지_문구.md: home.metrics가 비어 있습니다.')
  }
  return metrics
}

function parseHome(fields: Map<string, string>): PageCopy['home'] {
  const researchAxes = parseResearchAxes(fields.get('researchAxes') ?? '')
  if (researchAxes.length === 0) {
    throw new Error('03_페이지_문구.md: home.researchAxes가 비어 있습니다.')
  }
  return {
    eyebrow: fieldText(fields, 'eyebrow'),
    tagline: fieldText(fields, 'tagline'),
    affiliation: fieldText(fields, 'affiliation'),
    metrics: parseHomeMetrics(fields.get('metrics') ?? ''),
    researchSectionTitle: fieldText(fields, 'researchSectionTitle'),
    researchAxes,
    heroAlt: fieldText(fields, 'heroAlt'),
    researchCta: fieldText(fields, 'researchCta'),
  }
}

function parseResearch(fields: Map<string, string>): PageCopy['research'] {
  return {
    ...parsePageLead(fields),
    methodsTitle: fieldText(fields, 'methodsTitle'),
    howIResearch: splitMdFieldParts(fields.get('howIResearch') ?? '', '\n\n'),
    previousLabel: fieldText(fields, 'previousLabel'),
    nextLabel: fieldText(fields, 'nextLabel'),
  }
}

function parseProjectsSection(projectsBody: string): PageCopy['projects'] {
  const fields = splitFields(projectsBody)
  return {
    ...parsePageLead(fields),
    previousLabel: fieldText(fields, 'previousLabel'),
    nextLabel: fieldText(fields, 'nextLabel'),
    featureLabel: fieldText(fields, 'featureLabel'),
    implementationLabel: fieldText(fields, 'implementationLabel'),
    items: parseProjectNarratives(projectsBody),
  }
}

function requireSection(sections: Map<string, string>, id: string): string {
  const body = sections.get(id)
  if (!body) {
    throw new Error(`03_페이지_문구.md: "## ${id}" 섹션이 없습니다.`)
  }
  return body
}

export function parsePageCopy(markdown: string): PageCopy {
  const sections = splitPageSections(markdown)
  for (const id of PAGE_IDS) {
    requireSection(sections, id)
  }
  const papersBody = requireSection(sections, 'papers')
  const projectsBody = requireSection(sections, 'projects')
  return {
    site: parseSiteCopy(splitFields(sections.get('site')!)),
    home: parseHome(splitFields(sections.get('home')!)),
    research: parseResearch(splitFields(sections.get('research')!)),
    publications: parsePublications(splitFields(sections.get('publications')!)),
    projects: parseProjectsSection(projectsBody),
    about: parseAboutCopy(splitFields(sections.get('about')!)),
    contact: parsePageLead(splitFields(sections.get('contact')!)),
    papers: parsePaperNarratives(papersBody),
  }
}
