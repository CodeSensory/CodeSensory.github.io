import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { projectItems } from '../../content/projectCatalog'
import { FeaturedProject } from './FeaturedProject'

const sorted = [...projectItems].sort((a, b) => a.featuredOrder - b.featuredOrder)

describe('FeaturedProject', () => {
  it('shows the next project title', async () => {
    render(<FeaturedProject items={sorted} />)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('핵심술기')
    expect(screen.getByRole('link', { name: '사이트' })).toHaveAttribute(
      'href',
      'https://codesensory.github.io/login.html',
    )
    await userEvent.click(screen.getByRole('button', { name: '다음 프로젝트' }))
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('임상실습')
    expect(screen.getByRole('link', { name: '사이트' })).toHaveAttribute(
      'href',
      'https://codesensory.github.io/batch/index.html',
    )
  })
})
