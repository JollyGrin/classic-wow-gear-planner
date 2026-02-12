'use client'

import { createColumnHelper, type SortingFn, type Row } from '@tanstack/react-table'
import { Check, Plus } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { cn } from '@/app/lib/utils'
import { QUALITY_COLORS } from '@/app/lib/quality'
import type { Item, StatKey } from '@/app/lib/types'

export const QUALITY_ORDER = ['Uncommon', 'Rare', 'Epic', 'Legendary', 'Heirloom'] as const

export { QUALITY_COLORS }

export const qualitySortingFn: SortingFn<Item> = (
  rowA: Row<Item>,
  rowB: Row<Item>,
  _columnId: string
) => {
  const aIdx = QUALITY_ORDER.indexOf(rowA.original.quality)
  const bIdx = QUALITY_ORDER.indexOf(rowB.original.quality)
  return aIdx - bIdx
}

const columnHelper = createColumnHelper<Item>()

function statAccessor(key: StatKey) {
  return (item: Item) => {
    const val = item.stats[key]
    return val ? val : undefined
  }
}

function statColumn(header: string, key: StatKey, width: number) {
  return columnHelper.accessor(statAccessor(key), {
    id: key,
    header,
    size: width,
    sortUndefined: 'last',
    cell: (info) => {
      const val = info.getValue()
      return val !== undefined ? val : <span className="text-muted-foreground/40">&mdash;</span>
    },
  })
}

export const columns = [
  // Item (icon + name)
  columnHelper.accessor('name', {
    id: 'item',
    header: 'Item',
    size: 280,
    enableHiding: false,
    cell: (info) => {
      const item = info.row.original
      const iconUrl = `https://wow.zamimg.com/images/wow/icons/small/${item.icon}.jpg`
      const { onAddItem, hasItem } = info.table.options.meta as {
        onAddItem?: (item: Item) => void
        hasItem?: (itemId: number) => boolean
      }
      return (
        <div className="flex items-center gap-2 min-w-0 w-full">
          <img
            src={iconUrl}
            alt=""
            className="h-6 w-6 rounded border border-border shrink-0"
            loading="lazy"
          />
          <span className={cn('truncate flex-1', QUALITY_COLORS[item.quality])}>
            {item.name}
          </span>
          {onAddItem && (
            hasItem?.(item.itemId) ? (
              <div className="flex items-center justify-center text-green-500 shrink-0">
                <Check className="h-4 w-4" />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => onAddItem(item)}
                aria-label={`Add ${item.name} to list`}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )
          )}
        </div>
      )
    },
  }),

  // Core info columns
  columnHelper.accessor('slot', {
    id: 'slot',
    header: 'Slot',
    size: 120,
  }),

  columnHelper.accessor('itemLevel', {
    id: 'itemLevel',
    header: 'iLvl',
    size: 60,
  }),

  columnHelper.accessor('requiredLevel', {
    id: 'requiredLevel',
    header: 'Req Lvl',
    size: 70,
  }),

  columnHelper.accessor('quality', {
    id: 'quality',
    header: 'Quality',
    size: 90,
    sortingFn: qualitySortingFn,
    cell: (info) => {
      const quality = info.getValue()
      return <span className={QUALITY_COLORS[quality]}>{quality}</span>
    },
  }),

  columnHelper.accessor((item) => item.source?.category ?? '', {
    id: 'source',
    header: 'Source',
    size: 100,
    cell: (info) => info.getValue() || <span className="text-muted-foreground/40">&mdash;</span>,
  }),

  // Stat columns (hidden by default)
  statColumn('Armor', 'armor', 60),
  statColumn('STA', 'stamina', 50),
  statColumn('STR', 'strength', 50),
  statColumn('AGI', 'agility', 50),
  statColumn('INT', 'intellect', 50),
  statColumn('SPI', 'spirit', 50),
  statColumn('FR', 'fireResist', 40),
  statColumn('FoR', 'frostResist', 40),
  statColumn('NR', 'natureResist', 40),
  statColumn('SR', 'shadowResist', 40),
  statColumn('AR', 'arcaneResist', 40),

]
