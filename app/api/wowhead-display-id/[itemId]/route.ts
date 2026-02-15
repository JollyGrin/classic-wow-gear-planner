interface CacheEntry {
  displayId: number
  slotId: number
}

const cache = new Map<string, CacheEntry>()

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
    const slotId = slotMatch ? Number(slotMatch[1]) : 0

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
