'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type VisibilityState,
  type ColumnPinningState,
  type SortingState,
} from '@tanstack/react-table'
import { useItems } from '@/app/hooks/use-items'
import { useDebounce } from '@/app/hooks/use-debounce'
import { useKeyboardShortcut } from '@/app/hooks/use-keyboard-shortcut'
import { ItemFiltersComponent } from './item-filters'
import { DataTable } from './data-table'
import { ColumnVisibilityToggle } from './column-visibility-toggle'
import { columns } from './columns'
import { normalizeSlot } from '@/app/lib/slots'
import type { Item, ItemFilters } from '@/app/lib/types'

interface ItemsTabProps {
  onAddItem?: (item: Item) => void
  hasItem?: (itemId: number) => boolean
}

export function ItemsTab({ onAddItem, hasItem }: ItemsTabProps) {
  const { data: items = [], isLoading, error } = useItems()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ItemFilters>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    armor: false,
    stamina: false,
    strength: false,
    agility: false,
    intellect: false,
    spirit: false,
    fireResist: false,
    frostResist: false,
    natureResist: false,
    shadowResist: false,
    arcaneResist: false,
  })
  const [columnPinning] = useState<ColumnPinningState>({
    left: ['item'],
  })
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(search, 200)

  useKeyboardShortcut(
    '/',
    useCallback(() => {
      searchInputRef.current?.focus()
    }, [])
  )

  const preFilteredItems = useMemo(() => {
    let result = items

    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(lowerSearch))
    }

    if (filters.slot) {
      result = result.filter((item) => {
        if (item.slot === filters.slot) return true
        const normalized = normalizeSlot(item.slot)
        return normalized === filters.slot
      })
    }

    if (filters.class) {
      result = result.filter((item) => item.class === filters.class)
    }

    if (filters.quality) {
      result = result.filter((item) => item.quality === filters.quality)
    }

    if (filters.minLevel !== undefined) {
      result = result.filter((item) => item.requiredLevel >= filters.minLevel!)
    }
    if (filters.maxLevel !== undefined) {
      result = result.filter((item) => item.requiredLevel <= filters.maxLevel!)
    }

    return result
  }, [items, debouncedSearch, filters])

  const table = useReactTable({
    data: preFilteredItems,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnPinning,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: true,
    maxMultiSortColCount: 3,
    isMultiSortEvent: (e: unknown) => (e as MouseEvent).shiftKey,
    meta: {
      onAddItem,
      hasItem,
    },
  })

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
    <div className="space-y-3">
      <ItemFiltersComponent
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        searchInputRef={searchInputRef}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {preFilteredItems.length} items
        </span>
        <ColumnVisibilityToggle table={table} />
      </div>

      <DataTable table={table} />
    </div>
  )
}
