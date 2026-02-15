const cache = new Map<string, number>()

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params

  if (cache.has(itemId)) {
    return Response.json({ displayId: cache.get(itemId) })
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
      return Response.json({ displayId: 0 })
    }

    const xml = await res.text()
    const match = xml.match(/displayId="(\d+)"/)
    const displayId = match ? Number(match[1]) : 0

    if (displayId > 0) {
      cache.set(itemId, displayId)
    }

    return Response.json(
      { displayId },
      { headers: { 'Cache-Control': 'public, max-age=86400' } }
    )
  } catch {
    return Response.json({ displayId: 0 }, { status: 502 })
  }
}
