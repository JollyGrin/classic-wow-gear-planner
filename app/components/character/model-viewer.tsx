'use client'

import { useEffect, useRef } from 'react'

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

interface ModelViewerProps {
  race?: number
  gender?: number
  items?: [number, number][]
  className?: string
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

export function ModelViewer({
  race = 1,
  gender = 0,
  items = [],
  className,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<{ destroy?: () => void } | null>(null)
  const idRef = useRef(`model-viewer-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.id = idRef.current

    let cancelled = false

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
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
