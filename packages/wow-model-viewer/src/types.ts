export type Race =
  | 'human'
  | 'orc'
  | 'dwarf'
  | 'nightelf'
  | 'undead'
  | 'tauren'
  | 'gnome'
  | 'troll'
  | 'bloodelf'
  | 'draenei'

export type Gender = 0 | 1

/** Wowhead inventory type IDs used by ZamModelViewer */
export type SlotId =
  | 1  // Head
  | 2  // Neck
  | 3  // Shoulders
  | 4  // Shirt
  | 5  // Chest
  | 6  // Waist
  | 7  // Legs
  | 8  // Feet
  | 9  // Wrists
  | 10 // Hands
  | 11 // Finger
  | 12 // Trinket
  | 13 // One-Hand
  | 14 // Shield
  | 15 // Ranged
  | 16 // Back
  | 17 // Two-Hand
  | 18 // Bag
  | 19 // Tabard
  | 20 // Robe
  | 21 // Main Hand
  | 22 // Off Hand
  | 23 // Held in Off Hand
  | 24 // Projectile
  | 25 // Thrown
  | 26 // Ranged Right

/** Equipment entry: [inventoryType, wowheadDisplayId] */
export type ItemEntry = [SlotId, number]

export interface CameraState {
  azimuth: number
  zenith: number
  distance: number
  zoomTarget: number
  zoomCurrent: number
}

export interface DisplayIdFetchOptions {
  /** Base URL for the display ID API endpoint. Default: '/api/wowhead-display-id' */
  baseUrl?: string
}

export interface WowModelViewerProps {
  /** CORS proxy base URL to wow.zamimg.com (required — forces consumers to set up their proxy) */
  contentPath: string
  /** Character race (string for autocomplete, number for advanced) */
  race?: Race | number
  /** 0=male, 1=female */
  gender?: Gender
  /** Equipment as [inventoryType, wowheadDisplayId] pairs */
  items?: ItemEntry[]
  /** Canvas aspect ratio (must match CSS container). Default: 3/4 */
  aspect?: number
  /** Default animation name. Default: 'Walk' */
  animation?: string
  /** Show animation debug panel */
  debug?: boolean
  /** CSS class on inner container */
  className?: string
  /** Data environment. Default: 'classic' */
  dataEnv?: 'classic' | 'live'
  /** Fires when model loaded */
  onReady?: () => void
  /** Fires on init failure */
  onError?: (err: Error) => void
}

declare global {
  interface Window {
    jQuery: (selector: string) => unknown
    ZamModelViewer: new (config: Record<string, unknown>) => Promise<ViewerInstance>
    CONTENT_PATH: string
    WOTLK_TO_RETAIL_DISPLAY_ID_API: string | undefined
    WH: Record<string, unknown>
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ViewerInstance = {
  destroy?: () => void
  renderer?: {
    actors?: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    azimuth?: number
    zenith?: number
    distance?: number
    crossFadeDuration?: number
    zoom?: { target: number; current: number }
  }
  method?: (name: string, ...args: unknown[]) => void
}
