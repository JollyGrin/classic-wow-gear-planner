import { INVENTORY_TYPE } from './constants'

export function loadScript(src: string): Promise<void> {
  const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
  if (existing) {
    if (existing.dataset.loaded === 'true') return Promise.resolve()
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error(`Failed to load: ${src}`)))
    })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

export function setupWowheadGlobals(contentPath: string) {
  window.CONTENT_PATH = contentPath
  window.WOTLK_TO_RETAIL_DISPLAY_ID_API = undefined

  if (!window.WH) {
    const webp = { getImageExtension: () => '.webp' }
    window.WH = {
      debug: (...args: unknown[]) => console.log(args),
      defaultAnimation: 'Walk',
      WebP: webp,
      Wow: {
        Item: {
          INVENTORY_TYPE_HEAD: INVENTORY_TYPE.HEAD,
          INVENTORY_TYPE_NECK: INVENTORY_TYPE.NECK,
          INVENTORY_TYPE_SHOULDERS: INVENTORY_TYPE.SHOULDERS,
          INVENTORY_TYPE_SHIRT: INVENTORY_TYPE.SHIRT,
          INVENTORY_TYPE_CHEST: INVENTORY_TYPE.CHEST,
          INVENTORY_TYPE_WAIST: INVENTORY_TYPE.WAIST,
          INVENTORY_TYPE_LEGS: INVENTORY_TYPE.LEGS,
          INVENTORY_TYPE_FEET: INVENTORY_TYPE.FEET,
          INVENTORY_TYPE_WRISTS: INVENTORY_TYPE.WRISTS,
          INVENTORY_TYPE_HANDS: INVENTORY_TYPE.HANDS,
          INVENTORY_TYPE_FINGER: INVENTORY_TYPE.FINGER,
          INVENTORY_TYPE_TRINKET: INVENTORY_TYPE.TRINKET,
          INVENTORY_TYPE_ONE_HAND: INVENTORY_TYPE.ONE_HAND,
          INVENTORY_TYPE_SHIELD: INVENTORY_TYPE.SHIELD,
          INVENTORY_TYPE_RANGED: INVENTORY_TYPE.RANGED,
          INVENTORY_TYPE_BACK: INVENTORY_TYPE.BACK,
          INVENTORY_TYPE_TWO_HAND: INVENTORY_TYPE.TWO_HAND,
          INVENTORY_TYPE_BAG: INVENTORY_TYPE.BAG,
          INVENTORY_TYPE_TABARD: INVENTORY_TYPE.TABARD,
          INVENTORY_TYPE_ROBE: INVENTORY_TYPE.ROBE,
          INVENTORY_TYPE_MAIN_HAND: INVENTORY_TYPE.MAIN_HAND,
          INVENTORY_TYPE_OFF_HAND: INVENTORY_TYPE.OFF_HAND,
          INVENTORY_TYPE_HELD_IN_OFF_HAND: INVENTORY_TYPE.HELD_IN_OFF_HAND,
          INVENTORY_TYPE_PROJECTILE: INVENTORY_TYPE.PROJECTILE,
          INVENTORY_TYPE_THROWN: INVENTORY_TYPE.THROWN,
          INVENTORY_TYPE_RANGED_RIGHT: INVENTORY_TYPE.RANGED_RIGHT,
          INVENTORY_TYPE_QUIVER: INVENTORY_TYPE.QUIVER,
          INVENTORY_TYPE_RELIC: INVENTORY_TYPE.RELIC,
          INVENTORY_TYPE_PROFESSION_TOOL: 29,
          INVENTORY_TYPE_PROFESSION_ACCESSORY: 30,
        },
      },
    }
  }
}

export async function ensureGlobals(contentPath: string) {
  if (typeof window.ZamModelViewer !== 'undefined') return

  setupWowheadGlobals(contentPath)

  await loadScript('https://code.jquery.com/jquery-3.5.1.min.js')
  await loadScript(`${contentPath}viewer/viewer.min.js`)
}
