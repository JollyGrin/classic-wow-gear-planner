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
  dropChance?: number
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
}

export interface ItemFilters {
  slot?: string
  class?: ItemClass
  quality?: ItemQuality
  minLevel?: number
  maxLevel?: number
  phase?: number
  sourceCategory?: SourceCategory
}
