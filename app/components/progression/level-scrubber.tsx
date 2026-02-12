'use client'

import { useCallback } from 'react'
import { cn } from '@/app/lib/utils'

interface LevelScrubberProps {
  level: number
  onLevelChange: (level: number) => void
  itemLevels: number[]
}

const MILESTONES = [10, 20, 30, 40, 50, 60]

export function LevelScrubber({ level, onLevelChange, itemLevels }: LevelScrubberProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onLevelChange(Number(e.target.value))
    },
    [onLevelChange],
  )

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <span className="font-serif text-sm text-muted-foreground">
          Level <span className="font-mono text-base font-semibold text-foreground">{level}</span>
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={1}
          max={60}
          value={level}
          onChange={handleChange}
          className="level-scrubber w-full"
          aria-label="Level scrubber"
        />
        {/* Tick marks for levels that have items */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-2" aria-hidden>
          {itemLevels.map((lvl) => (
            <div
              key={lvl}
              className={cn(
                'absolute h-2 w-0.5 -translate-x-1/2',
                lvl <= level ? 'bg-[oklch(0.75_0.15_85)]' : 'bg-muted-foreground/30',
              )}
              style={{ left: `${((lvl - 1) / 59) * 100}%` }}
            />
          ))}
        </div>
        {/* Milestone labels */}
        <div className="flex justify-between px-0.5 text-2xs text-muted-foreground/50">
          {MILESTONES.map((m) => (
            <span key={m} className={cn('font-mono', m <= level && 'text-muted-foreground')}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
