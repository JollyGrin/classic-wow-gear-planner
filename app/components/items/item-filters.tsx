'use client'

import type { RefObject } from 'react'
import { Input } from '@/app/components/ui/input'
import { Select } from '@/app/components/ui/select'
import { EQUIPMENT_SLOTS } from '@/app/lib/slots'
import { ITEM_CLASSES, ITEM_QUALITIES, type ItemFilters } from '@/app/lib/types'

interface ItemFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filters: ItemFilters
  onFiltersChange: (filters: ItemFilters) => void
  searchInputRef?: RefObject<HTMLInputElement | null>
}

export function ItemFiltersComponent({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  searchInputRef,
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
      <div className="flex flex-wrap gap-2">
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

        <Select
          value={filters.phase?.toString() ?? ''}
          onChange={(e) => updateFilter('phase', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-auto min-w-[100px]"
        >
          <option value="">All Phases</option>
          {[1, 2, 3, 4, 5, 6].map((phase) => (
            <option key={phase} value={phase}>
              Phase {phase}
            </option>
          ))}
        </Select>

        <Input
          type="number"
          placeholder="Min Lvl"
          min={1}
          max={60}
          value={filters.minLevel ?? ''}
          onChange={(e) => updateFilter('minLevel', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-20"
        />

        <Input
          type="number"
          placeholder="Max Lvl"
          min={1}
          max={60}
          value={filters.maxLevel ?? ''}
          onChange={(e) => updateFilter('maxLevel', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-20"
        />
      </div>
    </div>
  )
}
