import type { ItemQuality } from './types'

export const QUALITY_BORDERS: Record<ItemQuality, string> = {
  Uncommon: 'border-green-500',
  Rare: 'border-blue-500',
  Epic: 'border-purple-500',
  Legendary: 'border-orange-500',
  Heirloom: 'border-amber-400',
}

export const QUALITY_COLORS: Record<ItemQuality, string> = {
  Uncommon: 'text-green-500',
  Rare: 'text-blue-500',
  Epic: 'text-purple-500',
  Legendary: 'text-orange-500',
  Heirloom: 'text-amber-400',
}

export const QUALITY_BG: Record<ItemQuality, string> = {
  Uncommon: 'bg-green-500/10',
  Rare: 'bg-blue-500/10',
  Epic: 'bg-purple-500/10',
  Legendary: 'bg-orange-500/10',
  Heirloom: 'bg-amber-400/10',
}
