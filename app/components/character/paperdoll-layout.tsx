'use client'

import { GearSlot } from './gear-slot'
import type { Item } from '@/app/lib/types'
import type { EquipmentSlot } from '@/app/lib/slots'

type SlotKey = EquipmentSlot | 'Finger 2' | 'Trinket 2'

interface PaperdollLayoutProps {
  equippedItems: Partial<Record<SlotKey, Item>>
  modelSlot?: React.ReactNode
}

const LEFT_SLOTS: { slot: SlotKey; label: string }[] = [
  { slot: 'Head', label: 'Head' },
  { slot: 'Neck', label: 'Neck' },
  { slot: 'Shoulder', label: 'Shoulder' },
  { slot: 'Back', label: 'Back' },
  { slot: 'Chest', label: 'Chest' },
  { slot: 'Wrist', label: 'Wrist' },
]

const RIGHT_SLOTS: { slot: SlotKey; label: string }[] = [
  { slot: 'Hands', label: 'Hands' },
  { slot: 'Waist', label: 'Waist' },
  { slot: 'Legs', label: 'Legs' },
  { slot: 'Feet', label: 'Feet' },
  { slot: 'Finger', label: 'Finger' },
  { slot: 'Finger 2', label: 'Finger' },
  { slot: 'Trinket', label: 'Trinket' },
  { slot: 'Trinket 2', label: 'Trinket' },
]

const BOTTOM_SLOTS: { slot: SlotKey; label: string }[] = [
  { slot: 'Main Hand', label: 'Main Hand' },
  { slot: 'Off Hand', label: 'Off Hand' },
  { slot: 'Ranged', label: 'Ranged' },
]

export function PaperdollLayout({ equippedItems, modelSlot }: PaperdollLayoutProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main 3-column layout */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 w-full max-w-lg">
        {/* Left column */}
        <div className="flex flex-col gap-1.5 justify-center">
          {LEFT_SLOTS.map(({ slot, label }) => (
            <GearSlot
              key={slot}
              slot={slot as EquipmentSlot}
              item={equippedItems[slot]}
              label={label}
            />
          ))}
        </div>

        {/* Center — model viewer or placeholder */}
        <div className="flex items-center justify-center">
          <div className="aspect-[3/4] min-h-[420px] w-full rounded border border-border/30 bg-[oklch(0.15_0.005_250)] flex items-center justify-center overflow-hidden">
            {modelSlot ?? (
              <span className="text-xs text-muted-foreground/20 select-none">Model</span>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-1.5 justify-center">
          {RIGHT_SLOTS.map(({ slot, label }) => (
            <GearSlot
              key={slot}
              slot={slot as EquipmentSlot}
              item={equippedItems[slot]}
              label={label}
            />
          ))}
        </div>
      </div>

      {/* Bottom weapon slots */}
      <div className="flex gap-2">
        {BOTTOM_SLOTS.map(({ slot, label }) => (
          <GearSlot
            key={slot}
            slot={slot as EquipmentSlot}
            item={equippedItems[slot]}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
