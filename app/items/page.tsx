'use client'

import { ItemsTab } from '@/app/components/items'
import { useBisList } from '@/app/hooks/use-bis-list'

export default function ItemsPage() {
  const { addItem, hasItem } = useBisList()

  return <ItemsTab onAddItem={addItem} hasItem={hasItem} />
}
