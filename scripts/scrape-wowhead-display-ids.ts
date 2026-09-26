/**
 * Scrape Wowhead display IDs for all items in items.json.
 *
 * Fetches /classic/item={id}&xml for each item, extracts displayId and slotId.
 * Results are persisted incrementally to a cache file so the script can resume.
 *
 * Usage: bun run scripts/scrape-wowhead-display-ids.ts
 *
 * Options (env vars):
 *   CONCURRENCY=2       Number of parallel requests (default: 2)
 *   DELAY_MS=1000       Delay between batches in ms (default: 1000)
 *   CLEAR_ZEROS=1       Clear cached zero displayIds to re-scrape (default: false)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dir, '..')
const ITEMS_PATH = join(ROOT, 'public/data/items.json')
const CACHE_PATH = join(ROOT, 'data/external/wowhead-display-id-cache.json')
const OUTPUT_PATH = join(ROOT, 'public/data/display-ids.json')

const CONCURRENCY = parseInt(process.env.CONCURRENCY || '2', 10)
const DELAY_MS = parseInt(process.env.DELAY_MS || '1000', 10)
const CLEAR_ZEROS = process.env.CLEAR_ZEROS === '1'

interface CacheEntry {
  displayId: number
  slotId: number
}

function loadCache(): Record<string, CacheEntry> {
  if (existsSync(CACHE_PATH)) {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'))
  }
  return {}
}

function saveCache(cache: Record<string, CacheEntry>) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
}

function loadItemIds(): number[] {
  const items = JSON.parse(readFileSync(ITEMS_PATH, 'utf-8'))
  return items.map((item: { itemId: number }) => item.itemId)
}

async function fetchDisplayId(itemId: number): Promise<CacheEntry> {
  try {
    const res = await fetch(`https://www.wowhead.com/classic/item=${itemId}&xml`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/xml,application/xml',
        Referer: 'https://www.wowhead.com/',
      },
    })

    if (!res.ok) {
      return { displayId: -1, slotId: 0 }  // -1 = fetch error, distinct from real 0
    }

    const xml = await res.text()

    // Check for Cloudflare/rate limit response
    if (xml.includes('cf-browser-verification') || xml.includes('challenge-platform') || !xml.includes('<?xml')) {
      return { displayId: -1, slotId: 0 }  // Rate limited
    }

    const displayMatch = xml.match(/displayId="(\d+)"/)
    const slotMatch = xml.match(/inventorySlot id="(\d+)"/)

    return {
      displayId: displayMatch ? Number(displayMatch[1]) : 0,
      slotId: slotMatch ? Number(slotMatch[1]) : 0,
    }
  } catch {
    return { displayId: -1, slotId: 0 }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const allItemIds = loadItemIds()
  const cache = loadCache()

  // Optionally clear zero entries to re-scrape
  if (CLEAR_ZEROS) {
    let cleared = 0
    for (const [key, entry] of Object.entries(cache)) {
      if (entry.displayId === 0) {
        delete cache[key]
        cleared++
      }
    }
    if (cleared > 0) {
      console.log(`Cleared ${cleared} zero-displayId entries from cache`)
      saveCache(cache)
    }
  }

  // Only fetch items not in cache (or with error marker -1)
  const toFetch = allItemIds.filter((id) => {
    const entry = cache[String(id)]
    return !entry || entry.displayId === -1
  })

  console.log(`Total items: ${allItemIds.length}`)
  console.log(`Already cached (valid): ${Object.keys(cache).length - toFetch.filter(id => cache[String(id)]?.displayId === -1).length}`)
  console.log(`To fetch: ${toFetch.length}`)
  console.log(`Concurrency: ${CONCURRENCY}, delay: ${DELAY_MS}ms`)
  console.log()

  if (toFetch.length === 0) {
    console.log('All items already cached. Building output...')
  } else {
    let completed = 0
    let succeeded = 0
    let rateLimited = 0
    let consecutiveErrors = 0
    const startTime = Date.now()

    for (let i = 0; i < toFetch.length; i += CONCURRENCY) {
      const batch = toFetch.slice(i, i + CONCURRENCY)

      const results = await Promise.all(
        batch.map(async (itemId) => {
          const result = await fetchDisplayId(itemId)
          return { itemId, result }
        })
      )

      for (const { itemId, result } of results) {
        if (result.displayId === -1) {
          rateLimited++
          consecutiveErrors++
        } else {
          cache[String(itemId)] = result
          completed++
          if (result.displayId > 0) succeeded++
          consecutiveErrors = 0
        }
      }

      // Save cache periodically
      if (completed % 50 < CONCURRENCY) {
        saveCache(cache)
      }

      const elapsed = (Date.now() - startTime) / 1000
      const rate = completed / Math.max(elapsed, 1)
      const remaining = toFetch.length - i - batch.length
      const eta = remaining / Math.max(rate, 0.1)

      process.stdout.write(
        `\r  ${completed + rateLimited}/${toFetch.length} | ` +
        `Valid: ${succeeded} | Zero: ${completed - succeeded} | Rate limited: ${rateLimited} | ` +
        `${rate.toFixed(1)}/s | ETA: ${Math.ceil(eta / 60)}m`
      )

      // If we get too many consecutive errors, back off
      if (consecutiveErrors >= 10) {
        console.log(`\n  Rate limit detected (${consecutiveErrors} consecutive errors). Backing off 30s...`)
        await sleep(30000)
        consecutiveErrors = 0
      } else {
        await sleep(DELAY_MS)
      }
    }

    console.log('\n')
    saveCache(cache)
    console.log(`Cache saved to ${CACHE_PATH}`)
  }

  // Build compact output: { "itemId": { "d": displayId, "s": slotId } }
  const output: Record<string, { d: number; s: number }> = {}
  let withDisplay = 0
  let withoutDisplay = 0

  for (const itemId of allItemIds) {
    const entry = cache[String(itemId)]
    if (entry && entry.displayId > 0) {
      output[String(itemId)] = { d: entry.displayId, s: entry.slotId }
      withDisplay++
    } else {
      withoutDisplay++
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output))
  const sizeMB = (Buffer.byteLength(JSON.stringify(output)) / 1024 / 1024).toFixed(2)

  console.log(`\nOutput: ${OUTPUT_PATH} (${sizeMB} MB)`)
  console.log(`  With display ID: ${withDisplay} (${((withDisplay / allItemIds.length) * 100).toFixed(1)}%)`)
  console.log(`  Without display ID: ${withoutDisplay}`)
}

main().catch(console.error)
