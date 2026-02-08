'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useItems } from '@/app/hooks/use-items'
import { useDebounce } from '@/app/hooks/use-debounce'
import { useKeyboardShortcut } from '@/app/hooks/use-keyboard-shortcut'
import { ItemFiltersComponent } from './item-filters'
import { ItemList } from './item-list'
import { normalizeSlot } from '@/app/lib/slots'
import type { Item, ItemFilters } from '@/app/lib/types'

type SortKey = 'name' | 'requiredLevel' | 'itemLevel' | 'quality'
type SortDirection = 'asc' | 'desc'

const QUALITY_ORDER = ['Uncommon', 'Rare', 'Epic', 'Legendary', 'Heirloom'] as const

interface ItemsTabProps {
  onAddItem?: (item: Item) => void
  hasItem?: (itemId: number) => boolean
}

export function ItemsTab({ onAddItem, hasItem }: ItemsTabProps) {
  const { data: items = [], isLoading, error } = useItems()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ItemFilters>({})
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(search, 200)

  // Keyboard shortcut: "/" to focus search
  useKeyboardShortcut(
    '/',
    useCallback(() => {
      searchInputRef.current?.focus()
    }, [])
  )

  const filteredAndSortedItems = useMemo(() => {
    let result = items

    // Search filter
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(lowerSearch))
    }

    // Slot filter (handle normalized slots)
    if (filters.slot) {
      result = result.filter((item) => {
        // Check raw slot
        if (item.slot === filters.slot) return true
        // Check normalized slot
        const normalized = normalizeSlot(item.slot)
        return normalized === filters.slot
      })
    }

    // Class filter
    if (filters.class) {
      result = result.filter((item) => item.class === filters.class)
    }

    // Quality filter
    if (filters.quality) {
      result = result.filter((item) => item.quality === filters.quality)
    }

    // Phase filter
    if (filters.phase !== undefined) {
      result = result.filter((item) => item.contentPhase === filters.phase)
    }

    // Level filters
    if (filters.minLevel !== undefined) {
      result = result.filter((item) => item.requiredLevel >= filters.minLevel!)
    }
    if (filters.maxLevel !== undefined) {
      result = result.filter((item) => item.requiredLevel <= filters.maxLevel!)
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'requiredLevel':
          cmp = a.requiredLevel - b.requiredLevel
          break
        case 'itemLevel':
          cmp = a.itemLevel - b.itemLevel
          break
        case 'quality':
          cmp = QUALITY_ORDER.indexOf(a.quality) - QUALITY_ORDER.indexOf(b.quality)
          break
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return result
  }, [items, debouncedSearch, filters, sortKey, sortDirection])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="text-muted-foreground">Loading items...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="text-destructive">Error loading items: {error.message}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ItemFiltersComponent
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        searchInputRef={searchInputRef}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredAndSortedItems.length} items</span>
        <div className="flex gap-2">
          <span>Sort:</span>
          {(['name', 'requiredLevel', 'itemLevel', 'quality'] as const).map((key) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`hover:text-foreground ${sortKey === key ? 'text-foreground font-medium' : ''}`}
            >
              {key === 'requiredLevel' ? 'Lvl' : key === 'itemLevel' ? 'iLvl' : key}
              {sortKey === key && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      <ItemList items={filteredAndSortedItems} onAddItem={onAddItem} hasItem={hasItem} />
    </div>
  )
}
