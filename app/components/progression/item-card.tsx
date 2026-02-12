'use client'

import { X } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { QUALITY_BORDERS, QUALITY_COLORS } from '@/app/lib/quality'
import { formatSource } from '@/app/lib/progression-utils'
import type { Item } from '@/app/lib/types'

interface ItemCardProps {
  item: Item
  isEquipped?: boolean
  isDimmed?: boolean
  isSelected?: boolean
  onSelect?: (item: Item) => void
  onRemove?: (item: Item) => void
}

export function ItemCard({
  item,
  isEquipped,
  isDimmed,
  isSelected,
  onSelect,
  onRemove,
}: ItemCardProps) {
  const iconUrl = `https://wow.zamimg.com/images/wow/icons/medium/${item.icon}.jpg`

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      data-testid="item-card"
      className={cn(
        'group relative flex items-center gap-2 rounded border px-2 py-1.5 text-left transition-all',
        'w-[130px] hover:scale-[1.02] hover:z-10',
        'bg-card border-border',
        isEquipped && 'ring-1 ring-[oklch(0.75_0.15_85)] shadow-[0_0_6px_oklch(0.75_0.15_85/0.3)]',
        isSelected && 'border-[oklch(0.75_0.15_85)]',
        isDimmed && 'opacity-40',
      )}
    >
      <div
        className={cn(
          'h-8 w-8 shrink-0 overflow-hidden rounded border-2',
          QUALITY_BORDERS[item.quality],
        )}
      >
        <img
          src={iconUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn('truncate text-xs font-medium', QUALITY_COLORS[item.quality])}>
          {item.name}
        </div>
        <div className="truncate text-2xs text-muted-foreground">
          {formatSource(item)}
        </div>
      </div>
      {onRemove && (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              onRemove(item)
            }
          }}
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Remove ${item.name}`}
        >
          <X className="h-2.5 w-2.5" />
        </div>
      )}
    </button>
  )
}
