'use client'

import { useQuery } from '@tanstack/react-query'
import { ItemsService } from '@/app/lib/items-service'
import type { Item } from '@/app/lib/types'

async function fetchItems(): Promise<Item[]> {
  const service = ItemsService.getInstance()
  await service.loadItems()
  return service.getItems()
}

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
