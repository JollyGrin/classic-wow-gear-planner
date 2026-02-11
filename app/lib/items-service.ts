import type { Item, ItemFilters, ItemStats, TooltipLine } from './types'

export function parseStatsFromTooltip(tooltip: TooltipLine[]): ItemStats {
  const stats: ItemStats = {}

  for (const line of tooltip) {
    const label = line.label

    // Parse armor: "62 Armor"
    const armorMatch = label.match(/^(\d+) Armor$/)
    if (armorMatch) {
      stats.armor = parseInt(armorMatch[1])
      continue
    }

    // Parse primary stats: "+8 Strength", "+7 Stamina", etc.
    const statMatch = label.match(/^\+(\d+) (Stamina|Agility|Strength|Intellect|Spirit)$/)
    if (statMatch) {
      const value = parseInt(statMatch[1])
      const stat = statMatch[2].toLowerCase() as keyof ItemStats
      stats[stat] = value
      continue
    }

    // Parse resistances: "+15 Fire Resistance", "+10 Nature Resistance", etc.
    const resistMatch = label.match(/^\+(\d+) (Fire|Frost|Nature|Shadow|Arcane) Resistance$/)
    if (resistMatch) {
      const value = parseInt(resistMatch[1])
      const element = resistMatch[2].toLowerCase()
      const key = `${element}Resist` as keyof ItemStats
      stats[key] = value
      continue
    }
  }

  return stats
}

export class ItemsService {
  private static instance: ItemsService | null = null
  private items: Item[] = []
  private loaded = false
  private loading: Promise<void> | null = null

  static getInstance(): ItemsService {
    if (!ItemsService.instance) {
      ItemsService.instance = new ItemsService()
    }
    return ItemsService.instance
  }

  async loadItems(): Promise<void> {
    if (this.loaded) return
    if (this.loading) return this.loading

    this.loading = this.fetchItems()
    await this.loading
  }

  private async fetchItems(): Promise<void> {
    const response = await fetch('/data/items.json')
    if (!response.ok) {
      throw new Error(`Failed to load items: ${response.status}`)
    }
    const rawItems = await response.json()
    // Parse stats from tooltip for each item
    this.items = rawItems.map((item: Omit<Item, 'stats'> & { tooltip: TooltipLine[] }) => ({
      ...item,
      stats: parseStatsFromTooltip(item.tooltip),
    }))
    this.loaded = true
  }

  isLoaded(): boolean {
    return this.loaded
  }

  getItems(): Item[] {
    return [...this.items]
  }

  getItemById(id: number): Item | undefined {
    return this.items.find((item) => item.itemId === id)
  }

  searchItems(query: string): Item[] {
    if (!query.trim()) {
      return this.getItems()
    }
    const lowerQuery = query.toLowerCase()
    return this.items.filter((item) =>
      item.name.toLowerCase().includes(lowerQuery)
    )
  }

  filterItems(filters: ItemFilters): Item[] {
    return this.items.filter((item) => {
      if (filters.slot && item.slot !== filters.slot) {
        return false
      }
      if (filters.class && item.class !== filters.class) {
        return false
      }
      if (filters.quality && item.quality !== filters.quality) {
        return false
      }
      if (filters.minLevel !== undefined && item.requiredLevel < filters.minLevel) {
        return false
      }
      if (filters.maxLevel !== undefined && item.requiredLevel > filters.maxLevel) {
        return false
      }
      if (filters.sourceCategory) {
        if (!item.source || item.source.category !== filters.sourceCategory) {
          return false
        }
      }
      return true
    })
  }
}
