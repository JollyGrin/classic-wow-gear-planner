'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/app/lib/db'
import { ItemsService } from '@/app/lib/items-service'
import { decodeBisList, updateUrlHash, getUrlHash } from '@/app/lib/url-sharing'
import type { Item } from '@/app/lib/types'

export function useBisList() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load from IndexedDB or URL on mount
  useEffect(() => {
    async function loadItems() {
      setIsLoading(true)
      try {
        const service = ItemsService.getInstance()
        await service.loadItems()

        // Check URL hash first
        const hash = getUrlHash()
        const urlItemIds = decodeBisList(hash)

        if (urlItemIds.length > 0) {
          // Load from URL hash
          const loadedItems = urlItemIds
            .map((id) => service.getItemById(id))
            .filter((item): item is Item => item !== undefined)

          // Sync to IndexedDB
          await db.bisItems.clear()
          for (const item of loadedItems) {
            await db.bisItems.add({
              itemId: item.itemId,
              addedAt: Date.now(),
              slot: item.slot,
            })
          }

          setItems(loadedItems)
        } else {
          // Load from IndexedDB
          const entries = await db.bisItems.toArray()
          const loadedItems = entries
            .map((entry) => service.getItemById(entry.itemId))
            .filter((item): item is Item => item !== undefined)

          setItems(loadedItems)

          // Update URL hash
          if (loadedItems.length > 0) {
            updateUrlHash(loadedItems.map((i) => i.itemId))
          }
        }
      } catch (error) {
        console.error('Failed to load BiS list:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [])

  // Update URL hash when items change
  useEffect(() => {
    if (!isLoading) {
      updateUrlHash(items.map((i) => i.itemId))
    }
  }, [items, isLoading])

  const addItem = useCallback(async (item: Item) => {
    // Check if already exists
    const existing = await db.bisItems.where('itemId').equals(item.itemId).first()
    if (existing) return

    await db.bisItems.add({
      itemId: item.itemId,
      addedAt: Date.now(),
      slot: item.slot,
    })

    setItems((prev) => [...prev, item])
  }, [])

  const removeItem = useCallback(async (item: Item) => {
    await db.bisItems.where('itemId').equals(item.itemId).delete()
    setItems((prev) => prev.filter((i) => i.itemId !== item.itemId))
  }, [])

  const clearAll = useCallback(async () => {
    await db.bisItems.clear()
    setItems([])
  }, [])

  const hasItem = useCallback(
    (itemId: number) => {
      return items.some((i) => i.itemId === itemId)
    },
    [items]
  )

  return {
    items,
    isLoading,
    addItem,
    removeItem,
    clearAll,
    hasItem,
  }
}
