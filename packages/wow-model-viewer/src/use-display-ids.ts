import { useState, useEffect, useCallback } from 'react'
import type { DisplayIdFetchOptions } from './types'

const cache = new Map<string, Map<number, number>>()
const pending = new Map<string, Map<number, Promise<number>>>()

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

/** Fetch the Wowhead display ID for a single item. Caches results. */
export async function fetchDisplayId(
  itemId: number,
  options?: DisplayIdFetchOptions
): Promise<number> {
  const baseUrl = options?.baseUrl ?? '/api/wowhead-display-id'
  const c = getCache(baseUrl)
  const p = getPending(baseUrl)

  const cached = c.get(itemId)
  if (cached !== undefined) return cached

  const inflight = p.get(itemId)
  if (inflight) return inflight

  const promise = fetch(`${baseUrl}/${itemId}`)
    .then((res) => res.json())
    .then((data: { displayId: number }) => {
      const id = data.displayId || 0
      c.set(itemId, id)
      p.delete(itemId)
      return id
    })
    .catch(() => {
      p.delete(itemId)
      return 0
    })

  p.set(itemId, promise)
  return promise
}

/** Resolve display IDs for a batch of item IDs. Returns { itemId: displayId } */
async function fetchBatch(
  itemIds: number[],
  options?: DisplayIdFetchOptions
): Promise<Record<number, number>> {
  const results = await Promise.all(
    itemIds.map(async (id) => [id, await fetchDisplayId(id, options)] as const)
  )
  return Object.fromEntries(results)
}

/**
 * Hook that resolves Wowhead display IDs for a set of item IDs.
 * Returns a map of itemId -> displayId, updating as results arrive.
 */
export function useDisplayIds(
  itemIds: number[],
  options?: DisplayIdFetchOptions
) {
  const [displayIds, setDisplayIds] = useState<Record<number, number>>({})
  const baseUrl = options?.baseUrl ?? '/api/wowhead-display-id'

  const getDisplayId = useCallback(
    (itemId: number): number | null => displayIds[itemId] || null,
    [displayIds]
  )

  useEffect(() => {
    if (itemIds.length === 0) return

    let cancelled = false
    const c = getCache(baseUrl)

    // Return cached results immediately
    const known: Record<number, number> = {}
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
      setDisplayIds((prev) => ({ ...prev, ...known }))
    }

    if (toFetch.length === 0) return

    fetchBatch(toFetch, options).then((results) => {
      if (!cancelled) {
        setDisplayIds((prev) => ({ ...prev, ...results }))
      }
    })

    return () => {
      cancelled = true
    }
  }, [itemIds.join(','), baseUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  return { getDisplayId, displayIds }
}
