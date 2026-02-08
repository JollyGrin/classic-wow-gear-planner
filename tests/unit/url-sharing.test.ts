import { describe, it, expect } from 'vitest'
import { encodeBisList, decodeBisList } from '@/app/lib/url-sharing'

describe('encodeBisList', () => {
  it('encodes empty array to empty string', () => {
    expect(encodeBisList([])).toBe('')
  })

  it('encodes single item', () => {
    expect(encodeBisList([123])).toBe('#bis=123')
  })

  it('encodes multiple items', () => {
    expect(encodeBisList([1, 2, 3])).toBe('#bis=1,2,3')
  })
})

describe('decodeBisList', () => {
  it('decodes empty string to empty array', () => {
    expect(decodeBisList('')).toEqual([])
  })

  it('decodes empty hash to empty array', () => {
    expect(decodeBisList('#')).toEqual([])
  })

  it('decodes single item', () => {
    expect(decodeBisList('#bis=123')).toEqual([123])
  })

  it('decodes multiple items', () => {
    expect(decodeBisList('#bis=1,2,3')).toEqual([1, 2, 3])
  })

  it('filters out invalid numbers', () => {
    expect(decodeBisList('#bis=1,abc,3')).toEqual([1, 3])
  })

  it('filters out zero and negative numbers', () => {
    expect(decodeBisList('#bis=1,0,-1,3')).toEqual([1, 3])
  })

  it('handles unrelated hash', () => {
    expect(decodeBisList('#something-else')).toEqual([])
  })
})
