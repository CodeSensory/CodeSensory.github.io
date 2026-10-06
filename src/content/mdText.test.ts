import { describe, expect, it } from 'vitest'
import { formatMdField, splitMdFieldParts } from './mdText'

describe('mdText', () => {
  it('turns literal \\n into line breaks only', () => {
    expect(formatMdField('한 줄\\n둘째 줄')).toBe('한 줄\n둘째 줄')
    expect(formatMdField('앞줄\\n\n뒷줄')).toBe('앞줄\n뒷줄')
    expect(formatMdField('물리 줄바꿈\n은 공백')).toBe('물리 줄바꿈 은 공백')
  })

  it('splits list parts on escaped newlines', () => {
    const parts = splitMdFieldParts('첫째\\n둘째\\n셋째', '\n')
    expect(parts).toEqual(['첫째', '둘째', '셋째'])
  })
})
