import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getFeaturedResearchItems } from '../../content/researchCatalog'
import { FeaturedResearch } from './FeaturedResearch'

const featured = getFeaturedResearchItems()

describe('FeaturedResearch', () => {
  it('shows the next featured paper', async () => {
    render(<FeaturedResearch items={featured} />)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Color-Encoding')
    await userEvent.click(screen.getByRole('button', { name: '다음 연구' }))
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Self-Supervised')
  })
})
