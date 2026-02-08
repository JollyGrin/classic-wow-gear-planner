import { describe, it, expect } from 'vitest'
import {
  normalizeSlot,
  getEquippableSlots,
  EQUIPMENT_SLOTS,
  EquipmentSlot,
} from '@/app/lib/slots'
import type { Item } from '@/app/lib/types'

const makeItem = (slot: string, subclass?: string): Item => ({
  itemId: 1,
  name: 'Test Item',
  icon: 'test',
  class: 'Weapon',
  subclass: subclass ?? 'Sword',
  sellPrice: 0,
  quality: 'Rare',
  itemLevel: 60,
  requiredLevel: 60,
  slot: slot as Item['slot'],
  tooltip: [],
  itemLink: '',
  contentPhase: 1,
  source: null,
  uniqueName: 'test-item',
})

describe('EQUIPMENT_SLOTS', () => {
  it('contains all equipment slot positions', () => {
    expect(EQUIPMENT_SLOTS).toContain('Head')
    expect(EQUIPMENT_SLOTS).toContain('Main Hand')
    expect(EQUIPMENT_SLOTS).toContain('Off Hand')
    expect(EQUIPMENT_SLOTS).toContain('Trinket')
    expect(EQUIPMENT_SLOTS).toContain('Finger')
    expect(EQUIPMENT_SLOTS).toContain('Ranged')
  })

  it('does not contain raw slots like One-Hand or Two-Hand', () => {
    expect(EQUIPMENT_SLOTS).not.toContain('One-Hand')
    expect(EQUIPMENT_SLOTS).not.toContain('Two-Hand')
    expect(EQUIPMENT_SLOTS).not.toContain('Held In Off-hand')
  })
})

describe('normalizeSlot', () => {
  it('returns same slot for standard equipment slots', () => {
    expect(normalizeSlot('Head')).toBe('Head')
    expect(normalizeSlot('Chest')).toBe('Chest')
    expect(normalizeSlot('Feet')).toBe('Feet')
    expect(normalizeSlot('Back')).toBe('Back')
  })

  it('normalizes One-Hand to Main Hand by default', () => {
    expect(normalizeSlot('One-Hand')).toBe('Main Hand')
  })

  it('normalizes One-Hand to Off Hand when specified', () => {
    expect(normalizeSlot('One-Hand', 'off')).toBe('Off Hand')
  })

  it('normalizes Two-Hand to Main Hand', () => {
    expect(normalizeSlot('Two-Hand')).toBe('Main Hand')
  })

  it('normalizes Held In Off-hand to Off Hand', () => {
    expect(normalizeSlot('Held In Off-hand')).toBe('Off Hand')
  })

  it('normalizes Thrown to Ranged', () => {
    expect(normalizeSlot('Thrown')).toBe('Ranged')
  })

  it('normalizes Relic to Ranged', () => {
    expect(normalizeSlot('Relic')).toBe('Ranged')
  })

  it('keeps Main Hand as Main Hand', () => {
    expect(normalizeSlot('Main Hand')).toBe('Main Hand')
  })

  it('keeps Off Hand as Off Hand', () => {
    expect(normalizeSlot('Off Hand')).toBe('Off Hand')
  })
})

describe('getEquippableSlots', () => {
  it('returns single slot for standard armor', () => {
    const item = makeItem('Head')
    expect(getEquippableSlots(item)).toEqual(['Head'])
  })

  it('returns Main Hand and Off Hand for One-Hand weapons', () => {
    const item = makeItem('One-Hand')
    expect(getEquippableSlots(item)).toEqual(['Main Hand', 'Off Hand'])
  })

  it('returns only Main Hand for Two-Hand weapons', () => {
    const item = makeItem('Two-Hand')
    expect(getEquippableSlots(item)).toEqual(['Main Hand'])
  })

  it('returns Off Hand for Held In Off-hand items', () => {
    const item = makeItem('Held In Off-hand')
    expect(getEquippableSlots(item)).toEqual(['Off Hand'])
  })

  it('returns Off Hand for Shield items', () => {
    const item = makeItem('Off Hand', 'Shield')
    expect(getEquippableSlots(item)).toEqual(['Off Hand'])
  })

  it('returns Ranged for Ranged slot items', () => {
    const item = makeItem('Ranged')
    expect(getEquippableSlots(item)).toEqual(['Ranged'])
  })

  it('returns Ranged for Thrown items', () => {
    const item = makeItem('Thrown')
    expect(getEquippableSlots(item)).toEqual(['Ranged'])
  })

  it('returns Ranged for Relic items', () => {
    const item = makeItem('Relic')
    expect(getEquippableSlots(item)).toEqual(['Ranged'])
  })

  it('returns Finger for ring items', () => {
    const item = makeItem('Finger')
    expect(getEquippableSlots(item)).toEqual(['Finger'])
  })

  it('returns Trinket for trinket items', () => {
    const item = makeItem('Trinket')
    expect(getEquippableSlots(item)).toEqual(['Trinket'])
  })
})
