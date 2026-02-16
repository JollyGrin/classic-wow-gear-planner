/** Normalized slot name -> ZamModelViewer inventory type ID.
 *  Slots 1-10 are the same as equipment slots. Back, weapons, and ranged
 *  use the WoW InventoryType enum (16, 21, 22, 26) which the viewer needs
 *  to pick the correct CDN path and body position. */
export const VIEWER_SLOT_MAP: Record<string, number> = {
  Head: 1,
  Shoulder: 3,
  Chest: 5,
  Waist: 6,
  Legs: 7,
  Feet: 8,
  Wrist: 9,
  Hands: 10,
  Back: 16,
  'Main Hand': 21,
  'Off Hand': 22,
  Ranged: 26,
}

/** Race name -> ZamModelViewer race ID */
export const RACE_IDS: Record<string, number> = {
  human: 1,
  orc: 2,
  dwarf: 3,
  nightelf: 4,
  undead: 5,
  tauren: 6,
  gnome: 7,
  troll: 8,
  bloodelf: 10,
  draenei: 11,
}

/** Full WoW InventoryType enum as used by ZamModelViewer / WH.Wow.Item */
export const INVENTORY_TYPE = {
  HEAD: 1,
  NECK: 2,
  SHOULDERS: 3,
  SHIRT: 4,
  CHEST: 5,
  WAIST: 6,
  LEGS: 7,
  FEET: 8,
  WRISTS: 9,
  HANDS: 10,
  FINGER: 11,
  TRINKET: 12,
  ONE_HAND: 13,
  SHIELD: 14,
  RANGED: 15,
  BACK: 16,
  TWO_HAND: 17,
  BAG: 18,
  TABARD: 19,
  ROBE: 20,
  MAIN_HAND: 21,
  OFF_HAND: 22,
  HELD_IN_OFF_HAND: 23,
  PROJECTILE: 24,
  THROWN: 25,
  RANGED_RIGHT: 26,
  QUIVER: 27,
  RELIC: 28,
} as const

/** Slots that have no visual representation on the 3D model */
export const NOT_DISPLAYED_SLOTS = [2, 11, 12, 13, 14]
