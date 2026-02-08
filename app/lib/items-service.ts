import type { Item, ItemFilters } from './types'

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
    this.items = await response.json()
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
      if (filters.phase !== undefined && item.contentPhase !== filters.phase) {
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
