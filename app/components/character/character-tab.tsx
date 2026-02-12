'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { PaperdollLayout } from './paperdoll-layout'
import { LevelScrubber } from '@/app/components/progression/level-scrubber'
import { Select } from '@/app/components/ui/select'
import { useItems } from '@/app/hooks/use-items'
import { computeEquippedAtLevel } from '@/app/lib/progression-utils'
import { VIEWER_SLOT_MAP, RACE_IDS } from '@/app/lib/viewer-constants'
import type { Item } from '@/app/lib/types'

const ModelViewer = dynamic(
  () => import('./model-viewer').then((m) => ({ default: m.ModelViewer })),
  { ssr: false }
)

// Test display IDs extracted from item_template.sql
const TEST_DISPLAY_IDS: Record<string, number> = {
  Head: 22920,
  Shoulder: 33004,
  Back: 23421,
  Chest: 25748,
  Wrist: 28820,
  Hands: 25750,
  Waist: 28386,
  Legs: 25343,
  Feet: 33009,
  'Main Hand': 29706,
  'Off Hand': 29701,
  Ranged: 29162,
}

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

export function CharacterTab() {
  const { data: allItems = [] } = useItems()
  const [selectedLevel, setSelectedLevel] = useState(60)
  const [race, setRace] = useState('human')
  const [gender, setGender] = useState(0)

  const equippedMap = useMemo(
    () => computeEquippedAtLevel(allItems, selectedLevel),
    [allItems, selectedLevel]
  )

  const equippedItems = useMemo(
    () => equippedMapToPaperdoll(equippedMap),
    [equippedMap]
  )

  const itemLevels = useMemo(
    () => [...new Set(allItems.map((i) => i.requiredLevel))].sort((a, b) => a - b),
    [allItems]
  )

  const viewerItems = useMemo<[number, number][]>(
    () =>
      Object.entries(TEST_DISPLAY_IDS)
        .filter(([slot]) => slot in VIEWER_SLOT_MAP)
        .map(([slot, displayId]) => [VIEWER_SLOT_MAP[slot], displayId]),
    []
  )

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
          />
        }
      />
    </div>
  )
}
