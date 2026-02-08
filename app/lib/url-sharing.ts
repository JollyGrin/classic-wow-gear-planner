/**
 * Encode a list of item IDs into a URL hash.
 */
export function encodeBisList(itemIds: number[]): string {
  if (itemIds.length === 0) return ''
  return `#bis=${itemIds.join(',')}`
}

/**
 * Decode a URL hash into a list of item IDs.
 */
export function decodeBisList(hash: string): number[] {
  const match = hash.match(/#bis=(.+)/)
  if (!match) return []
  return match[1]
    .split(',')
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0)
}

/**
 * Update the URL hash without triggering navigation.
 */
export function updateUrlHash(itemIds: number[]): void {
  const hash = encodeBisList(itemIds)
  if (hash) {
    window.history.replaceState(null, '', hash)
  } else {
    // Remove hash without triggering navigation
    window.history.replaceState(null, '', window.location.pathname)
  }
}

/**
 * Get the current URL hash.
 */
export function getUrlHash(): string {
  return typeof window !== 'undefined' ? window.location.hash : ''
}
