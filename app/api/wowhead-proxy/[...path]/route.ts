export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const joinedPath = path.join('/')
  const targetUrl = `https://wow.zamimg.com/${joinedPath}`

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible)',
        Referer: 'https://www.wowhead.com/',
      },
    })

    if (!response.ok) {
      if (joinedPath.includes('meta') && response.status === 404) {
        return Response.json({ displayId: 0, itemClass: 0 })
      }
      throw new Error(`Upstream error: ${response.status}`)
    }

    const data = await response.arrayBuffer()

    return new Response(data, {
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response('Proxy error', { status: 502 })
  }
}
