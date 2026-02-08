'use client'

import { useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Timeline } from './timeline'
import { normalizeSlot, EQUIPMENT_SLOTS } from '@/app/lib/slots'
import type { Item } from '@/app/lib/types'

interface ProgressionTabProps {
  items: Item[]
  onRemoveItem?: (item: Item) => void
  onClearAll?: () => void
}

export function ProgressionTab({ items, onRemoveItem, onClearAll }: ProgressionTabProps) {
  const stats = useMemo(() => {
    const slots = new Set<string>()
    let minLevel = 60
    let maxLevel = 1

    for (const item of items) {
      const normalized = normalizeSlot(item.slot)
      slots.add(normalized)
      minLevel = Math.min(minLevel, item.requiredLevel)
      maxLevel = Math.max(maxLevel, item.requiredLevel)
    }

    const equipmentSlots = EQUIPMENT_SLOTS.filter(
      (s) => s !== 'Ammo' && s !== 'Shirt' && s !== 'Tabard'
    )
    const coverage = equipmentSlots.length > 0
      ? Math.round((slots.size / equipmentSlots.length) * 100)
      : 0

    return {
      total: items.length,
      slots: slots.size,
      coverage,
      levelRange: items.length > 0 ? `${minLevel}-${maxLevel}` : 'N/A',
    }
  }, [items])

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Items: </span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Slots: </span>
            <span className="font-medium">{stats.slots}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Coverage: </span>
            <span className="font-medium">{stats.coverage}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Levels: </span>
            <span className="font-medium">{stats.levelRange}</span>
          </div>
        </div>

        {items.length > 0 && onClearAll && (
          <Button variant="destructive" size="sm" onClick={onClearAll}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Timeline */}
      <Timeline items={items} onRemoveItem={onRemoveItem} />
    </div>
  )
}
