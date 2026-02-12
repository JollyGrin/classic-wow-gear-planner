import { normalizeSlot } from './slots'
import type { EquipmentSlot } from './slots'
import type { Item, ItemStats, StatKey } from './types'

/** Slots in WoW paperdoll order: Armor-Left, Armor-Right, Accessories, Weapons */
export const SLOT_GROUP_ORDER: EquipmentSlot[] = [
  // Armor-Left
  'Head', 'Neck', 'Shoulder', 'Back', 'Chest', 'Wrist',
  // Armor-Right
  'Hands', 'Waist', 'Legs', 'Feet',
  // Accessories
  'Finger', 'Trinket',
  // Weapons
  'Main Hand', 'Off Hand', 'Ranged',
]

const DUAL_EQUIP_SLOTS = new Set<string>(['Finger', 'Trinket'])

/** Returns only slots that have items, in paperdoll group order. */
export function getPopulatedSlots(items: Item[]): EquipmentSlot[] {
  const seen = new Set<EquipmentSlot>()
  for (const item of items) {
    seen.add(normalizeSlot(item.slot))
  }
  return SLOT_GROUP_ORDER.filter((s) => seen.has(s))
}

export type LevelBucket =
  | { type: 'items'; level: number; items: Item[] }
  | { type: 'gap'; startLevel: number; endLevel: number }

/** Compress levels into item rows and gap spacers. */
export function computeLevelBuckets(items: Item[]): LevelBucket[] {
  if (items.length === 0) return []

  const grouped: Record<number, Item[]> = {}
  for (const item of items) {
    const lvl = item.requiredLevel
    if (!grouped[lvl]) grouped[lvl] = []
    grouped[lvl].push(item)
  }

  const levels = Object.keys(grouped).map(Number).sort((a, b) => a - b)
  const buckets: LevelBucket[] = []

  for (let i = 0; i < levels.length; i++) {
    if (i > 0) {
      const prevLevel = levels[i - 1]
      const currLevel = levels[i]
      if (currLevel - prevLevel > 1) {
        buckets.push({
          type: 'gap',
          startLevel: prevLevel + 1,
          endLevel: currLevel - 1,
        })
      }
    }
    buckets.push({ type: 'items', level: levels[i], items: grouped[levels[i]] })
  }

  return buckets
}

export type EquippedMap = Record<string, Item[]>

/** For each slot, find the best item(s) at or below the selected level. */
export function computeEquippedAtLevel(items: Item[], level: number): EquippedMap {
  const eligible = items.filter((i) => i.requiredLevel <= level)

  // Group by normalized slot
  const bySlot: Record<string, Item[]> = {}
  for (const item of eligible) {
    const slot = normalizeSlot(item.slot)
    if (!bySlot[slot]) bySlot[slot] = []
    bySlot[slot].push(item)
  }

  const result: EquippedMap = {}
  for (const [slot, slotItems] of Object.entries(bySlot)) {
    // Sort by requiredLevel desc, then itemLevel desc
    const sorted = [...slotItems].sort((a, b) => {
      if (b.requiredLevel !== a.requiredLevel) return b.requiredLevel - a.requiredLevel
      return b.itemLevel - a.itemLevel
    })
    const count = DUAL_EQUIP_SLOTS.has(slot) ? 2 : 1
    result[slot] = sorted.slice(0, count)
  }

  return result
}

/** Sum all stats from equipped items. */
export function aggregateStats(equipped: EquippedMap): ItemStats {
  const totals: ItemStats = {
    armor: 0,
    stamina: 0,
    agility: 0,
    strength: 0,
    intellect: 0,
    spirit: 0,
    fireResist: 0,
    frostResist: 0,
    natureResist: 0,
    shadowResist: 0,
    arcaneResist: 0,
  }

  for (const items of Object.values(equipped)) {
    for (const item of items) {
      if (!item.stats) continue
      for (const key of Object.keys(totals) as StatKey[]) {
        totals[key] = (totals[key] ?? 0) + (item.stats[key] ?? 0)
      }
    }
  }

  return totals
}

/** Human-readable source string. */
export function formatSource(item: Item): string {
  if (!item.source) return '\u2014'
  const { category, name, quests } = item.source

  if (category === 'Quest' && quests?.length) {
    return `Q: ${quests[0].name}`
  }
  if (category === 'Vendor' && name) {
    return `Vendor: ${name}`
  }
  if (name) return name
  return category
}

/** Format drop chance as percentage, e.g. 0.0131 -> "1.3%". */
export function formatDropChance(chance: number | undefined): string {
  if (chance === undefined) return ''
  return `${(chance * 100).toFixed(1).replace(/\.0$/, '')}%`
}
