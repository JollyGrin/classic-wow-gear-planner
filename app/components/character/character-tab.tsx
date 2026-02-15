'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { PaperdollLayout } from './paperdoll-layout'
import { LevelScrubber } from '@/app/components/progression/level-scrubber'
import { Select } from '@/app/components/ui/select'
import { useDisplayIds } from '@/app/lib/display-ids'
import { computeEquippedAtLevel } from '@/app/lib/progression-utils'
import { VIEWER_SLOT_MAP, RACE_IDS } from '@/app/lib/viewer-constants'
import type { Item } from '@/app/lib/types'

const ModelViewer = dynamic(
  () => import('./model-viewer').then((m) => ({ default: m.ModelViewer })),
  { ssr: false }
)

const RACE_LABELS: Record<string, string> = {
  human: 'Human',
  orc: 'Orc',
  dwarf: 'Dwarf',
  nightelf: 'Night Elf',
  undead: 'Undead',
  tauren: 'Tauren',
  gnome: 'Gnome',
  troll: 'Troll',
  bloodelf: 'Blood Elf',
  draenei: 'Draenei',
}

/** Convert EquippedMap (slot → Item[]) to paperdoll format (slot → Item),
 *  expanding dual-equip slots like Finger → Finger + Finger 2. */
function equippedMapToPaperdoll(map: Record<string, Item[]>): Partial<Record<string, Item>> {
  const result: Record<string, Item> = {}
  for (const [slot, items] of Object.entries(map)) {
    if (items[0]) result[slot] = items[0]
    if (items[1]) result[`${slot} 2`] = items[1]
  }
  return result
}

export function CharacterTab({ items }: { items: Item[] }) {
  const [selectedLevel, setSelectedLevel] = useState(60)
  const [race, setRace] = useState('human')
  const [gender, setGender] = useState(0)
  const [debugAnimations, setDebugAnimations] = useState(false)

  const equippedMap = useMemo(
    () => computeEquippedAtLevel(items, selectedLevel),
    [items, selectedLevel]
  )

  const equippedItems = useMemo(
    () => equippedMapToPaperdoll(equippedMap),
    [equippedMap]
  )

  const itemLevels = useMemo(
    () => [...new Set(items.map((i) => i.requiredLevel))].sort((a, b) => a - b),
    [items]
  )

  // Collect item IDs from equipped items that have viewer slots
  const equippedItemIds = useMemo(() => {
    const ids: number[] = []
    for (const [slot, slotItems] of Object.entries(equippedMap)) {
      if (!(slot in VIEWER_SLOT_MAP)) continue
      if (slotItems[0]) ids.push(slotItems[0].itemId)
    }
    return ids
  }, [equippedMap])

  const { getDisplayId, displayIds } = useDisplayIds(equippedItemIds)

  const viewerItems = useMemo<[number, number][]>(() => {
    const pairs: [number, number][] = []
    for (const [slot, slotItems] of Object.entries(equippedMap)) {
      const viewerSlot = VIEWER_SLOT_MAP[slot]
      if (viewerSlot === undefined) continue
      const item = slotItems[0]
      if (!item) continue
      const displayId = getDisplayId(item.itemId)
      if (displayId) pairs.push([viewerSlot, displayId])
    }
    return pairs
  }, [equippedMap, displayIds, getDisplayId])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-end gap-3">
        <Select
          value={race}
          onChange={(e) => setRace(e.target.value)}
          className="w-32"
        >
          {Object.keys(RACE_IDS).map((r) => (
            <option key={r} value={r}>
              {RACE_LABELS[r]}
            </option>
          ))}
        </Select>
        <Select
          value={gender}
          onChange={(e) => setGender(Number(e.target.value))}
          className="w-28"
        >
          <option value={0}>Male</option>
          <option value={1}>Female</option>
        </Select>
        <button
          onClick={() => setDebugAnimations((d) => !d)}
          className={`rounded border px-2 py-1 text-xs ${debugAnimations ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}
          title="Toggle animation debug panel"
        >
          Anim Debug
        </button>
      </div>
      <div className="w-full max-w-lg">
        <LevelScrubber
          level={selectedLevel}
          onLevelChange={setSelectedLevel}
          itemLevels={itemLevels}
        />
      </div>
      <PaperdollLayout
        equippedItems={equippedItems}
        modelSlot={
          <ModelViewer
            race={RACE_IDS[race]}
            gender={gender}
            items={viewerItems}
            debug={debugAnimations}
          />
        }
      />
    </div>
  )
}
