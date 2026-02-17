import { useState, useEffect, useCallback } from 'react'
import type { DisplayInfo, DisplayIdFetchOptions } from './types'

const cache = new Map<string, Map<number, DisplayInfo>>()
const pending = new Map<string, Map<number, Promise<DisplayInfo>>>()

function getCache(baseUrl: string) {
  let c = cache.get(baseUrl)
  if (!c) {
    c = new Map()
    cache.set(baseUrl, c)
  }
  return c
}

function getPending(baseUrl: string) {
  let p = pending.get(baseUrl)
  if (!p) {
    p = new Map()
    pending.set(baseUrl, p)
  }
  return p
}

/** Fetch the Wowhead display info for a single item. Caches results. */
export async function fetchDisplayInfo(
  itemId: number,
  options?: DisplayIdFetchOptions
): Promise<DisplayInfo> {
  const baseUrl = options?.baseUrl ?? '/api/wowhead-display-id'
  const c = getCache(baseUrl)
  const p = getPending(baseUrl)

  const cached = c.get(itemId)
  if (cached !== undefined) return cached

  const inflight = p.get(itemId)
  if (inflight) return inflight

  const promise = fetch(`${baseUrl}/${itemId}`)
    .then((res) => res.json())
    .then((data: { displayId: number; slotId: number }) => {
      const info: DisplayInfo = {
        displayId: data.displayId || 0,
        slotId: data.slotId || 0,
      }
      c.set(itemId, info)
      p.delete(itemId)
      return info
    })
    .catch(() => {
      p.delete(itemId)
      return { displayId: 0, slotId: 0 }
    })

  p.set(itemId, promise)
  return promise
}

/** Resolve display info for a batch of item IDs. */
async function fetchBatch(
  itemIds: number[],
  options?: DisplayIdFetchOptions
): Promise<Record<number, DisplayInfo>> {
  const results = await Promise.all(
    itemIds.map(async (id) => [id, await fetchDisplayInfo(id, options)] as const)
  )
  return Object.fromEntries(results)
}

/**
 * Hook that resolves Wowhead display info for a set of item IDs.
 * Returns a map of itemId -> DisplayInfo, updating as results arrive.
 */
export function useDisplayIds(
  itemIds: number[],
  options?: DisplayIdFetchOptions
) {
  const [displayInfos, setDisplayInfos] = useState<Record<number, DisplayInfo>>({})
  const baseUrl = options?.baseUrl ?? '/api/wowhead-display-id'

  const getDisplayInfo = useCallback(
    (itemId: number): DisplayInfo | null => displayInfos[itemId] || null,
    [displayInfos]
  )

  useEffect(() => {
    if (itemIds.length === 0) return

    let cancelled = false
    const c = getCache(baseUrl)

    // Return cached results immediately
    const known: Record<number, DisplayInfo> = {}
    const toFetch: number[] = []
    for (const id of itemIds) {
      const cached = c.get(id)
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

    fetchBatch(toFetch, options).then((results) => {
      if (!cancelled) {
        setDisplayInfos((prev) => ({ ...prev, ...results }))
      }
    })

    return () => {
      cancelled = true
    }
  }, [itemIds.join(','), baseUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  return { getDisplayInfo, displayInfos }
}
