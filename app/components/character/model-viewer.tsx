'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    jQuery: (selector: string) => unknown
    ZamModelViewer: new (config: Record<string, unknown>) => Promise<{ destroy?: () => void }>
    CONTENT_PATH: string
    WOTLK_TO_RETAIL_DISPLAY_ID_API: string | undefined
    WH: Record<string, unknown>
  }
}

const CONTENT_PATH = '/api/wowhead-proxy/modelviewer/classic/'

// Slots that have no visual representation on the model
const NOT_DISPLAYED_SLOTS = [2, 11, 12, 13, 14]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ViewerInstance = { destroy?: () => void; renderer?: { actors?: any[] } }

interface ModelViewerProps {
  race?: number
  gender?: number
  items?: [number, number][]
  className?: string
  debug?: boolean
}

function loadScript(src: string): Promise<void> {
  const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
  if (existing) {
    // Already loaded or loading — wait for it if still loading
    if (existing.dataset.loaded === 'true') return Promise.resolve()
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error(`Failed to load: ${src}`)))
    })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

function setupWowheadGlobals() {
  // CONTENT_PATH tells ZamModelViewer where to fetch assets
  window.CONTENT_PATH = CONTENT_PATH
  // Disable WotLK-to-retail display ID resolution (not needed for classic)
  window.WOTLK_TO_RETAIL_DISPLAY_ID_API = undefined

  // WH namespace expected by ZamModelViewer at runtime
  if (!window.WH) {
    const webp = { getImageExtension: () => '.webp' }
    window.WH = {
      debug: (...args: unknown[]) => console.log(args),
      defaultAnimation: 'Stand',
      WebP: webp,
      Wow: {
        Item: {
          INVENTORY_TYPE_HEAD: 1,
          INVENTORY_TYPE_NECK: 2,
          INVENTORY_TYPE_SHOULDERS: 3,
          INVENTORY_TYPE_SHIRT: 4,
          INVENTORY_TYPE_CHEST: 5,
          INVENTORY_TYPE_WAIST: 6,
          INVENTORY_TYPE_LEGS: 7,
          INVENTORY_TYPE_FEET: 8,
          INVENTORY_TYPE_WRISTS: 9,
          INVENTORY_TYPE_HANDS: 10,
          INVENTORY_TYPE_FINGER: 11,
          INVENTORY_TYPE_TRINKET: 12,
          INVENTORY_TYPE_ONE_HAND: 13,
          INVENTORY_TYPE_SHIELD: 14,
          INVENTORY_TYPE_RANGED: 15,
          INVENTORY_TYPE_BACK: 16,
          INVENTORY_TYPE_TWO_HAND: 17,
          INVENTORY_TYPE_BAG: 18,
          INVENTORY_TYPE_TABARD: 19,
          INVENTORY_TYPE_ROBE: 20,
          INVENTORY_TYPE_MAIN_HAND: 21,
          INVENTORY_TYPE_OFF_HAND: 22,
          INVENTORY_TYPE_HELD_IN_OFF_HAND: 23,
          INVENTORY_TYPE_PROJECTILE: 24,
          INVENTORY_TYPE_THROWN: 25,
          INVENTORY_TYPE_RANGED_RIGHT: 26,
          INVENTORY_TYPE_QUIVER: 27,
          INVENTORY_TYPE_RELIC: 28,
          INVENTORY_TYPE_PROFESSION_TOOL: 29,
          INVENTORY_TYPE_PROFESSION_ACCESSORY: 30,
        },
      },
    }
  }
}

async function ensureGlobals() {
  if (typeof window.ZamModelViewer !== 'undefined') return

  // Set up WH namespace and paths BEFORE loading viewer script
  setupWowheadGlobals()

  // jQuery must load first — ZamModelViewer depends on it
  await loadScript('https://code.jquery.com/jquery-3.5.1.min.js')
  // Then load the classic viewer (provides global ZamModelViewer)
  await loadScript(`${CONTENT_PATH}viewer/viewer.min.js`)
}

function AnimationDebugPanel({ viewer }: { viewer: ViewerInstance }) {
  const [animations, setAnimations] = useState<string[]>([])
  const [currentAnim, setCurrentAnim] = useState('Stand')
  const [paused, setPaused] = useState(false)

  const getActor = useCallback(() => {
    return viewer?.renderer?.actors?.[0]
  }, [viewer])

  useEffect(() => {
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      const renderer = viewer?.renderer
      // Log structure on first few attempts to help debug
      if (attempts === 1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actor = renderer?.actors?.[0] as any
        if (actor) {
          console.log('[AnimDebug] actor full:', actor)
          console.log('[AnimDebug] actor.c full:', actor.c)
          if (actor.c?.k) {
            console.log('[AnimDebug] actor.c.k keys:', Object.keys(actor.c.k).join(', '))
            console.log('[AnimDebug] actor.c.k full:', actor.c.k)
          }
        }
      }

      // Animation names live at actor.c.k.x[].l in this minified build
      const actor = getActor()
      const seqs = actor?.c?.k?.x
      if (Array.isArray(seqs) && seqs.length > 0 && seqs[0]?.l) {
        const unique = [...new Set(seqs.map((e: { l: string }) => e.l))]
        console.log('[AnimDebug] Found', unique.length, 'unique animations')
        setAnimations(unique)
        clearInterval(interval)
      }

      // Stop polling after 20 seconds
      if (attempts > 40) {
        console.log('[AnimDebug] Gave up after 20s')
        clearInterval(interval)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [getActor, viewer])

  const handleAnimChange = (name: string) => {
    setCurrentAnim(name)
    setPaused(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actor = getActor() as any
    if (!actor) return

    // Find the sequence index for this animation name
    const seqs: Array<{ l: string }> = actor.c?.k?.x ?? []
    const idx = seqs.findIndex((e: { l: string }) => e.l === name)
    console.log(`[AnimDebug] Setting animation "${name}" (index ${idx})`)

    // Try approach 1: actor proto methods that might set animation
    // actor proto: E, u, ed, ih, ut, kj, G, yx, w, q, K, F, cba, D, M, O, b, e, g
    // Try each single-letter method with the animation name or index
    for (const method of ['E', 'G', 'D', 'M', 'O', 'b', 'e', 'g', 'u', 'w', 'K', 'F', 'q']) {
      try {
        if (typeof actor[method] === 'function') {
          // Don't actually call them all blindly - just log which exist
        }
      } catch { /* ignore */ }
    }

    // Try approach 2: viewer.method() dispatcher (used by Paperdoll.js)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = viewer as any
    try {
      v?.method?.('setAnimation', name)
      console.log('[AnimDebug] viewer.method("setAnimation", name) - no error')
    } catch (err) {
      console.log('[AnimDebug] viewer.method("setAnimation") failed:', err)
    }

    // Try approach 3: set on actor.c.k directly (the animation controller)
    const k = actor.c?.k
    if (k) {
      // Look for current animation index property
      const kKeys = Object.keys(k)
      for (const kk of kKeys) {
        if (typeof k[kk] === 'number' && k[kk] >= 0 && k[kk] < seqs.length) {
          console.log(`[AnimDebug] actor.c.k.${kk} = ${k[kk]} (could be anim index, "${seqs[k[kk]]}")`)
        }
      }
    }
  }

  const togglePause = () => {
    const next = !paused
    setPaused(next)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = viewer as any
    try {
      v?.method?.('setAnimPaused', next)
      console.log(`[AnimDebug] viewer.method("setAnimPaused", ${next}) - no error`)
    } catch (err) {
      console.log('[AnimDebug] setAnimPaused failed:', err)
    }
  }

  if (animations.length === 0) {
    return (
      <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
        Loading animations...
      </div>
    )
  }

  return (
    <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1 rounded bg-black/80 p-2 text-xs text-white">
      <div className="font-bold text-yellow-400">Animation Debug</div>
      <select
        value={currentAnim}
        onChange={(e) => handleAnimChange(e.target.value)}
        className="rounded bg-gray-800 px-1 py-0.5 text-xs text-white"
      >
        {animations.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <button
        onClick={togglePause}
        className="rounded bg-gray-700 px-1 py-0.5 hover:bg-gray-600"
      >
        {paused ? '▶ Play' : '⏸ Pause'}
      </button>
      <div className="text-gray-400">
        {animations.length} animations available
      </div>
    </div>
  )
}

export function ModelViewer({
  race = 1,
  gender = 0,
  items = [],
  className,
  debug = false,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ViewerInstance | null>(null)
  const idRef = useRef(`model-viewer-${Math.random().toString(36).slice(2, 9)}`)
  const [viewerReady, setViewerReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.id = idRef.current

    let cancelled = false
    setViewerReady(false)

    const initViewer = async () => {
      await ensureGlobals()
      if (cancelled) return

      const raceGenderId = race * 2 - 1 + gender
      const filteredItems = items.filter(([slot]) => !NOT_DISPLAYED_SLOTS.includes(slot))

      const config: Record<string, unknown> = {
        type: 2,
        contentPath: CONTENT_PATH,
        container: window.jQuery(`#${idRef.current}`),
        aspect: 1,
        dataEnv: 'classic',
        env: 'classic',
        gameDataEnv: 'classic',
        hd: false,
        items: filteredItems,
        models: {
          id: raceGenderId,
          type: 16, // CHARACTER
        },
      }

      try {
        const viewer = await new window.ZamModelViewer(config)
        if (!cancelled) {
          viewerRef.current = viewer
          setViewerReady(true)
        }
      } catch (err) {
        console.error('Model viewer init error:', err)
      }
    }

    initViewer()

    return () => {
      cancelled = true
      viewerRef.current?.destroy?.()
      container.innerHTML = ''
      viewerRef.current = null
    }
  }, [race, gender, items])

  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        className={className}
        style={{ width: '100%', height: '100%' }}
      />
      {debug && viewerReady && viewerRef.current && (
        <AnimationDebugPanel viewer={viewerRef.current} />
      )}
    </div>
  )
}
