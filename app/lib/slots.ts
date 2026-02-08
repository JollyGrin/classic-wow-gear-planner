import type { Item, RawSlot } from './types'

export const EQUIPMENT_SLOTS = [
  'Head',
  'Neck',
  'Shoulder',
  'Back',
  'Chest',
  'Shirt',
  'Tabard',
  'Wrist',
  'Hands',
  'Waist',
  'Legs',
  'Feet',
  'Finger',
  'Trinket',
  'Main Hand',
  'Off Hand',
  'Ranged',
  'Ammo',
] as const

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number]

/**
 * Normalize raw slot names from item data to equipment slots.
 *
 * - One-Hand → Main Hand (or Off Hand if position='off')
 * - Two-Hand → Main Hand
 * - Held In Off-hand → Off Hand
 * - Thrown/Relic → Ranged
 */
export function normalizeSlot(
  rawSlot: RawSlot | string,
  position?: 'main' | 'off'
): EquipmentSlot {
  switch (rawSlot) {
    case 'One-Hand':
      return position === 'off' ? 'Off Hand' : 'Main Hand'
    case 'Two-Hand':
      return 'Main Hand'
    case 'Held In Off-hand':
      return 'Off Hand'
    case 'Thrown':
    case 'Relic':
      return 'Ranged'
    default:
      return rawSlot as EquipmentSlot
  }
}

/**
 * Get all equipment slots an item can be equipped to.
 *
 * - One-Hand weapons can go in Main Hand or Off Hand
 * - Two-Hand weapons only go in Main Hand (and occupy Off Hand)
 * - Most items have a single valid slot
 */
export function getEquippableSlots(item: Item): EquipmentSlot[] {
  const { slot } = item

  switch (slot) {
    case 'One-Hand':
      return ['Main Hand', 'Off Hand']
    case 'Two-Hand':
      return ['Main Hand']
    case 'Held In Off-hand':
      return ['Off Hand']
    case 'Off Hand':
      return ['Off Hand']
    case 'Main Hand':
      return ['Main Hand']
    case 'Thrown':
    case 'Relic':
      return ['Ranged']
    default:
      return [normalizeSlot(slot)]
  }
}
