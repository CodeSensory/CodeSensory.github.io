import { describe, expect, it } from 'vitest'
import { pageCopy } from './pageCopy'

describe('pageCopy from 03_페이지_문구.md', () => {
  it('loads home tagline and four research axes', () => {
    expect(pageCopy.home.tagline).toContain('CNN')
    expect(pageCopy.home.affiliation.length).toBeGreaterThan(0)
    expect(pageCopy.home.metrics).toHaveLength(4)
    expect(pageCopy.home.metrics.every((metric) => metric.label && metric.value)).toBe(true)
    expect(pageCopy.home.researchAxes).toHaveLength(4)
    expect(pageCopy.home.researchAxes.map((axis) => axis.title)).toEqual([
      'Computer Vision',
      'Medical Image Analysis',
      'Self-supervised Learning',
      'LLM and Reinforcement Learning',
    ])
  })

  it('splits about paragraphs and research steps on escaped newlines', () => {
    expect(pageCopy.about.paragraphs).toHaveLength(2)
    expect(pageCopy.about.paragraphs[0]).toContain('\n')
    expect(pageCopy.about.howIResearch).toHaveLength(3)
    expect(pageCopy.research.howIResearch).toEqual(pageCopy.about.howIResearch)
    expect(pageCopy.research.howIResearch[0]).toContain('의학 데이터')
    expect(pageCopy.about.keywords.length).toBeGreaterThan(0)
    expect(pageCopy.about.skills.length).toBeGreaterThan(0)
    expect(pageCopy.about.experience.length).toBeGreaterThan(0)
    expect(pageCopy.about.education.length).toBeGreaterThan(0)
    expect(pageCopy.about.awards.length).toBeGreaterThan(0)
    expect(pageCopy.about.experience.every((entry) => entry.period && entry.body)).toBe(true)
  })

  it('does not leak markdown horizontal rules into copy', () => {
    const blob = JSON.stringify(pageCopy)
    expect(blob).not.toContain('---')
  })

  it('loads page leads and paper narratives', () => {
    expect(pageCopy.research.title).toBe('연구')
    expect(pageCopy.publications.lead).toContain('Abstract')
    expect(pageCopy.contact.lead).toContain('이메일')
    const grade = pageCopy.projects.items['nursing-grade-gwnu']
    expect(grade?.title).toContain('핵심술기')
    expect(grade?.summary).toContain('\n')
    expect(grade?.stack).toContain('Firestore')
    expect(grade?.highlights[0]?.implementation).toContain('파서')
    expect(pageCopy.projects.items['nursing-clinical-batch']?.title).toContain('임상실습')
    const wearable = pageCopy.papers['ksmi-2026-wearable-colormap']
    expect(wearable?.summary).toContain('colormap')
    expect(wearable?.title.length).toBeGreaterThan(0)
    expect(wearable?.authors.length).toBeGreaterThan(0)
    expect(wearable?.venue.length).toBeGreaterThan(0)
    expect(wearable?.year).toBeGreaterThan(2000)
    expect(pageCopy.publications.statusLabels.submitted.length).toBeGreaterThan(0)
    expect(pageCopy.publications.bestPaperLabel.length).toBeGreaterThan(0)
    const cielab = pageCopy.papers['ckaia-2026-cielab']
    expect(cielab?.summary).toContain('\n')
    expect(cielab?.abstract).not.toContain('\n')
    expect(cielab?.abstract).toContain('. ')
    expect(pageCopy.papers['pub-crosswalk-icaeic']?.abstract).toContain('Mask R-CNN')
    expect(pageCopy.papers['pub-crosswalk-applsci']?.keywords).toContain('crosswalk')
    expect(pageCopy.site.certify).toContain('September 28, 2026')
    expect(pageCopy.site.nav.map((item) => item.label)).toEqual([
      '홈',
      '연구',
      '논문',
      '프로젝트',
      '소개',
      '연락',
    ])
    expect(pageCopy.home.researchCta).toBe('연구 보기')
    expect(pageCopy.papers['cbm-pathology-ssl']?.status).toBe('draft')
    expect(pageCopy.papers['ksmi-2026-wearable-colormap']?.featuredOrder).toBe(1)
    expect(pageCopy.papers['pub-crosswalk-applsci']?.links[0]?.href).toContain('doi.org')
    expect(pageCopy.papers['pub-crosswalk-icaeic']?.showBestPaper).toBe(true)
    expect(pageCopy.projects.items['nursing-grade-gwnu']?.links[0]?.label).toBe('사이트')
  })
})
