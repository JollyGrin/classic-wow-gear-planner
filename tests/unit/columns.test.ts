import { describe, it, expect } from 'vitest'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { columns, QUALITY_ORDER, QUALITY_COLORS, qualitySortingFn } from '@/app/components/items/columns'
import type { Item } from '@/app/lib/types'

const makeItem = (overrides: Partial<Item> = {}): Item => ({
  itemId: 1,
  name: 'Test Item',
  icon: 'inv_sword_01',
  class: 'Weapon',
  subclass: 'Sword',
  sellPrice: 1000,
  quality: 'Rare',
  itemLevel: 60,
  requiredLevel: 55,
  slot: 'One-Hand',
  tooltip: [],
  itemLink: '',
  contentPhase: 1,
  source: { category: 'Boss Drop', dropChance: 0.15 },
  uniqueName: 'test-item',
  stats: {},
  ...overrides,
})

type ColDef = ColumnDef<Item, unknown> & { accessorFn?: (item: Item) => unknown }

function findColumn(id: string): ColDef | undefined {
  return columns.find((c) => c.id === id) as ColDef | undefined
}

describe('columns', () => {
  it('produces the correct number of column definitions', () => {
    expect(columns).toHaveLength(17)
  })

  it('has item column as first', () => {
    expect(columns[0].id).toBe('item')
  })
})

describe('QUALITY_ORDER', () => {
  it('orders qualities from lowest to highest', () => {
    expect(QUALITY_ORDER).toEqual(['Uncommon', 'Rare', 'Epic', 'Legendary', 'Heirloom'])
  })
})

describe('QUALITY_COLORS', () => {
  it('has a color for each quality', () => {
    expect(QUALITY_COLORS).toHaveProperty('Uncommon')
    expect(QUALITY_COLORS).toHaveProperty('Rare')
    expect(QUALITY_COLORS).toHaveProperty('Epic')
    expect(QUALITY_COLORS).toHaveProperty('Legendary')
    expect(QUALITY_COLORS).toHaveProperty('Heirloom')
  })
})

describe('stat accessors', () => {
  it('returns undefined for 0 stat values', () => {
    const item = makeItem({ stats: { stamina: 0 } })
    const staminaCol = findColumn('stamina')
    expect(staminaCol).toBeDefined()
    expect(staminaCol!.accessorFn!(item)).toBeUndefined()
  })

  it('returns the stat value for non-zero values', () => {
    const item = makeItem({ stats: { stamina: 25 } })
    const staminaCol = findColumn('stamina')
    expect(staminaCol!.accessorFn!(item)).toBe(25)
  })

  it('returns undefined when stat is not present', () => {
    const item = makeItem({ stats: {} })
    const staminaCol = findColumn('stamina')
    expect(staminaCol!.accessorFn!(item)).toBeUndefined()
  })
})

describe('qualitySortingFn', () => {
  it('sorts Uncommon before Rare', () => {
    const rowA = { original: makeItem({ quality: 'Uncommon' }) } as Row<Item>
    const rowB = { original: makeItem({ quality: 'Rare' }) } as Row<Item>
    expect(qualitySortingFn(rowA, rowB, '')).toBeLessThan(0)
  })

  it('sorts Epic after Rare', () => {
    const rowA = { original: makeItem({ quality: 'Epic' }) } as Row<Item>
    const rowB = { original: makeItem({ quality: 'Rare' }) } as Row<Item>
    expect(qualitySortingFn(rowA, rowB, '')).toBeGreaterThan(0)
  })

  it('returns 0 for same quality', () => {
    const rowA = { original: makeItem({ quality: 'Rare' }) } as Row<Item>
    const rowB = { original: makeItem({ quality: 'Rare' }) } as Row<Item>
    expect(qualitySortingFn(rowA, rowB, '')).toBe(0)
  })
})
