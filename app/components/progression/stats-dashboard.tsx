'use client'

import { cn } from '@/app/lib/utils'
import type { ItemStats, StatKey } from '@/app/lib/types'

interface StatsDashboardProps {
  stats: ItemStats
  slotsFilled: number
  totalSlots: number
}

const BASE_STATS: { key: StatKey; label: string }[] = [
  { key: 'armor', label: 'Armor' },
  { key: 'stamina', label: 'STA' },
  { key: 'strength', label: 'STR' },
  { key: 'agility', label: 'AGI' },
  { key: 'intellect', label: 'INT' },
  { key: 'spirit', label: 'SPI' },
]

const RESIST_STATS: { key: StatKey; label: string; color: string }[] = [
  { key: 'fireResist', label: 'Fire', color: 'bg-red-500/20 text-red-400' },
  { key: 'frostResist', label: 'Frost', color: 'bg-blue-400/20 text-blue-300' },
  { key: 'natureResist', label: 'Nature', color: 'bg-green-500/20 text-green-400' },
  { key: 'shadowResist', label: 'Shadow', color: 'bg-purple-400/20 text-purple-300' },
  { key: 'arcaneResist', label: 'Arcane', color: 'bg-amber-400/20 text-amber-300' },
]

export function StatsDashboard({ stats, slotsFilled, totalSlots }: StatsDashboardProps) {
  const activeResists = RESIST_STATS.filter((r) => (stats[r.key] ?? 0) > 0)

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      {/* Base stats */}
      {BASE_STATS.map(({ key, label }) => {
        const value = stats[key] ?? 0
        if (value === 0 && key !== 'armor') return null
        return (
          <div key={key} className="flex items-center gap-1">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono font-medium">{value}</span>
          </div>
        )
      })}

      {/* Resistances */}
      {activeResists.length > 0 && (
        <div className="flex items-center gap-1">
          {activeResists.map(({ key, label, color }) => (
            <span
              key={key}
              className={cn('rounded-full px-1.5 py-0.5 text-2xs font-mono', color)}
            >
              {label} {stats[key]}
            </span>
          ))}
        </div>
      )}

      {/* Coverage */}
      <div className="flex items-center gap-1 text-muted-foreground">
        <span className="font-mono font-medium text-foreground">
          {slotsFilled}/{totalSlots}
        </span>
        <span>slots</span>
      </div>
    </div>
  )
}
