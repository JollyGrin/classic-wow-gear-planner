'use client'

import type { RefObject } from 'react'
import { Input } from '@/app/components/ui/input'
import { Select } from '@/app/components/ui/select'
import { EQUIPMENT_SLOTS } from '@/app/lib/slots'
import { ITEM_CLASSES, ITEM_QUALITIES, STAT_KEYS, STAT_LABELS, type ItemFilters, type StatKey } from '@/app/lib/types'

interface ItemFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filters: ItemFilters
  onFiltersChange: (filters: ItemFilters) => void
  searchInputRef?: RefObject<HTMLInputElement | null>
  itemCount: number
  sortStat: StatKey | null
  onSortStatChange: (stat: StatKey | null) => void
}

export function ItemFiltersComponent({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  searchInputRef,
  itemCount,
  sortStat,
  onSortStatChange,
}: ItemFiltersProps) {
  const updateFilter = <K extends keyof ItemFilters>(key: K, value: ItemFilters[K] | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          ref={searchInputRef}
          type="search"
          placeholder="Search items... (press / to focus)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Level:</span>
        <Input
          type="number"
          placeholder="Min"
          min={1}
          max={60}
          value={filters.minLevel ?? ''}
          onChange={(e) => updateFilter('minLevel', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-16"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder="Max"
          min={1}
          max={60}
          value={filters.maxLevel ?? ''}
          onChange={(e) => updateFilter('maxLevel', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-16"
        />

        <Select
          value={filters.slot ?? ''}
          onChange={(e) => updateFilter('slot', e.target.value || undefined)}
          className="w-auto min-w-[120px]"
        >
          <option value="">All Slots</option>
          {EQUIPMENT_SLOTS.filter((s) => s !== 'Ammo' && s !== 'Shirt' && s !== 'Tabard').map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </Select>

        <Select
          value={filters.class ?? ''}
          onChange={(e) => updateFilter('class', (e.target.value || undefined) as ItemFilters['class'])}
          className="w-auto min-w-[120px]"
        >
          <option value="">All Classes</option>
          {ITEM_CLASSES.filter((c) => c === 'Armor' || c === 'Weapon').map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </Select>

        <Select
          value={filters.quality ?? ''}
          onChange={(e) => updateFilter('quality', (e.target.value || undefined) as ItemFilters['quality'])}
          className="w-auto min-w-[120px]"
        >
          <option value="">All Qualities</option>
          {ITEM_QUALITIES.map((quality) => (
            <option key={quality} value={quality}>
              {quality}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{itemCount} items</span>
        <div className="flex items-center gap-2">
          <span>Stat:</span>
          <Select
            value={sortStat ?? ''}
            onChange={(e) => onSortStatChange((e.target.value || null) as StatKey | null)}
            className="w-auto min-w-[100px]"
          >
            <option value="">None</option>
            {STAT_KEYS.map((stat) => (
              <option key={stat} value={stat}>
                {STAT_LABELS[stat]}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  )
}
