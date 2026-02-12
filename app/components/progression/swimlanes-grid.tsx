'use client'

import { useMemo } from 'react'
import { cn } from '@/app/lib/utils'
import { normalizeSlot } from '@/app/lib/slots'
import {
  getPopulatedSlots,
  computeLevelBuckets,
  type LevelBucket,
} from '@/app/lib/progression-utils'
import { SlotColumnHeader } from './slot-column-header'
import { ItemCard } from './item-card'
import type { Item } from '@/app/lib/types'
import type { EquippedMap } from '@/app/lib/progression-utils'

// Slots that start a new visual group (for border separators)
const GROUP_STARTS = new Set(['Head', 'Hands', 'Finger', 'Main Hand'])

interface SwimlanesGridProps {
  items: Item[]
  selectedLevel: number
  equippedMap: EquippedMap
  selectedItem: Item | null
  onSelectItem: (item: Item) => void
  onRemoveItem?: (item: Item) => void
}

export function SwimlanesGrid({
  items,
  selectedLevel,
  equippedMap,
  selectedItem,
  onSelectItem,
  onRemoveItem,
}: SwimlanesGridProps) {
  const slots = useMemo(() => getPopulatedSlots(items), [items])
  const buckets = useMemo(() => computeLevelBuckets(items), [items])

  // Build a set of equipped item IDs for quick lookup
  const equippedIds = useMemo(() => {
    const ids = new Set<number>()
    for (const slotItems of Object.values(equippedMap)) {
      for (const item of slotItems) ids.add(item.itemId)
    }
    return ids
  }, [equippedMap])

  // Count items per slot
  const slotCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      const slot = normalizeSlot(item.slot)
      counts[slot] = (counts[slot] ?? 0) + 1
    }
    return counts
  }, [items])

  if (items.length === 0) return null

  const colCount = slots.length

  return (
    <div
      className="styled-scrollbar overflow-auto rounded border border-border"
      role="grid"
      aria-label="Gear progression grid"
    >
      <div
        className="grid min-w-fit"
        style={{
          gridTemplateColumns: `60px repeat(${colCount}, minmax(140px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div className="sticky top-0 left-0 z-20 bg-background border-b border-border" />
        {slots.map((slot) => (
          <div key={slot} className="border-b border-border">
            <SlotColumnHeader
              slotName={slot}
              itemCount={slotCounts[slot] ?? 0}
              isGroupStart={GROUP_STARTS.has(slot)}
            />
          </div>
        ))}

        {/* Data rows */}
        {buckets.map((bucket) =>
          bucket.type === 'items' ? (
            <ItemRow
              key={`lvl-${bucket.level}`}
              bucket={bucket}
              slots={slots}
              selectedLevel={selectedLevel}
              equippedIds={equippedIds}
              selectedItem={selectedItem}
              onSelectItem={onSelectItem}
              onRemoveItem={onRemoveItem}
            />
          ) : (
            <GapRow
              key={`gap-${bucket.startLevel}-${bucket.endLevel}`}
              bucket={bucket}
              colCount={colCount}
            />
          ),
        )}
      </div>
    </div>
  )
}

function ItemRow({
  bucket,
  slots,
  selectedLevel,
  equippedIds,
  selectedItem,
  onSelectItem,
  onRemoveItem,
}: {
  bucket: Extract<LevelBucket, { type: 'items' }>
  slots: string[]
  selectedLevel: number
  equippedIds: Set<number>
  selectedItem: Item | null
  onSelectItem: (item: Item) => void
  onRemoveItem?: (item: Item) => void
}) {
  const isDimmedRow = bucket.level > selectedLevel

  // Group bucket items by normalized slot
  const itemsBySlot: Record<string, Item[]> = {}
  for (const item of bucket.items) {
    const slot = normalizeSlot(item.slot)
    if (!itemsBySlot[slot]) itemsBySlot[slot] = []
    itemsBySlot[slot].push(item)
  }

  return (
    <>
      {/* Level label — sticky left */}
      <div
        className={cn(
          'sticky left-0 z-10 flex items-start justify-center border-b border-border bg-background py-2 font-mono text-xs',
          isDimmedRow ? 'text-muted-foreground/40' : 'text-muted-foreground',
        )}
      >
        {bucket.level}
      </div>

      {/* Item cells per slot */}
      {slots.map((slot) => {
        const cellItems = itemsBySlot[slot] ?? []
        return (
          <div
            key={slot}
            className={cn(
              'flex flex-col items-center gap-1 border-b border-border px-1 py-2',
              GROUP_STARTS.has(slot) && 'border-l',
            )}
          >
            {cellItems.map((item) => (
              <ItemCard
                key={item.itemId}
                item={item}
                isEquipped={equippedIds.has(item.itemId)}
                isDimmed={isDimmedRow}
                isSelected={selectedItem?.itemId === item.itemId}
                onSelect={onSelectItem}
                onRemove={onRemoveItem}
              />
            ))}
            {/* Two-Hand blocks off-hand indicator */}
            {slot === 'Off Hand' &&
              bucket.items.some((i) => i.slot === 'Two-Hand') && (
                <div className="text-2xs italic text-muted-foreground/40">
                  blocked
                </div>
              )}
          </div>
        )
      })}
    </>
  )
}

function GapRow({
  bucket,
  colCount,
}: {
  bucket: Extract<LevelBucket, { type: 'gap' }>
  colCount: number
}) {
  return (
    <div
      className="col-span-full flex h-7 items-center justify-center border-b border-dashed border-border/50 text-2xs text-muted-foreground/40"
      style={{ gridColumn: `1 / span ${colCount + 1}` }}
    >
      Levels {bucket.startLevel}–{bucket.endLevel}
    </div>
  )
}
