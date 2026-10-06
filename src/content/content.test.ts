import { describe, expect, it } from 'vitest'
import { researchItems } from './research'
import { getListedPublications } from './researchCatalog'
import { projectItems } from './projectCatalog'
import { statusLabel } from './statusLabel'
import { profile } from './profile'

describe('portfolio content', () => {
  it('maps every status to the allowed badge', () => {
    expect(statusLabel('published')).toBe('게재')
    expect(statusLabel('accepted')).toBe('채택')
    expect(statusLabel('submitted')).toBe('심사 중')
    expect(statusLabel('draft')).toBe('작성 중')
    expect(statusLabel('planned')).toBe('예정')
  })

  it('features wearable, pathology, and fundus research without CIELAB', () => {
    const featured = researchItems
      .filter((item) => item.featured)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    expect(featured.map((item) => item.id)).toEqual([
      'ksmi-2026-wearable-colormap',
      'cbm-pathology-ssl',
      'fundus-graph-xai-llm',
    ])
  })

  it('lists the pathology draft before the CIELAB paper among 2026 publications', () => {
    const ids = getListedPublications().map((item) => item.id)
    expect(ids.indexOf('cbm-pathology-ssl')).toBeLessThan(ids.indexOf('ckaia-2026-cielab'))
  })

  it('links only the Applied Sciences DOI', () => {
    const linked = researchItems.filter((item) => item.links.length > 0)
    expect(linked.map((item) => item.id)).toEqual(['pub-crosswalk-applsci'])
    expect(linked[0]?.links[0]?.href).toBe('https://doi.org/10.3390/app13074291')
  })

  it('links each project to its live service', () => {
    expect(projectItems.map((item) => item.id)).toEqual([
      'nursing-grade-gwnu',
      'nursing-clinical-batch',
    ])
    const hrefs = projectItems.flatMap((item) => item.links.map((link) => link.href))
    expect(hrefs).toEqual([
      'https://codesensory.github.io/login.html',
      'https://codesensory.github.io/batch/index.html',
    ])
  })

  it('does not publish phone or the previous university name', () => {
    const blob = JSON.stringify(profile)
    expect(blob).not.toContain('5692')
    expect(blob).not.toContain('5540')
    expect(blob).not.toContain('Bible')
    expect(blob).not.toContain('성서')
  })
})
