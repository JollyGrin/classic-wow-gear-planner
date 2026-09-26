/**
 * Build a static display-ids.json lookup from the thatsmybis SQL dump.
 *
 * Parses item_template.sql to extract: itemId → { displayId, inventoryType }
 * Cross-references with items.json to only include items we actually need.
 *
 * Usage: bun run scripts/build-display-ids.ts
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dir, '..')
const SQL_PATH = join(ROOT, 'data/external/item_template.sql')
const ITEMS_PATH = join(ROOT, 'public/data/items.json')
const OUTPUT_PATH = join(ROOT, 'public/data/display-ids.json')

// Column positions in the INSERT statement (0-indexed)
// item_id=0, patch=1, class=2, subclass=3, name=4, description=5, display_id=6
// ... inventory_type=12
const COL_ITEM_ID = 0
const COL_DISPLAY_ID = 6
const COL_INVENTORY_TYPE = 12

interface DisplayIdEntry {
  d: number  // displayId
  s: number  // inventoryType (slot)
}

function parseSQL(sqlPath: string): Map<number, DisplayIdEntry> {
  const sql = readFileSync(sqlPath, 'utf-8')
  const map = new Map<number, DisplayIdEntry>()

  // Match each VALUES row: (val1, val2, ...)
  const rowRegex = /\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*'(?:[^'\\]|\\.)*',\s*'(?:[^'\\]|\\.)*',\s*(\d+),.*?,\s*(\d+)(?:,|\))/g

  // Simpler approach: split on row boundaries and extract fields
  // Each row starts with \t( and ends with ),\n or );\n
  const lines = sql.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('(')) continue

    // Extract values between parentheses
    // We need to handle quoted strings carefully
    const values: string[] = []
    let i = 1 // skip opening (
    let inQuote = false
    let escaped = false
    let current = ''

    while (i < trimmed.length) {
      const ch = trimmed[i]

      if (escaped) {
        current += ch
        escaped = false
        i++
        continue
      }

      if (ch === '\\') {
        escaped = true
        current += ch
        i++
        continue
      }

      if (ch === "'" && !inQuote) {
        inQuote = true
        current += ch
        i++
        continue
      }

      if (ch === "'" && inQuote) {
        inQuote = false
        current += ch
        i++
        continue
      }

      if (ch === ',' && !inQuote) {
        values.push(current.trim())
        current = ''
        i++
        continue
      }

      if ((ch === ')' || ch === ';') && !inQuote) {
        values.push(current.trim())
        break
      }

      current += ch
      i++
    }

    if (values.length > COL_INVENTORY_TYPE) {
      const itemId = parseInt(values[COL_ITEM_ID], 10)
      const displayId = parseInt(values[COL_DISPLAY_ID], 10)
      const inventoryType = parseInt(values[COL_INVENTORY_TYPE], 10)

      if (!isNaN(itemId) && !isNaN(displayId) && displayId > 0) {
        map.set(itemId, { d: displayId, s: inventoryType })
      }
    }
  }

  return map
}

function loadItemIds(itemsPath: string): Set<number> {
  const items = JSON.parse(readFileSync(itemsPath, 'utf-8'))
  return new Set(items.map((item: { itemId: number }) => item.itemId))
}

function main() {
  console.log('Parsing SQL dump...')
  const allDisplayIds = parseSQL(SQL_PATH)
  console.log(`  Found ${allDisplayIds.size} items with display IDs in SQL dump`)

  console.log('Loading items.json...')
  const ourItemIds = loadItemIds(ITEMS_PATH)
  console.log(`  Our items.json has ${ourItemIds.size} items`)

  // Filter to only items we have
  const matched: Record<string, DisplayIdEntry> = {}
  let matchCount = 0
  let missCount = 0

  for (const itemId of ourItemIds) {
    const entry = allDisplayIds.get(itemId)
    if (entry) {
      matched[itemId] = entry
      matchCount++
    } else {
      missCount++
    }
  }

  console.log(`\nCoverage:`)
  console.log(`  Matched: ${matchCount} / ${ourItemIds.size} (${((matchCount / ourItemIds.size) * 100).toFixed(1)}%)`)
  console.log(`  Missing: ${missCount}`)

  // Analyze missing items by ID range
  const missing: number[] = []
  for (const itemId of ourItemIds) {
    if (!allDisplayIds.has(itemId)) missing.push(itemId)
  }
  missing.sort((a, b) => a - b)

  const ranges = {
    vanilla: missing.filter(id => id < 24000).length,
    tbc: missing.filter(id => id >= 24000 && id < 40000).length,
    custom: missing.filter(id => id >= 40000).length,
  }
  console.log(`\nMissing by range:`)
  console.log(`  Vanilla (<24k): ${ranges.vanilla}`)
  console.log(`  TBC-era (24k-40k): ${ranges.tbc}`)
  console.log(`  Turtle WoW custom (40k+): ${ranges.custom}`)

  // Sample some matched entries for verification
  console.log(`\nSample entries for verification:`)
  const sampleIds = [647, 2589, 5341, 12640, 14551]
  for (const id of sampleIds) {
    const entry = allDisplayIds.get(id)
    if (entry) {
      console.log(`  Item ${id}: displayId=${entry.d}, inventoryType=${entry.s}`)
    }
  }

  // Write output
  writeFileSync(OUTPUT_PATH, JSON.stringify(matched))
  const sizeMB = (Buffer.byteLength(JSON.stringify(matched)) / 1024 / 1024).toFixed(2)
  console.log(`\nWrote ${OUTPUT_PATH} (${sizeMB} MB)`)
}

main()
