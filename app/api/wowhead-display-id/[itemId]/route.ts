const CDN_BASE = 'https://wow.zamimg.com/modelviewer/classic/meta/armor'

// Armor slots where the CDN uses a different path than inventorySlot.
// Robes use slot 20 on the CDN but Wowhead XML reports inventorySlot=5.
const SLOT_ALTERNATES: Record<number, number[]> = {
  5: [5, 20], // Chest → try Chest first, then Robe
}

interface CacheEntry {
  displayId: number
  slotId: number
}

const cache = new Map<string, CacheEntry>()

/** Check which CDN slot path actually has the armor model. */
async function resolveArmorSlot(
  displayId: number,
  xmlSlotId: number
): Promise<number> {
  const candidates = SLOT_ALTERNATES[xmlSlotId]
  if (!candidates) return xmlSlotId

  for (const slot of candidates) {
    const res = await fetch(`${CDN_BASE}/${slot}/${displayId}.json`, {
      method: 'HEAD',
    })
    if (res.ok) return slot
  }

  return xmlSlotId
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params

  if (cache.has(itemId)) {
    return Response.json(cache.get(itemId))
  }

  try {
    const res = await fetch(
      `https://www.wowhead.com/classic/item=${itemId}&xml`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible)',
          Referer: 'https://www.wowhead.com/',
        },
      }
    )

    if (!res.ok) {
      return Response.json({ displayId: 0, slotId: 0 })
    }

    const xml = await res.text()
    const displayMatch = xml.match(/displayId="(\d+)"/)
    const slotMatch = xml.match(/inventorySlot id="(\d+)"/)
    const displayId = displayMatch ? Number(displayMatch[1]) : 0
    const xmlSlotId = slotMatch ? Number(slotMatch[1]) : 0

    // Resolve the actual CDN slot (e.g. Chest vs Robe)
    const slotId =
      displayId > 0 ? await resolveArmorSlot(displayId, xmlSlotId) : xmlSlotId

    const entry = { displayId, slotId }
    if (displayId > 0) {
      cache.set(itemId, entry)
    }

    return Response.json(entry, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    return Response.json({ displayId: 0, slotId: 0 }, { status: 502 })
  }
}
