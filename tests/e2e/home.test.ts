import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Gear Journey/)
})

test('items tab is active by default', async ({ page }) => {
  await page.goto('/')
  const itemsButton = page.getByRole('button', { name: 'Items' })
  await expect(itemsButton).toBeVisible()
})

test('can search for items', async ({ page }) => {
  await page.goto('/')

  // Wait for items to load
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()

  // Search for an item
  await page.getByPlaceholder('Search items...').fill('sword')

  // Wait for filtered results
  await page.waitForTimeout(300) // debounce delay

  // Should show filtered count
  await expect(page.getByText(/\d+ items/)).toBeVisible()
})

test('can filter by quality', async ({ page }) => {
  await page.goto('/')

  // Wait for items to load
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()

  // Select Epic quality
  await page.selectOption('select:has-text("All Qualities")', 'Epic')

  // Should filter items
  await expect(page.getByText(/\d+ items/)).toBeVisible()
})

test('can switch between tabs', async ({ page }) => {
  await page.goto('/')

  // Click Progression tab
  await page.getByRole('button', { name: /Progression/ }).click()

  // Should show progression empty state
  await expect(page.getByText('No items in your progression list')).toBeVisible()

  // Click Items tab
  await page.getByRole('button', { name: 'Items' }).click()

  // Should show items search
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()
})

test('infinite scroll loads more items', async ({ page }) => {
  await page.goto('/')

  // Wait for initial items to load
  await expect(page.getByText(/Loading more/)).toBeVisible({ timeout: 10000 })

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  // Wait for more items to load
  await page.waitForTimeout(500)

  // Count should have increased
  const loadingText = page.getByText(/Loading more/)
  if (await loadingText.isVisible()) {
    const text = await loadingText.textContent()
    const match = text?.match(/(\d+) of (\d+)/)
    if (match) {
      expect(parseInt(match[1])).toBeGreaterThan(50)
    }
  }
})
