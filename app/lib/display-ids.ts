import { useState, useEffect, useCallback } from 'react'

export interface DisplayInfo {
  displayId: number
  slotId: number
}

const cache = new Map<number, DisplayInfo>()
const pending = new Map<number, Promise<DisplayInfo>>()

/** Fetch the Wowhead display info for a single item. Caches results. */
export async function fetchDisplayInfo(itemId: number): Promise<DisplayInfo> {
  const cached = cache.get(itemId)
  if (cached !== undefined) return cached

  const inflight = pending.get(itemId)
  if (inflight) return inflight

  const promise = fetch(`/api/wowhead-display-id/${itemId}?v=2`)
    .then((res) => res.json())
    .then((data: { displayId: number; slotId: number }) => {
      const info: DisplayInfo = {
        displayId: data.displayId || 0,
        slotId: data.slotId || 0,
      }
      cache.set(itemId, info)
      pending.delete(itemId)
      return info
    })
    .catch(() => {
      pending.delete(itemId)
      return { displayId: 0, slotId: 0 }
    })

  pending.set(itemId, promise)
  return promise
}

/** Resolve display info for a batch of item IDs. */
async function fetchBatch(
  itemIds: number[]
): Promise<Record<number, DisplayInfo>> {
  const results = await Promise.all(
    itemIds.map(async (id) => [id, await fetchDisplayInfo(id)] as const)
  )
  return Object.fromEntries(results)
}

/**
 * Hook that resolves Wowhead display info for a set of item IDs.
 * Returns a map of itemId → DisplayInfo, updating as results arrive.
 */
export function useDisplayIds(itemIds: number[]) {
  const [displayInfos, setDisplayInfos] = useState<Record<number, DisplayInfo>>({})

  const getDisplayInfo = useCallback(
    (itemId: number): DisplayInfo | null => displayInfos[itemId] || null,
    [displayInfos]
  )

  useEffect(() => {
    if (itemIds.length === 0) return

    let cancelled = false

    // Return cached results immediately
    const known: Record<number, DisplayInfo> = {}
    const toFetch: number[] = []
    for (const id of itemIds) {
      const cached = cache.get(id)
      if (cached !== undefined) {
        known[id] = cached
      } else {
        toFetch.push(id)
      }
    }

    if (Object.keys(known).length > 0) {
      setDisplayInfos((prev) => ({ ...prev, ...known }))
    }

    if (toFetch.length === 0) return

    fetchBatch(toFetch).then((results) => {
      if (!cancelled) {
        setDisplayInfos((prev) => ({ ...prev, ...results }))
      }
    })

    return () => {
      cancelled = true
    }
  }, [itemIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  return { getDisplayInfo, displayInfos }
}
