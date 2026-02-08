'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { ItemsTab } from '@/app/components/items'
import { ProgressionTab } from '@/app/components/progression'
import { useBisList } from '@/app/hooks/use-bis-list'

type Tab = 'items' | 'progression'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('items')
  const { items, isLoading, addItem, removeItem, clearAll, hasItem } = useBisList()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Gear Journey</h1>
          <nav className="flex gap-2">
            <Button
              variant={activeTab === 'items' ? 'default' : 'outline'}
              onClick={() => setActiveTab('items')}
            >
              Items
            </Button>
            <Button
              variant={activeTab === 'progression' ? 'default' : 'outline'}
              onClick={() => setActiveTab('progression')}
            >
              Progression {items.length > 0 && `(${items.length})`}
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <>
            {activeTab === 'items' && (
              <ItemsTab onAddItem={addItem} hasItem={hasItem} />
            )}
            {activeTab === 'progression' && (
              <ProgressionTab
                items={items}
                onRemoveItem={removeItem}
                onClearAll={clearAll}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
