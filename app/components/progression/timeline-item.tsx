'use client'

import { X } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import type { Item } from '@/app/lib/types'

const QUALITY_BORDERS = {
  Uncommon: 'border-green-500',
  Rare: 'border-blue-500',
  Epic: 'border-purple-500',
  Legendary: 'border-orange-500',
  Heirloom: 'border-amber-400',
} as const

const QUALITY_COLORS = {
  Uncommon: 'text-green-500',
  Rare: 'text-blue-500',
  Epic: 'text-purple-500',
  Legendary: 'text-orange-500',
  Heirloom: 'text-amber-400',
} as const

interface TimelineItemProps {
  item: Item
  onRemove?: (item: Item) => void
  stacked?: boolean
  stackIndex?: number
}

export function TimelineItem({ item, onRemove, stacked, stackIndex = 0 }: TimelineItemProps) {
  const iconUrl = `https://wow.zamimg.com/images/wow/icons/medium/${item.icon}.jpg`

  return (
    <div
      className={cn(
        'group relative',
        stacked && stackIndex > 0 && '-mt-6'
      )}
      style={stacked && stackIndex > 0 ? { marginLeft: `${stackIndex * 4}px` } : undefined}
      data-testid="timeline-item"
    >
      <div
        className={cn(
          'relative h-9 w-9 overflow-hidden rounded border-2 bg-card transition-transform hover:scale-110 hover:z-10',
          QUALITY_BORDERS[item.quality]
        )}
      >
        <img
          src={iconUrl}
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {onRemove && (
          <button
            onClick={() => onRemove(item)}
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Remove ${item.name}`}
          >
            <X className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <span className={QUALITY_COLORS[item.quality]}>{item.name}</span>
        <div className="text-muted-foreground">
          {item.slot} • Lvl {item.requiredLevel}
        </div>
      </div>
    </div>
  )
}
