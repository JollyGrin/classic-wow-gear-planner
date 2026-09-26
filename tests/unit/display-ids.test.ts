import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchDisplayId, _resetForTesting } from '@/app/lib/display-ids'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockStaticDataResponse(data: Record<string, { d: number; s: number }>) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function mockApiResponse(displayId: number, slotId = 0) {
  return new Response(JSON.stringify({ displayId, slotId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('display-ids', () => {
  beforeEach(() => {
    _resetForTesting()
    mockFetch.mockReset()
  })

  describe('fetchDisplayId', () => {
    it('returns display ID from static data when available', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/data/display-ids.json') {
          return Promise.resolve(mockStaticDataResponse({
            '647': { d: 20190, s: 17 },
            '5341': { d: 7551, s: 5 },
          }))
        }
        return Promise.resolve(new Response('Not found', { status: 404 }))
      })

      const result = await fetchDisplayId(647)
      expect(result).toBe(20190)
    })

    it('falls back to API when item not in static data', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/data/display-ids.json') {
          return Promise.resolve(mockStaticDataResponse({
            '647': { d: 20190, s: 17 },
          }))
        }
        if (url === '/api/wowhead-display-id/99999') {
          return Promise.resolve(mockApiResponse(12345))
        }
        return Promise.resolve(new Response('Not found', { status: 404 }))
      })

      const result = await fetchDisplayId(99999)
      expect(result).toBe(12345)
    })

    it('returns cached value on subsequent calls without fetching', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/data/display-ids.json') {
          return Promise.resolve(mockStaticDataResponse({
            '647': { d: 20190, s: 17 },
          }))
        }
        return Promise.resolve(new Response('Not found', { status: 404 }))
      })

      // First call loads static data + resolves
      const result1 = await fetchDisplayId(647)
      expect(result1).toBe(20190)

      mockFetch.mockReset()

      // Second call should use cache — no fetch at all
      const result2 = await fetchDisplayId(647)
      expect(result2).toBe(20190)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('deduplicates concurrent requests for the same item', async () => {
      let apiCallCount = 0
      mockFetch.mockImplementation((url: string) => {
        if (url === '/data/display-ids.json') {
          return Promise.resolve(mockStaticDataResponse({}))
        }
        if (url.includes('/api/wowhead-display-id/')) {
          apiCallCount++
          return Promise.resolve(mockApiResponse(7551))
        }
        return Promise.resolve(new Response('Not found', { status: 404 }))
      })

      const [r1, r2] = await Promise.all([
        fetchDisplayId(5341),
        fetchDisplayId(5341),
      ])

      expect(r1).toBe(7551)
      expect(r2).toBe(7551)
      expect(apiCallCount).toBe(1)
    })

    it('returns 0 when API fails', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/data/display-ids.json') {
          return Promise.resolve(mockStaticDataResponse({}))
        }
        return Promise.reject(new Error('Network error'))
      })

      const result = await fetchDisplayId(99999)
      expect(result).toBe(0)
    })

    it('handles static data load failure gracefully and falls back to API', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === '/data/display-ids.json') {
          return Promise.reject(new Error('Network error'))
        }
        if (url === '/api/wowhead-display-id/647') {
          return Promise.resolve(mockApiResponse(20190))
        }
        return Promise.resolve(new Response('Not found', { status: 404 }))
      })

      const result = await fetchDisplayId(647)
      expect(result).toBe(20190)
    })

    it('loads static data only once across multiple calls', async () => {
      let staticLoadCount = 0
      mockFetch.mockImplementation((url: string) => {
        if (url === '/data/display-ids.json') {
          staticLoadCount++
          return Promise.resolve(mockStaticDataResponse({
            '100': { d: 1000, s: 5 },
            '200': { d: 2000, s: 1 },
          }))
        }
        return Promise.resolve(new Response('Not found', { status: 404 }))
      })

      await fetchDisplayId(100)
      await fetchDisplayId(200)

      expect(staticLoadCount).toBe(1)
    })
  })
})
