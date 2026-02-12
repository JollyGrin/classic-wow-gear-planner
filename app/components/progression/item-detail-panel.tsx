'use client'

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { QUALITY_BORDERS, QUALITY_COLORS } from '@/app/lib/quality'
import { formatSource, formatDropChance } from '@/app/lib/progression-utils'
import { normalizeSlot } from '@/app/lib/slots'
import { Button } from '@/app/components/ui/button'
import type { Item, StatKey } from '@/app/lib/types'

const DISPLAY_STATS: { key: StatKey; label: string }[] = [
  { key: 'armor', label: 'Armor' },
  { key: 'stamina', label: 'Stamina' },
  { key: 'strength', label: 'Strength' },
  { key: 'agility', label: 'Agility' },
  { key: 'intellect', label: 'Intellect' },
  { key: 'spirit', label: 'Spirit' },
  { key: 'fireResist', label: 'Fire Resistance' },
  { key: 'frostResist', label: 'Frost Resistance' },
  { key: 'natureResist', label: 'Nature Resistance' },
  { key: 'shadowResist', label: 'Shadow Resistance' },
  { key: 'arcaneResist', label: 'Arcane Resistance' },
]

interface ItemDetailPanelProps {
  item: Item
  onClose: () => void
  onRemove?: (item: Item) => void
}

export function ItemDetailPanel({ item, onClose, onRemove }: ItemDetailPanelProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const iconUrl = `https://wow.zamimg.com/images/wow/icons/large/${item.icon}.jpg`
  const activeStats = DISPLAY_STATS.filter((s) => (item.stats?.[s.key] ?? 0) > 0)

  return (
    <div
      className="w-80 shrink-0 overflow-y-auto rounded border border-border bg-[oklch(0.22_0.005_250)] p-4"
      role="complementary"
      aria-label={`Details for ${item.name}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'h-12 w-12 shrink-0 overflow-hidden rounded border-2',
              QUALITY_BORDERS[item.quality],
            )}
          >
            <img src={iconUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className={cn('text-sm font-semibold', QUALITY_COLORS[item.quality])}>
              {item.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {normalizeSlot(item.slot)} &middot; iLvl {item.itemLevel}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close detail panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tooltip lines */}
      {item.tooltip.length > 0 && (
        <div className="mb-4 rounded bg-background/50 p-2 text-xs leading-relaxed">
          {item.tooltip.map((line, i) => (
            <div
              key={i}
              className={cn(
                line.format === 'Uncommon' && 'text-green-500',
                line.format === 'alignRight' && 'text-right text-muted-foreground',
                line.format === 'Misc' && 'text-muted-foreground',
                !line.format && 'text-foreground',
              )}
            >
              {line.label}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {activeStats.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-1 text-xs font-medium text-muted-foreground">Stats</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
            {activeStats.map(({ key, label }) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono font-medium text-green-400">
                  +{item.stats[key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source */}
      <div className="mb-4">
        <h4 className="mb-1 text-xs font-medium text-muted-foreground">Source</h4>
        <div className="text-xs">
          <div className="font-medium">{formatSource(item)}</div>
          {item.source?.category && (
            <div className="text-muted-foreground">{item.source.category}</div>
          )}
          {item.source?.dropChance && (
            <div className="text-muted-foreground">
              Drop chance: {formatDropChance(item.source.dropChance)}
            </div>
          )}
        </div>
      </div>

      {/* Level info */}
      <div className="mb-4 flex gap-4 text-xs">
        <div>
          <span className="text-muted-foreground">Required Level </span>
          <span className="font-mono font-medium">{item.requiredLevel}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Item Level </span>
          <span className="font-mono font-medium">{item.itemLevel}</span>
        </div>
      </div>

      {/* Remove */}
      {onRemove && (
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onRemove(item)}
        >
          Remove from list
        </Button>
      )}
    </div>
  )
}
