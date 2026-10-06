import { formatMdField } from './mdText'
import type { ContentLink } from './types'

function parseLinkLine(line: string, owner: string): ContentLink {
  const space = line.indexOf(' ')
  const label = space === -1 ? '' : line.slice(0, space).trim()
  const href = space === -1 ? '' : line.slice(space + 1).trim()
  if (!label || !href.startsWith('http')) {
    throw new Error(`03_페이지_문구.md: ${owner}의 links 형식이 올바르지 않습니다.`)
  }
  return { label, href }
}

export function parseLinkLines(block: string, owner: string): ContentLink[] {
  const lines = block
    .split('\n')
    .map((line) => formatMdField(line))
    .filter(Boolean)
  return lines.map((line) => parseLinkLine(line, owner))
}
