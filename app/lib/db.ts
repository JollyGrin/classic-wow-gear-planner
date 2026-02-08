import Dexie, { type EntityTable } from 'dexie'

export interface BiSEntry {
  id?: number
  itemId: number
  addedAt: number
  slot: string
}

const db = new Dexie('gear-journey') as Dexie & {
  bisItems: EntityTable<BiSEntry, 'id'>
}

db.version(1).stores({
  bisItems: '++id, itemId, addedAt, slot',
})

export { db }
