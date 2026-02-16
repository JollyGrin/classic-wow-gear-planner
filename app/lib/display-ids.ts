import { useState, useEffect, useCallback } from 'react'

const cache = new Map<number, number>()
const pending = new Map<number, Promise<number>>()

/** Fetch the Wowhead display ID for a single item. Caches results. */
export async function fetchDisplayId(itemId: number): Promise<number> {
  const cached = cache.get(itemId)
  if (cached !== undefined) return cached

  const inflight = pending.get(itemId)
  if (inflight) return inflight

  const promise = fetch(`/api/wowhead-display-id/${itemId}`)
    .then((res) => res.json())
    .then((data: { displayId: number }) => {
      const id = data.displayId || 0
      cache.set(itemId, id)
      pending.delete(itemId)
      return id
    })
    .catch(() => {
      pending.delete(itemId)
      return 0
    })

  pending.set(itemId, promise)
  return promise
}

/** Resolve display IDs for a batch of item IDs. Returns { itemId: displayId } */
async function fetchBatch(
  itemIds: number[]
): Promise<Record<number, number>> {
  const results = await Promise.all(
    itemIds.map(async (id) => [id, await fetchDisplayId(id)] as const)
  )
  return Object.fromEntries(results)
}

/**
 * Hook that resolves Wowhead display IDs for a set of item IDs.
 * Returns a map of itemId → displayId, updating as results arrive.
 */
export function useDisplayIds(itemIds: number[]) {
  const [displayIds, setDisplayIds] = useState<Record<number, number>>({})

  const getDisplayId = useCallback(
    (itemId: number): number | null => displayIds[itemId] || null,
    [displayIds]
  )

  useEffect(() => {
    if (itemIds.length === 0) return

    let cancelled = false

    // Return cached results immediately
    const known: Record<number, number> = {}
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
      setDisplayIds((prev) => ({ ...prev, ...known }))
    }

    if (toFetch.length === 0) return

    fetchBatch(toFetch).then((results) => {
      if (!cancelled) {
        setDisplayIds((prev) => ({ ...prev, ...results }))
      }
    })

    return () => {
      cancelled = true
    }
  }, [itemIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  return { getDisplayId, displayIds }
}
