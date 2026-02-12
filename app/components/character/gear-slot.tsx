'use client'

import { cn } from '@/app/lib/utils'
import { QUALITY_BORDERS } from '@/app/lib/quality'
import type { Item } from '@/app/lib/types'
import type { EquipmentSlot } from '@/app/lib/slots'

interface GearSlotProps {
  slot: EquipmentSlot
  item?: Item | null
  label?: string
}

export function GearSlot({ slot, item, label }: GearSlotProps) {
  const iconUrl = item
    ? `https://wow.zamimg.com/images/wow/icons/large/${item.icon}.jpg`
    : null

  return (
    <div className="group relative flex flex-col items-center gap-0.5">
      <div
        className={cn(
          'relative h-11 w-11 overflow-hidden rounded-sm border-2 transition-all',
          item
            ? cn(QUALITY_BORDERS[item.quality], 'shadow-[0_0_6px_rgba(0,0,0,0.5)]')
            : 'border-[oklch(0.35_0.01_45)] bg-[oklch(0.15_0.005_250)]',
        )}
        title={item?.name}
      >
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={item?.name ?? ''}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-3xs uppercase text-muted-foreground/20 select-none">
              {label ?? slot}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
