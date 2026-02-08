import { useEffect } from 'react'

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: {
    allowInInput?: boolean
  }
) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Don't trigger if modifier keys are held
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // Don't trigger if user is typing (unless allowed)
      if (!options?.allowInInput) {
        const target = e.target as HTMLElement
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target.isContentEditable
        ) {
          return
        }
      }

      if (e.key === key) {
        e.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [key, callback, options?.allowInInput])
}
