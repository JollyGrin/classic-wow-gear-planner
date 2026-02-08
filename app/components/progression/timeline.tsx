'use client'

import { useMemo } from 'react'
import { TimelineItem } from './timeline-item'
import type { Item } from '@/app/lib/types'

interface TimelineProps {
  items: Item[]
  onRemoveItem?: (item: Item) => void
}

const LEVEL_MARKERS = [1, 10, 20, 30, 40, 50, 60]
const MAX_VISIBLE_STACK = 4

export function Timeline({ items, onRemoveItem }: TimelineProps) {
  const itemsByLevel = useMemo(() => {
    const grouped: Record<number, Item[]> = {}
    for (const item of items) {
      const level = item.requiredLevel
      if (!grouped[level]) grouped[level] = []
      grouped[level].push(item)
    }
    return grouped
  }, [items])

  const levels = Object.keys(itemsByLevel)
    .map(Number)
    .sort((a, b) => a - b)

  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No items in your progression list. Add items from the Items tab.
      </div>
    )
  }

  return (
    <div className="relative overflow-x-auto pb-4">
      {/* Timeline track */}
      <div className="relative h-48 min-w-[800px]">
        {/* Level markers */}
        <div className="absolute inset-x-0 top-0 flex justify-between px-4 text-sm text-muted-foreground">
          {LEVEL_MARKERS.map((level) => (
            <div key={level} className="flex flex-col items-center">
              <span>{level}</span>
              <div className="mt-1 h-4 w-px bg-border" />
            </div>
          ))}
        </div>

        {/* Track line */}
        <div className="absolute left-4 right-4 top-10 h-px bg-border" />

        {/* Items */}
        <div className="absolute inset-x-0 top-14 px-4">
          {levels.map((level) => {
            const levelItems = itemsByLevel[level]
            const leftPercent = ((level - 1) / 59) * 100
            const visibleItems = levelItems.slice(0, MAX_VISIBLE_STACK)
            const hiddenCount = levelItems.length - MAX_VISIBLE_STACK

            return (
              <div
                key={level}
                className="absolute"
                style={{ left: `${leftPercent}%` }}
              >
                <div className="flex flex-col items-center">
                  {visibleItems.map((item, index) => (
                    <TimelineItem
                      key={item.itemId}
                      item={item}
                      onRemove={onRemoveItem}
                      stacked={visibleItems.length > 1}
                      stackIndex={index}
                    />
                  ))}
                  {hiddenCount > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      +{hiddenCount} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
