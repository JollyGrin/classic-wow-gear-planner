import { useState, useEffect, useCallback } from 'react'

/**
 * Display ID resolution with static data + API fallback.
 *
 * Priority:
 * 1. In-memory cache (from previous lookups this session)
 * 2. Static JSON file (pre-scraped Wowhead display IDs at build time)
 * 3. Wowhead XML API fallback (for items not in static file)
 */

interface DisplayIdEntry {
  d: number  // displayId
  s: number  // slotId (inventoryType)
}

// In-memory cache of resolved display IDs
const cache = new Map<number, number>()
const pending = new Map<number, Promise<number>>()

// Static data loaded from JSON file
let staticData: Record<string, DisplayIdEntry> | null = null
let staticDataPromise: Promise<Record<string, DisplayIdEntry>> | null = null

/** Load the static display-ids.json file (once). */
function loadStaticData(): Promise<Record<string, DisplayIdEntry>> {
  if (staticData) return Promise.resolve(staticData)
  if (staticDataPromise) return staticDataPromise

  staticDataPromise = fetch('/data/display-ids.json')
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load display-ids.json: ${res.status}`)
      return res.json()
    })
    .then((data: Record<string, DisplayIdEntry>) => {
      staticData = data
      // Pre-populate cache from static data
      for (const [itemId, entry] of Object.entries(data)) {
        if (entry.d > 0) {
          cache.set(Number(itemId), entry.d)
        }
      }
      return data
    })
    .catch((err) => {
      console.warn('Could not load static display IDs, falling back to API:', err)
      staticData = {}
      return {} as Record<string, DisplayIdEntry>
    })

  return staticDataPromise
}

/** Fetch display ID from Wowhead XML API (fallback). */
async function fetchFromApi(itemId: number): Promise<number> {
  try {
    const res = await fetch(`/api/wowhead-display-id/${itemId}`)
    const data: { displayId: number } = await res.json()
    return data.displayId || 0
  } catch {
    return 0
  }
}

/** Resolve the Wowhead display ID for a single item. Caches results. */
export async function fetchDisplayId(itemId: number): Promise<number> {
  const cached = cache.get(itemId)
  if (cached !== undefined) return cached

  const inflight = pending.get(itemId)
  if (inflight) return inflight

  const promise = (async () => {
    // Try static data first
    await loadStaticData()
    const fromStatic = cache.get(itemId)
    if (fromStatic !== undefined) return fromStatic

    // Fall back to API
    const id = await fetchFromApi(itemId)
    cache.set(itemId, id)
    return id
  })()

  pending.set(itemId, promise)

  promise.finally(() => {
    pending.delete(itemId)
  })

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

// Export for testing
export { loadStaticData, cache, pending }

/** Reset all internal state. For testing only. */
export function _resetForTesting() {
  cache.clear()
  pending.clear()
  staticData = null
  staticDataPromise = null
}
