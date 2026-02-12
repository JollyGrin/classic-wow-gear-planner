'use client'

import { cn } from '@/app/lib/utils'

interface SlotColumnHeaderProps {
  slotName: string
  itemCount: number
  isGroupStart?: boolean
}

export function SlotColumnHeader({ slotName, itemCount, isGroupStart }: SlotColumnHeaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex items-center justify-center gap-1.5 bg-background px-1 py-2 text-xs font-medium',
        isGroupStart && 'border-l border-border',
      )}
    >
      <span className="truncate text-muted-foreground">{slotName}</span>
      <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-2xs font-mono text-muted-foreground">
        {itemCount}
      </span>
    </div>
  )
}
