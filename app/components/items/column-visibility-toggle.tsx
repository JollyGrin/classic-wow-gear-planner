'use client'

import { useEffect, useRef, useState } from 'react'
import { type Table as TanTable } from '@tanstack/react-table'
import { Button } from '@/app/components/ui/button'
import { Columns3 } from 'lucide-react'
import type { Item } from '@/app/lib/types'

const STAT_COLUMNS = [
  { id: 'armor', label: 'Armor' },
  { id: 'stamina', label: 'Stamina' },
  { id: 'strength', label: 'Strength' },
  { id: 'agility', label: 'Agility' },
  { id: 'intellect', label: 'Intellect' },
  { id: 'spirit', label: 'Spirit' },
  { id: 'fireResist', label: 'Fire Resist' },
  { id: 'frostResist', label: 'Frost Resist' },
  { id: 'natureResist', label: 'Nature Resist' },
  { id: 'shadowResist', label: 'Shadow Resist' },
  { id: 'arcaneResist', label: 'Arcane Resist' },
]

const INFO_COLUMNS = [
  { id: 'slot', label: 'Slot' },
  { id: 'quality', label: 'Quality' },
  { id: 'source', label: 'Source' },
]

interface ColumnVisibilityToggleProps {
  table: TanTable<Item>
}

export function ColumnVisibilityToggle({ table }: ColumnVisibilityToggleProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const allStatIds = STAT_COLUMNS.map((c) => c.id)
  const allStatsVisible = allStatIds.every(
    (id) => table.getColumn(id)?.getIsVisible()
  )
  const noStatsVisible = allStatIds.every(
    (id) => !table.getColumn(id)?.getIsVisible()
  )

  const toggleAllStats = (visible: boolean) => {
    for (const id of allStatIds) {
      table.getColumn(id)?.toggleVisibility(visible)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-label="Toggle columns"
      >
        <Columns3 className="h-4 w-4 mr-1" />
        Columns
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-md border bg-popover p-3 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Toggle columns</span>
            <div className="flex gap-1">
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => toggleAllStats(true)}
                disabled={allStatsVisible}
              >
                Show All
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => toggleAllStats(false)}
                disabled={noStatsVisible}
              >
                Hide All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1 block">Stats</span>
              <div className="space-y-1">
                {STAT_COLUMNS.map(({ id, label }) => {
                  const col = table.getColumn(id)
                  if (!col) return null
                  return (
                    <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={col.getIsVisible()}
                        onChange={col.getToggleVisibilityHandler()}
                        className="rounded"
                      />
                      {label}
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1 block">Info</span>
              <div className="space-y-1">
                {INFO_COLUMNS.map(({ id, label }) => {
                  const col = table.getColumn(id)
                  if (!col) return null
                  return (
                    <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={col.getIsVisible()}
                        onChange={col.getToggleVisibilityHandler()}
                        className="rounded"
                      />
                      {label}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
