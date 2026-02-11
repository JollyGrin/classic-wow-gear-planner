import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ItemsService, parseStatsFromTooltip } from '@/app/lib/items-service'
import type { Item } from '@/app/lib/types'

const mockItems: Item[] = [
  {
    itemId: 1,
    name: 'Sword of Testing',
    icon: 'inv_sword_01',
    class: 'Weapon',
    subclass: 'Sword',
    sellPrice: 1000,
    quality: 'Rare',
    itemLevel: 60,
    requiredLevel: 55,
    slot: 'One-Hand',
    tooltip: [{ label: 'Sword of Testing' }],
    itemLink: '|cff0070dd|Hitem:1|h[Sword of Testing]|h|r',
    contentPhase: 1,
    source: { category: 'Boss Drop', dropChance: 0.15 },
    uniqueName: 'sword-of-testing',
    stats: { stamina: 10 },
  },
  {
    itemId: 2,
    name: 'Epic Staff of Power',
    icon: 'inv_staff_01',
    class: 'Weapon',
    subclass: 'Staff',
    sellPrice: 5000,
    quality: 'Epic',
    itemLevel: 63,
    requiredLevel: 60,
    slot: 'Two-Hand',
    tooltip: [{ label: 'Epic Staff of Power' }],
    itemLink: '|cffa335ee|Hitem:2|h[Epic Staff of Power]|h|r',
    contentPhase: 2,
    source: { category: 'Boss Drop', dropChance: 0.05 },
    uniqueName: 'epic-staff-of-power',
    stats: { intellect: 30 },
  },
  {
    itemId: 3,
    name: 'Helmet of Valor',
    icon: 'inv_helm_01',
    class: 'Armor',
    subclass: 'Plate',
    sellPrice: 2000,
    quality: 'Rare',
    itemLevel: 58,
    requiredLevel: 52,
    slot: 'Head',
    tooltip: [{ label: 'Helmet of Valor' }],
    itemLink: '|cff0070dd|Hitem:3|h[Helmet of Valor]|h|r',
    contentPhase: 1,
    source: { category: 'Quest' },
    uniqueName: 'helmet-of-valor',
    stats: { armor: 200, strength: 15 },
  },
  {
    itemId: 4,
    name: 'Cloth Robe',
    icon: 'inv_chest_cloth_01',
    class: 'Armor',
    subclass: 'Cloth',
    sellPrice: 500,
    quality: 'Uncommon',
    itemLevel: 20,
    requiredLevel: 15,
    slot: 'Chest',
    tooltip: [{ label: 'Cloth Robe' }],
    itemLink: '|cff1eff00|Hitem:4|h[Cloth Robe]|h|r',
    contentPhase: 1,
    source: { category: 'Vendor' },
    uniqueName: 'cloth-robe',
    stats: { armor: 50 },
  },
]

describe('ItemsService', () => {
  let service: ItemsService

  beforeEach(() => {
    service = new ItemsService()
    // Inject mock data directly for testing
    service['items'] = mockItems
    service['loaded'] = true
  })

  describe('getItems', () => {
    it('returns all items', () => {
      const items = service.getItems()
      expect(items).toHaveLength(4)
    })

    it('returns a copy of items array', () => {
      const items1 = service.getItems()
      const items2 = service.getItems()
      expect(items1).not.toBe(items2)
      expect(items1).toEqual(items2)
    })
  })

  describe('getItemById', () => {
    it('returns item by id', () => {
      const item = service.getItemById(1)
      expect(item?.name).toBe('Sword of Testing')
    })

    it('returns undefined for non-existent id', () => {
      const item = service.getItemById(999)
      expect(item).toBeUndefined()
    })
  })

  describe('searchItems', () => {
    it('searches by name case-insensitively', () => {
      const results = service.searchItems('sword')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Sword of Testing')
    })

    it('searches by partial name', () => {
      const results = service.searchItems('of')
      expect(results).toHaveLength(3) // Sword of Testing, Epic Staff of Power, Helmet of Valor
    })

    it('returns empty array for no matches', () => {
      const results = service.searchItems('nonexistent')
      expect(results).toHaveLength(0)
    })

    it('handles empty query', () => {
      const results = service.searchItems('')
      expect(results).toHaveLength(4)
    })
  })

  describe('filterItems', () => {
    it('filters by slot', () => {
      const results = service.filterItems({ slot: 'Head' })
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Helmet of Valor')
    })

    it('filters by item class', () => {
      const results = service.filterItems({ class: 'Weapon' })
      expect(results).toHaveLength(2)
    })

    it('filters by quality', () => {
      const results = service.filterItems({ quality: 'Epic' })
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Epic Staff of Power')
    })

    it('filters by min level', () => {
      const results = service.filterItems({ minLevel: 55 })
      expect(results).toHaveLength(2) // items with requiredLevel >= 55
    })

    it('filters by max level', () => {
      const results = service.filterItems({ maxLevel: 52 })
      expect(results).toHaveLength(2) // items with requiredLevel <= 52
    })

    it('filters by level range', () => {
      const results = service.filterItems({ minLevel: 50, maxLevel: 56 })
      expect(results).toHaveLength(2) // items 1 (55) and 3 (52)
    })

    it('filters by source category', () => {
      const results = service.filterItems({ sourceCategory: 'Quest' })
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Helmet of Valor')
    })

    it('combines multiple filters', () => {
      const results = service.filterItems({
        class: 'Weapon',
        quality: 'Rare',
      })
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Sword of Testing')
    })

    it('returns all items with empty filters', () => {
      const results = service.filterItems({})
      expect(results).toHaveLength(4)
    })
  })

  describe('singleton pattern', () => {
    it('getInstance returns same instance', () => {
      const instance1 = ItemsService.getInstance()
      const instance2 = ItemsService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })
})

describe('parseStatsFromTooltip', () => {
  it('parses armor', () => {
    const tooltip = [{ label: '62 Armor' }]
    expect(parseStatsFromTooltip(tooltip)).toEqual({ armor: 62 })
  })

  it('parses primary stats', () => {
    const tooltip = [
      { label: '+8 Strength' },
      { label: '+7 Stamina' },
      { label: '+10 Agility' },
    ]
    expect(parseStatsFromTooltip(tooltip)).toEqual({
      strength: 8,
      stamina: 7,
      agility: 10,
    })
  })

  it('parses intellect and spirit', () => {
    const tooltip = [
      { label: '+15 Intellect' },
      { label: '+12 Spirit' },
    ]
    expect(parseStatsFromTooltip(tooltip)).toEqual({
      intellect: 15,
      spirit: 12,
    })
  })

  it('parses resistances', () => {
    const tooltip = [
      { label: '+10 Fire Resistance' },
      { label: '+15 Nature Resistance' },
    ]
    expect(parseStatsFromTooltip(tooltip)).toEqual({
      fireResist: 10,
      natureResist: 15,
    })
  })

  it('parses all resistance types', () => {
    const tooltip = [
      { label: '+5 Fire Resistance' },
      { label: '+6 Frost Resistance' },
      { label: '+7 Nature Resistance' },
      { label: '+8 Shadow Resistance' },
      { label: '+9 Arcane Resistance' },
    ]
    expect(parseStatsFromTooltip(tooltip)).toEqual({
      fireResist: 5,
      frostResist: 6,
      natureResist: 7,
      shadowResist: 8,
      arcaneResist: 9,
    })
  })

  it('parses combined armor and stats', () => {
    const tooltip = [
      { label: '100 Armor' },
      { label: '+20 Stamina' },
      { label: '+15 Strength' },
    ]
    expect(parseStatsFromTooltip(tooltip)).toEqual({
      armor: 100,
      stamina: 20,
      strength: 15,
    })
  })

  it('returns empty object for tooltip without stats', () => {
    const tooltip = [
      { label: 'Some Item Name' },
      { label: 'Binds when equipped' },
      { label: 'Durability 100 / 100' },
    ]
    expect(parseStatsFromTooltip(tooltip)).toEqual({})
  })

  it('ignores non-stat lines', () => {
    const tooltip = [
      { label: 'Item Name' },
      { label: '+10 Stamina' },
      { label: 'Chance on hit: Does something', format: 'Uncommon' as const },
    ]
    expect(parseStatsFromTooltip(tooltip)).toEqual({ stamina: 10 })
  })
})
