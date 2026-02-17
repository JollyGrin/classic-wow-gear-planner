'use client'

import { ProgressionTab } from '@/app/components/progression'
import { useBisList } from '@/app/hooks/use-bis-list'

export default function ProgressionPage() {
  const { items, isLoading, removeItem, clearAll } = useBisList()

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }

  return (
    <ProgressionTab
      items={items}
      onRemoveItem={removeItem}
      onClearAll={clearAll}
    />
  )
}
