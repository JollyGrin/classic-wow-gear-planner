'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface LevelContextValue {
  selectedLevel: number
  setSelectedLevel: (level: number) => void
}

const LevelContext = createContext<LevelContextValue | null>(null)

export function LevelProvider({ children }: { children: ReactNode }) {
  const [selectedLevel, setSelectedLevel] = useState(60)

  return (
    <LevelContext.Provider value={{ selectedLevel, setSelectedLevel }}>
      {children}
    </LevelContext.Provider>
  )
}

export function useLevel() {
  const ctx = useContext(LevelContext)
  if (!ctx) throw new Error('useLevel must be used within LevelProvider')
  return ctx
}
