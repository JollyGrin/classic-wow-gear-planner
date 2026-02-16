# @gear-journey/wow-model-viewer

3D WoW Classic character model viewer as a React component. Renders an interactive character model with equipment using Wowhead's ZamModelViewer.

## Quick Start

```tsx
import { WowModelViewer } from '@gear-journey/wow-model-viewer'

function App() {
  return (
    <div style={{ width: 300, height: 400 }}>
      <WowModelViewer
        contentPath="/api/wowhead-proxy/modelviewer/classic/"
        race="human"
        gender={0}
        items={[[5, 7551], [21, 2038]]}
      />
    </div>
  )
}
```

> **Important:** `contentPath` is required. You must set up a CORS proxy — see below.

## CORS Proxy Setup

ZamModelViewer fetches assets from `wow.zamimg.com`, which blocks cross-origin requests. You need a server-side proxy that forwards requests to `https://wow.zamimg.com/`.

### Next.js API Route

Create `app/api/wowhead-proxy/[...path]/route.ts`:

```ts
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
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response('Proxy error', { status: 502 })
  }
}
```

Then use `contentPath="/api/wowhead-proxy/modelviewer/classic/"`.

### Next.js Rewrites (simpler)

In `next.config.js`:

```js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/wowhead-proxy/:path*',
        destination: 'https://wow.zamimg.com/:path*',
      },
    ]
  },
}
```

Then use `contentPath="/wowhead-proxy/modelviewer/classic/"`.

### Express Middleware

```js
const { createProxyMiddleware } = require('http-proxy-middleware')

app.use('/wowhead-proxy', createProxyMiddleware({
  target: 'https://wow.zamimg.com',
  changeOrigin: true,
  pathRewrite: { '^/wowhead-proxy': '' },
}))
```

## Display ID Resolution

WoW items have two IDs: the **item ID** (from game databases like mangos) and the **Wowhead display ID** (used by ZamModelViewer to render the 3D model). These are different values.

### API Route for Display IDs

Create `app/api/wowhead-display-id/[itemId]/route.ts`:

```ts
const cache = new Map<string, { displayId: number; slotId: number }>()

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

    if (!res.ok) return Response.json({ displayId: 0, slotId: 0 })

    const xml = await res.text()
    const displayMatch = xml.match(/displayId="(\d+)"/)
    const slotMatch = xml.match(/inventorySlot id="(\d+)"/)
    const displayId = displayMatch ? Number(displayMatch[1]) : 0
    const slotId = slotMatch ? Number(slotMatch[1]) : 0

    const entry = { displayId, slotId }
    if (displayId > 0) cache.set(itemId, entry)

    return Response.json(entry, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    return Response.json({ displayId: 0, slotId: 0 }, { status: 502 })
  }
}
```

### useDisplayIds Hook

```tsx
import { useDisplayIds } from '@gear-journey/wow-model-viewer'

function MyComponent({ itemIds }: { itemIds: number[] }) {
  const { getDisplayId, displayIds } = useDisplayIds(itemIds)

  // With custom API base URL:
  // const { getDisplayId } = useDisplayIds(itemIds, { baseUrl: '/my-api/display-ids' })

  const displayId = getDisplayId(12345) // returns number | null
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contentPath` | `string` | *required* | CORS proxy base URL to `wow.zamimg.com` |
| `race` | `Race \| number` | `'human'` | Character race (string for autocomplete, number for advanced) |
| `gender` | `0 \| 1` | `0` | 0=male, 1=female |
| `items` | `[SlotId, number][]` | `[]` | Equipment as `[inventoryType, wowheadDisplayId]` pairs |
| `aspect` | `number` | `3/4` | Canvas aspect ratio |
| `animation` | `string` | `'Walk'` | Default animation name |
| `debug` | `boolean` | `false` | Show animation debug panel |
| `className` | `string` | - | CSS class on inner container |
| `dataEnv` | `'classic' \| 'live'` | `'classic'` | Data environment |
| `onReady` | `() => void` | - | Fires when model loaded |
| `onError` | `(err: Error) => void` | - | Fires on init failure |

## Exported Constants

```ts
import { VIEWER_SLOT_MAP, RACE_IDS, INVENTORY_TYPE } from '@gear-journey/wow-model-viewer'

// VIEWER_SLOT_MAP: normalized slot name -> inventory type ID
// e.g. { Head: 1, Shoulder: 3, Chest: 5, ... }

// RACE_IDS: race name -> ZamModelViewer race ID
// e.g. { human: 1, orc: 2, dwarf: 3, ... }

// INVENTORY_TYPE: full WoW InventoryType enum
// e.g. { HEAD: 1, NECK: 2, SHOULDERS: 3, ... }
```

## Exported Types

```ts
import type {
  Race,              // 'human' | 'orc' | 'dwarf' | ...
  Gender,            // 0 | 1
  SlotId,            // 1 | 2 | 3 | ... | 26
  ItemEntry,         // [SlotId, number]
  WowModelViewerProps,
  CameraState,
  DisplayIdFetchOptions,
  ViewerInstance,
} from '@gear-journey/wow-model-viewer'
```

## Client-Side Only

This component requires a browser environment (DOM, `window`). In Next.js, use dynamic imports:

```tsx
import dynamic from 'next/dynamic'

const WowModelViewer = dynamic(
  () => import('@gear-journey/wow-model-viewer').then(m => ({ default: m.WowModelViewer })),
  { ssr: false }
)
```

> **TODO:** A server is currently required for the CORS proxy and display ID resolution. Potential future approaches: Cloudflare Worker proxy, pre-bundled assets for known items.

## Troubleshooting

**Model doesn't render / blank canvas**
- Verify your CORS proxy is working: open `{contentPath}viewer/viewer.min.js` in a browser
- Check browser console for 404s or CORS errors
- Ensure the container has explicit width and height

**Animation snaps/pops between loops**
- This is handled automatically. The component zeros out blend times (`seq.d`/`seq.j`) and `crossFadeDuration` on the renderer.

**Camera resets when items change**
- Camera persistence is built in. The component polls camera state every 250ms and restores it across re-renders.

**Zoom resets on item change**
- Both `zoom.target` and `zoom.current` are saved and restored. This prevents the "zoom snapping back" issue.

**jQuery conflicts**
- The component loads jQuery 3.5.1 from CDN. If your app already uses jQuery, ensure it's loaded before the viewer initializes.
