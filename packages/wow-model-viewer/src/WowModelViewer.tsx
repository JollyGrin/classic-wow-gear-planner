import { useEffect, useRef, useState } from 'react'
import { NOT_DISPLAYED_SLOTS } from './constants'
import { RACE_IDS } from './constants'
import { ensureGlobals } from './globals'
import { AnimationDebugPanel } from './AnimationDebugPanel'
import type { CameraState, ViewerInstance, WowModelViewerProps } from './types'

function resolveRaceId(race: string | number): number {
  if (typeof race === 'number') return race
  return RACE_IDS[race] ?? 1
}

export function WowModelViewer({
  contentPath,
  race = 'human',
  gender = 0,
  items = [],
  aspect = 3 / 4,
  animation = 'Walk',
  debug = false,
  className,
  dataEnv = 'classic',
  onReady,
  onError,
}: WowModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ViewerInstance | null>(null)
  const idRef = useRef(`model-viewer-${Math.random().toString(36).slice(2, 9)}`)
  const cameraRef = useRef<CameraState | null>(null)
  const animationRef = useRef<string | null>(null)
  const [viewerReady, setViewerReady] = useState(false)

  const raceId = resolveRaceId(race)
  const itemsKey = JSON.stringify(items)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.id = idRef.current

    let cancelled = false
    let cameraPollId: ReturnType<typeof setInterval> | null = null
    setViewerReady(false)

    const initViewer = async () => {
      try {
        await ensureGlobals(contentPath)
        if (cancelled) return

        const raceGenderId = raceId * 2 - 1 + gender
        const parsedItems: [number, number][] = JSON.parse(itemsKey)
        const filteredItems = parsedItems.filter(([slot]) => !NOT_DISPLAYED_SLOTS.includes(slot))

        const config: Record<string, unknown> = {
          type: 2,
          contentPath,
          container: window.jQuery(`#${idRef.current}`),
          aspect,
          dataEnv,
          env: dataEnv,
          gameDataEnv: dataEnv,
          hd: false,
          items: filteredItems,
          models: {
            id: raceGenderId,
            type: 16, // CHARACTER
          },
        }

        const viewer = await new window.ZamModelViewer(config)
        if (cancelled) return

        viewerRef.current = viewer
        setViewerReady(true)
        onReady?.()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const v = viewer as any

        // Continuously poll camera state so cameraRef always has
        // the latest values regardless of interaction type or timing
        cameraPollId = setInterval(() => {
          if (v.renderer) {
            cameraRef.current = {
              azimuth: v.renderer.azimuth,
              zenith: v.renderer.zenith,
              distance: v.renderer.distance,
              zoomTarget: v.renderer.zoom?.target ?? 1,
              zoomCurrent: v.renderer.zoom?.current ?? 1,
            }
          }
        }, 250)

        // Wait for model to fully load, then zero blend times and restore state
        const waitForModel = setInterval(() => {
          if (cancelled) {
            clearInterval(waitForModel)
            return
          }
          const seqs = v.renderer?.actors?.[0]?.c?.k?.x
          if (Array.isArray(seqs) && seqs.length > 0 && seqs[0]?.l) {
            clearInterval(waitForModel)
            if (v.renderer) v.renderer.crossFadeDuration = 0
            for (const seq of seqs) {
              seq.d = 0
              seq.j = 0
            }

            // Restore animation, falling back to configured default
            const anim = animationRef.current || animation
            if (window.WH) {
              ;(window.WH as Record<string, unknown>).defaultAnimation = anim
            }
            v.method?.('setAnimation', anim)

            // Restore camera orientation and zoom from previous instance
            if (cameraRef.current && v.renderer) {
              const saved = { ...cameraRef.current }
              v.renderer.azimuth = saved.azimuth
              v.renderer.zenith = saved.zenith
              v.renderer.distance = saved.distance
              if (v.renderer.zoom) {
                v.renderer.zoom.target = saved.zoomTarget
                v.renderer.zoom.current = saved.zoomCurrent
              }
            }
          }
        }, 200)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error('Model viewer init error:', error)
        onError?.(error)
      }
    }

    initViewer()

    return () => {
      cancelled = true
      if (cameraPollId) clearInterval(cameraPollId)
      const defaultAnim = window.WH?.defaultAnimation
      if (typeof defaultAnim === 'string') {
        animationRef.current = defaultAnim
      }
      viewerRef.current?.destroy?.()
      container.innerHTML = ''
      viewerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceId, gender, itemsKey, contentPath, dataEnv, aspect])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
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
