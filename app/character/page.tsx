'use client'

import { CharacterTab } from '@/app/components/character'
import { useBisList } from '@/app/hooks/use-bis-list'

export default function CharacterPage() {
  const { items, isLoading } = useBisList()

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }

  return <CharacterTab items={items} />
}
