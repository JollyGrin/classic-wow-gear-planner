'use client'

import { Check, Plus } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import type { Item } from '@/app/lib/types'
import { cn } from '@/app/lib/utils'

const QUALITY_COLORS = {
  Uncommon: 'text-green-500',
  Rare: 'text-blue-500',
  Epic: 'text-purple-500',
  Legendary: 'text-orange-500',
  Heirloom: 'text-amber-400',
} as const

interface ItemCardProps {
  item: Item
  onAdd?: (item: Item) => void
  isAdded?: boolean
}

export function ItemCard({ item, onAdd, isAdded }: ItemCardProps) {
  const iconUrl = `https://wow.zamimg.com/images/wow/icons/large/${item.icon}.jpg`

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50">
      <img
        src={iconUrl}
        alt={item.name}
        className="h-10 w-10 rounded border border-border"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn('truncate font-medium', QUALITY_COLORS[item.quality])}>
            {item.name}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          <span>{item.slot}</span>
          <span>iLvl {item.itemLevel}</span>
          <span>Req. {item.requiredLevel}</span>
          {item.source && <span>{item.source.category}</span>}
        </div>
      </div>
      {onAdd && (
        isAdded ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center text-green-500">
            <Check className="h-4 w-4" />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAdd(item)}
            className="shrink-0"
            aria-label={`Add ${item.name} to list`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )
      )}
    </div>
  )
}
