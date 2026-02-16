import { useCallback, useEffect, useRef, useState } from 'react'
import type { ViewerInstance } from './types'

const styles = {
  container: {
    position: 'absolute' as const,
    bottom: 8,
    left: 8,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    fontSize: 12,
    color: 'white',
  },
  loading: {
    position: 'absolute' as const,
    bottom: 8,
    left: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '4px 8px',
    fontSize: 12,
    color: 'white',
  },
  title: {
    fontWeight: 'bold' as const,
    color: '#facc15',
  },
  select: {
    borderRadius: 4,
    backgroundColor: '#1f2937',
    padding: '2px 4px',
    fontSize: 12,
    color: 'white',
    border: 'none',
  },
  button: {
    borderRadius: 4,
    backgroundColor: '#374151',
    padding: '2px 4px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: 12,
  },
  info: {
    color: '#9ca3af',
  },
}

export function AnimationDebugPanel({ viewer }: { viewer: ViewerInstance }) {
  const [animations, setAnimations] = useState<string[]>([])
  const [currentAnim, setCurrentAnim] = useState('Stand')
  const [paused, setPaused] = useState(false)
  const blendsZeroed = useRef(false)

  const getActor = useCallback(() => {
    return viewer?.renderer?.actors?.[0]
  }, [viewer])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSeqs = useCallback((): any[] | null => {
    const seqs = getActor()?.c?.k?.x
    return Array.isArray(seqs) ? seqs : null
  }, [getActor])

  useEffect(() => {
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      const seqs = getSeqs()
      if (seqs && seqs.length > 0 && seqs[0]?.l) {
        setAnimations([...new Set(seqs.map((e: { l: string }) => e.l))])
        clearInterval(interval)
      }
      if (attempts > 40) clearInterval(interval)
    }, 500)
    return () => clearInterval(interval)
  }, [getSeqs])

  const handleAnimChange = (name: string) => {
    setCurrentAnim(name)
    setPaused(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = viewer as any
    const renderer = v?.renderer

    // Zero out all blend/transition times once so looping is seamless
    if (!blendsZeroed.current) {
      blendsZeroed.current = true
      if (renderer) renderer.crossFadeDuration = 0
      const seqs = getSeqs()
      if (seqs) {
        for (const seq of seqs) {
          seq.d = 0 // blend time field 1
          seq.j = 0 // blend time field 2
        }
      }
    }

    // Set as default animation so the viewer loops it naturally
    if (window.WH) {
      ;(window.WH as Record<string, unknown>).defaultAnimation = name
    }
    v?.method?.('setAnimation', name)
  }

  const togglePause = () => {
    const next = !paused
    setPaused(next)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = viewer as any
    v?.method?.('setAnimPaused', next)
  }

  if (animations.length === 0) {
    return <div style={styles.loading}>Loading animations...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>Animation Debug</div>
      <select
        value={currentAnim}
        onChange={(e) => handleAnimChange(e.target.value)}
        style={styles.select}
      >
        {animations.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <button onClick={togglePause} style={styles.button}>
        {paused ? '\u25b6 Play' : '\u23f8 Pause'}
      </button>
      <div style={styles.info}>{animations.length} animations available</div>
    </div>
  )
}
