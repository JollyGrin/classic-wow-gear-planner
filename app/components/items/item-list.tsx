'use client'

import { useEffect, useRef, useState } from 'react'
import { ItemCard } from './item-card'
import type { Item } from '@/app/lib/types'

const BATCH_SIZE = 50

interface ItemListProps {
  items: Item[]
  onAddItem?: (item: Item) => void
  hasItem?: (itemId: number) => boolean
}

export function ItemList({ items, onAddItem, hasItem }: ItemListProps) {
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDisplayCount(BATCH_SIZE)
  }, [items])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, items.length))
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [items.length])

  const displayedItems = items.slice(0, displayCount)

  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No items found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {displayedItems.map((item) => (
        <ItemCard
          key={item.itemId}
          item={item}
          onAdd={onAddItem}
          isAdded={hasItem?.(item.itemId)}
        />
      ))}
      {displayCount < items.length && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          <span className="text-sm text-muted-foreground">
            Loading more... ({displayCount} of {items.length})
          </span>
        </div>
      )}
    </div>
  )
}
