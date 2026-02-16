'use client'

import { useMemo, useState, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { EQUIPMENT_SLOTS } from '@/app/lib/slots'
import {
  computeEquippedAtLevel,
  aggregateStats,
} from '@/app/lib/progression-utils'
import { useLevel } from '@/app/hooks/use-level'
import { LevelScrubber } from './level-scrubber'
import { StatsDashboard } from './stats-dashboard'
import { SwimlanesGrid } from './swimlanes-grid'
import { ItemDetailPanel } from './item-detail-panel'
import type { Item } from '@/app/lib/types'

interface ProgressionTabProps {
  items: Item[]
  onRemoveItem?: (item: Item) => void
  onClearAll?: () => void
}

const TOTAL_EQUIPMENT_SLOTS = EQUIPMENT_SLOTS.filter(
  (s) => s !== 'Ammo' && s !== 'Shirt' && s !== 'Tabard',
).length

export function ProgressionTab({ items, onRemoveItem, onClearAll }: ProgressionTabProps) {
  const { selectedLevel, setSelectedLevel } = useLevel()
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  // Item levels for scrubber tick marks
  const itemLevels = useMemo(
    () => [...new Set(items.map((i) => i.requiredLevel))].sort((a, b) => a - b),
    [items],
  )

  const equippedMap = useMemo(
    () => computeEquippedAtLevel(items, selectedLevel),
    [items, selectedLevel],
  )

  const stats = useMemo(() => aggregateStats(equippedMap), [equippedMap])

  const slotsFilled = Object.keys(equippedMap).length

  const handleSelectItem = useCallback((item: Item) => {
    setSelectedItem((prev) => (prev?.itemId === item.itemId ? null : item))
  }, [])

  const handleCloseDetail = useCallback(() => setSelectedItem(null), [])

  const handleRemoveItem = useCallback(
    (item: Item) => {
      onRemoveItem?.(item)
      if (selectedItem?.itemId === item.itemId) {
        setSelectedItem(null)
      }
    },
    [onRemoveItem, selectedItem],
  )

  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No items in your progression list. Add items from the Items tab.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 space-y-2">
          <LevelScrubber
            level={selectedLevel}
            onLevelChange={setSelectedLevel}
            itemLevels={itemLevels}
          />
          <StatsDashboard
            stats={stats}
            slotsFilled={slotsFilled}
            totalSlots={TOTAL_EQUIPMENT_SLOTS}
          />
        </div>

        {onClearAll && (
          <Button variant="destructive" size="sm" onClick={onClearAll}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Main content: grid + optional detail panel */}
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <SwimlanesGrid
            items={items}
            selectedLevel={selectedLevel}
            equippedMap={equippedMap}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
            onRemoveItem={onRemoveItem ? handleRemoveItem : undefined}
          />
        </div>

        {selectedItem && (
          <ItemDetailPanel
            item={selectedItem}
            onClose={handleCloseDetail}
            onRemove={onRemoveItem ? handleRemoveItem : undefined}
          />
        )}
      </div>
    </div>
  )
}
