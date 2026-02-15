/** Normalized slot name → ZamModelViewer inventory type ID.
 *  Slots 1–10 are the same as equipment slots. Back, weapons, and ranged
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

/** Race name → ZamModelViewer race ID */
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
