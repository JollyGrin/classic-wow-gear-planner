export const ITEM_QUALITIES = ['Uncommon', 'Rare', 'Epic', 'Legendary', 'Heirloom'] as const
export type ItemQuality = (typeof ITEM_QUALITIES)[number]

export const ITEM_CLASSES = ['Armor', 'Weapon', 'Miscellaneous', 'Projectile', 'Quest', 'Trade Goods'] as const
export type ItemClass = (typeof ITEM_CLASSES)[number]

export const ARMOR_SUBCLASSES = ['Cloth', 'Leather', 'Mail', 'Plate', 'Shield', 'Miscellaneous', 'Idol', 'Libram', 'Sigil', 'Totem'] as const
export type ArmorSubclass = (typeof ARMOR_SUBCLASSES)[number]

export const WEAPON_SUBCLASSES = ['Axe', 'Bow', 'Crossbow', 'Dagger', 'Fist Weapon', 'Gun', 'Mace', 'Polearm', 'Staff', 'Sword', 'Thrown', 'Wand', 'Fishing Pole', 'Miscellaneous'] as const
export type WeaponSubclass = (typeof WEAPON_SUBCLASSES)[number]

export const RAW_SLOTS = [
  'Ammo', 'Back', 'Chest', 'Feet', 'Finger', 'Hands', 'Head',
  'Held In Off-hand', 'Legs', 'Main Hand', 'Neck', 'Off Hand',
  'One-Hand', 'Ranged', 'Relic', 'Shirt', 'Shoulder', 'Tabard',
  'Thrown', 'Trinket', 'Two-Hand', 'Waist', 'Wrist'
] as const
export type RawSlot = (typeof RAW_SLOTS)[number]

export const SOURCE_CATEGORIES = ['Boss Drop', 'Quest', 'Rare Drop', 'Vendor', 'Zone Drop'] as const
export type SourceCategory = (typeof SOURCE_CATEGORIES)[number]

export interface TooltipLine {
  label: string
  format?: 'alignRight' | 'Misc' | 'Uncommon'
}

export interface ItemSource {
  category: SourceCategory
  name?: string
  zone?: number
  dropChance?: number
  quests?: { questId: number; name: string; faction: string }[]
  cost?: number
  faction?: string
}

export interface ItemStats {
  armor?: number
  stamina?: number
  agility?: number
  strength?: number
  intellect?: number
  spirit?: number
  fireResist?: number
  frostResist?: number
  natureResist?: number
  shadowResist?: number
  arcaneResist?: number
}

export const STAT_KEYS = [
  'armor',
  'stamina',
  'agility',
  'strength',
  'intellect',
  'spirit',
  'fireResist',
  'frostResist',
  'natureResist',
  'shadowResist',
  'arcaneResist',
] as const
export type StatKey = (typeof STAT_KEYS)[number]

export const STAT_LABELS: Record<StatKey, string> = {
  armor: 'Armor',
  stamina: 'Stamina',
  agility: 'Agility',
  strength: 'Strength',
  intellect: 'Intellect',
  spirit: 'Spirit',
  fireResist: 'Fire Resist',
  frostResist: 'Frost Resist',
  natureResist: 'Nature Resist',
  shadowResist: 'Shadow Resist',
  arcaneResist: 'Arcane Resist',
}

export interface Item {
  itemId: number
  name: string
  icon: string
  class: ItemClass
  subclass: string
  sellPrice: number
  quality: ItemQuality
  itemLevel: number
  requiredLevel: number
  slot: RawSlot
  tooltip: TooltipLine[]
  itemLink: string
  contentPhase: number
  source: ItemSource | null
  uniqueName: string
  stats: ItemStats
}

export interface ItemFilters {
  slot?: string
  class?: ItemClass
  quality?: ItemQuality
  minLevel?: number
  maxLevel?: number
  sourceCategory?: SourceCategory
}
