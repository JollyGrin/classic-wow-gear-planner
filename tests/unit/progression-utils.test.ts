import { describe, it, expect } from 'vitest'
import {
  SLOT_GROUP_ORDER,
  getPopulatedSlots,
  computeLevelBuckets,
  computeEquippedAtLevel,
  aggregateStats,
  formatSource,
  formatDropChance,
} from '@/app/lib/progression-utils'
import type { Item } from '@/app/lib/types'

const makeItem = (overrides: Partial<Item> = {}): Item => ({
  itemId: 1,
  name: 'Test Item',
  icon: 'test',
  class: 'Armor',
  subclass: 'Leather',
  sellPrice: 0,
  quality: 'Rare',
  itemLevel: 20,
  requiredLevel: 10,
  slot: 'Head',
  tooltip: [],
  itemLink: '',
  contentPhase: 1,
  source: null,
  uniqueName: 'test-item',
  stats: {},
  ...overrides,
})

describe('SLOT_GROUP_ORDER', () => {
  it('contains all equipment slots grouped like WoW paperdoll', () => {
    expect(SLOT_GROUP_ORDER).toContain('Head')
    expect(SLOT_GROUP_ORDER).toContain('Neck')
    expect(SLOT_GROUP_ORDER).toContain('Shoulder')
    expect(SLOT_GROUP_ORDER).toContain('Back')
    expect(SLOT_GROUP_ORDER).toContain('Chest')
    expect(SLOT_GROUP_ORDER).toContain('Wrist')
    expect(SLOT_GROUP_ORDER).toContain('Hands')
    expect(SLOT_GROUP_ORDER).toContain('Waist')
    expect(SLOT_GROUP_ORDER).toContain('Legs')
    expect(SLOT_GROUP_ORDER).toContain('Feet')
    expect(SLOT_GROUP_ORDER).toContain('Finger')
    expect(SLOT_GROUP_ORDER).toContain('Trinket')
    expect(SLOT_GROUP_ORDER).toContain('Main Hand')
    expect(SLOT_GROUP_ORDER).toContain('Off Hand')
    expect(SLOT_GROUP_ORDER).toContain('Ranged')
  })

  it('has Head before Hands (armor-left before armor-right)', () => {
    expect(SLOT_GROUP_ORDER.indexOf('Head')).toBeLessThan(
      SLOT_GROUP_ORDER.indexOf('Hands')
    )
  })

  it('has Finger before Main Hand (accessories before weapons)', () => {
    expect(SLOT_GROUP_ORDER.indexOf('Finger')).toBeLessThan(
      SLOT_GROUP_ORDER.indexOf('Main Hand')
    )
  })
})

describe('getPopulatedSlots', () => {
  it('returns empty array for no items', () => {
    expect(getPopulatedSlots([])).toEqual([])
  })

  it('returns only slots that have items, in group order', () => {
    const items = [
      makeItem({ slot: 'Chest', itemId: 1 }),
      makeItem({ slot: 'Head', itemId: 2 }),
    ]
    const result = getPopulatedSlots(items)
    expect(result).toEqual(['Head', 'Chest'])
  })

  it('normalizes One-Hand to Main Hand', () => {
    const items = [makeItem({ slot: 'One-Hand', itemId: 1 })]
    const result = getPopulatedSlots(items)
    expect(result).toContain('Main Hand')
  })

  it('normalizes Two-Hand to Main Hand', () => {
    const items = [makeItem({ slot: 'Two-Hand', itemId: 1 })]
    const result = getPopulatedSlots(items)
    expect(result).toContain('Main Hand')
  })

  it('deduplicates slots', () => {
    const items = [
      makeItem({ slot: 'Head', itemId: 1 }),
      makeItem({ slot: 'Head', itemId: 2 }),
    ]
    const result = getPopulatedSlots(items)
    expect(result).toEqual(['Head'])
  })
})

describe('computeLevelBuckets', () => {
  it('returns empty for no items', () => {
    expect(computeLevelBuckets([])).toEqual([])
  })

  it('creates item rows for levels with items', () => {
    const items = [
      makeItem({ requiredLevel: 5, itemId: 1 }),
      makeItem({ requiredLevel: 10, itemId: 2 }),
    ]
    const buckets = computeLevelBuckets(items)
    const itemBuckets = buckets.filter((b) => b.type === 'items')
    expect(itemBuckets).toHaveLength(2)
    expect(itemBuckets[0].level).toBe(5)
    expect(itemBuckets[1].level).toBe(10)
  })

  it('creates gap rows between levels', () => {
    const items = [
      makeItem({ requiredLevel: 5, itemId: 1 }),
      makeItem({ requiredLevel: 10, itemId: 2 }),
    ]
    const buckets = computeLevelBuckets(items)
    const gaps = buckets.filter((b) => b.type === 'gap')
    expect(gaps).toHaveLength(1)
    expect(gaps[0].startLevel).toBe(6)
    expect(gaps[0].endLevel).toBe(9)
  })

  it('does not create gaps for consecutive levels', () => {
    const items = [
      makeItem({ requiredLevel: 5, itemId: 1 }),
      makeItem({ requiredLevel: 6, itemId: 2 }),
    ]
    const buckets = computeLevelBuckets(items)
    const gaps = buckets.filter((b) => b.type === 'gap')
    expect(gaps).toHaveLength(0)
  })

  it('groups items at the same level', () => {
    const items = [
      makeItem({ requiredLevel: 10, slot: 'Head', itemId: 1 }),
      makeItem({ requiredLevel: 10, slot: 'Chest', itemId: 2 }),
    ]
    const buckets = computeLevelBuckets(items)
    const itemBuckets = buckets.filter((b) => b.type === 'items')
    expect(itemBuckets).toHaveLength(1)
    expect(itemBuckets[0].items).toHaveLength(2)
  })
})

describe('computeEquippedAtLevel', () => {
  it('returns empty map for no items', () => {
    const result = computeEquippedAtLevel([], 10)
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('equips items at or below selected level', () => {
    const items = [
      makeItem({ requiredLevel: 5, slot: 'Head', itemId: 1, name: 'Low Head' }),
      makeItem({ requiredLevel: 15, slot: 'Head', itemId: 2, name: 'High Head' }),
    ]
    const result = computeEquippedAtLevel(items, 10)
    expect(result['Head']).toHaveLength(1)
    expect(result['Head'][0].name).toBe('Low Head')
  })

  it('picks highest requiredLevel item at or below selected level', () => {
    const items = [
      makeItem({ requiredLevel: 5, slot: 'Head', itemId: 1, itemLevel: 10, name: 'Early Head' }),
      makeItem({ requiredLevel: 8, slot: 'Head', itemId: 2, itemLevel: 15, name: 'Better Head' }),
      makeItem({ requiredLevel: 15, slot: 'Head', itemId: 3, itemLevel: 25, name: 'Late Head' }),
    ]
    const result = computeEquippedAtLevel(items, 10)
    expect(result['Head']).toHaveLength(1)
    expect(result['Head'][0].name).toBe('Better Head')
  })

  it('tiebreaks by itemLevel when requiredLevel is same', () => {
    const items = [
      makeItem({ requiredLevel: 10, slot: 'Head', itemId: 1, itemLevel: 15, name: 'Low iLvl' }),
      makeItem({ requiredLevel: 10, slot: 'Head', itemId: 2, itemLevel: 25, name: 'High iLvl' }),
    ]
    const result = computeEquippedAtLevel(items, 10)
    expect(result['Head'][0].name).toBe('High iLvl')
  })

  it('allows 2 Finger items', () => {
    const items = [
      makeItem({ requiredLevel: 5, slot: 'Finger', itemId: 1, name: 'Ring 1' }),
      makeItem({ requiredLevel: 8, slot: 'Finger', itemId: 2, name: 'Ring 2' }),
    ]
    const result = computeEquippedAtLevel(items, 10)
    expect(result['Finger']).toHaveLength(2)
  })

  it('allows 2 Trinket items', () => {
    const items = [
      makeItem({ requiredLevel: 5, slot: 'Trinket', itemId: 1, name: 'Trinket 1' }),
      makeItem({ requiredLevel: 8, slot: 'Trinket', itemId: 2, name: 'Trinket 2' }),
    ]
    const result = computeEquippedAtLevel(items, 10)
    expect(result['Trinket']).toHaveLength(2)
  })

  it('picks best 2 for dual-equip slots when more items available', () => {
    const items = [
      makeItem({ requiredLevel: 5, slot: 'Finger', itemId: 1, itemLevel: 10, name: 'Ring A' }),
      makeItem({ requiredLevel: 8, slot: 'Finger', itemId: 2, itemLevel: 15, name: 'Ring B' }),
      makeItem({ requiredLevel: 10, slot: 'Finger', itemId: 3, itemLevel: 20, name: 'Ring C' }),
    ]
    const result = computeEquippedAtLevel(items, 10)
    expect(result['Finger']).toHaveLength(2)
    expect(result['Finger'].map((i) => i.name)).toEqual(['Ring C', 'Ring B'])
  })

  it('normalizes One-Hand to Main Hand', () => {
    const items = [
      makeItem({ requiredLevel: 5, slot: 'One-Hand', itemId: 1 }),
    ]
    const result = computeEquippedAtLevel(items, 10)
    expect(result['Main Hand']).toHaveLength(1)
  })
})

describe('aggregateStats', () => {
  it('returns all zeros for empty equipped map', () => {
    const result = aggregateStats({})
    expect(result.stamina).toBe(0)
    expect(result.armor).toBe(0)
  })

  it('sums stats across all equipped items', () => {
    const equipped = {
      Head: [makeItem({ stats: { stamina: 10, agility: 5 } })],
      Chest: [makeItem({ stats: { stamina: 15, strength: 8 } })],
    }
    const result = aggregateStats(equipped)
    expect(result.stamina).toBe(25)
    expect(result.agility).toBe(5)
    expect(result.strength).toBe(8)
  })

  it('handles items with no stats gracefully', () => {
    const equipped = {
      Head: [makeItem({ stats: {} })],
    }
    const result = aggregateStats(equipped)
    expect(result.stamina).toBe(0)
  })
})

describe('formatSource', () => {
  it('returns dash for items with no source', () => {
    const item = makeItem({ source: null })
    expect(formatSource(item)).toBe('—')
  })

  it('formats Boss Drop with name', () => {
    const item = makeItem({
      source: { category: 'Boss Drop', name: 'Ragnaros', dropChance: 0.15 },
    })
    expect(formatSource(item)).toBe('Ragnaros')
  })

  it('formats Quest with quest name', () => {
    const item = makeItem({
      source: {
        category: 'Quest',
        quests: [{ questId: 1, name: 'Sweet Amber', faction: 'Both' }],
      },
    })
    expect(formatSource(item)).toBe('Q: Sweet Amber')
  })

  it('formats Vendor with name', () => {
    const item = makeItem({
      source: { category: 'Vendor', name: 'Fargon Mortalak', faction: 'Both' },
    })
    expect(formatSource(item)).toBe('Vendor: Fargon Mortalak')
  })

  it('formats Rare Drop with name', () => {
    const item = makeItem({
      source: { category: 'Rare Drop', name: 'Shadowfang', dropChance: 0.005 },
    })
    expect(formatSource(item)).toBe('Shadowfang')
  })

  it('falls back to category when no name', () => {
    const item = makeItem({
      source: { category: 'Zone Drop', dropChance: 0.01 },
    })
    expect(formatSource(item)).toBe('Zone Drop')
  })
})

describe('formatDropChance', () => {
  it('formats as percentage', () => {
    expect(formatDropChance(0.0131)).toBe('1.3%')
  })

  it('handles small values', () => {
    expect(formatDropChance(0.005)).toBe('0.5%')
  })

  it('handles 100%', () => {
    expect(formatDropChance(1)).toBe('100%')
  })

  it('returns empty string for undefined', () => {
    expect(formatDropChance(undefined)).toBe('')
  })
})
