import { test, expect } from '@playwright/test'

test('progression tab shows empty state', async ({ page }) => {
  await page.goto('/')

  // Switch to progression tab
  await page.getByRole('button', { name: /Progression/ }).click()

  // Should show empty state
  await expect(page.getByText('No items in your progression list')).toBeVisible()
})

test('can add item and see it in progression', async ({ page }) => {
  await page.goto('/')

  // Wait for items to load
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()

  // Wait for items list to appear
  await page.waitForSelector('[aria-label^="Add"]')

  // Click first add button
  await page.locator('[aria-label^="Add"]').first().click()

  // Switch to progression tab - check for count in button
  await page.getByRole('button', { name: /Progression \(1\)/ }).click()

  // Should show the level scrubber
  await expect(page.getByLabel('Level scrubber')).toBeVisible()

  // Should show stats dashboard with slot count
  await expect(page.getByText(/slots/)).toBeVisible()
})

test('can remove item from progression', async ({ page }) => {
  await page.goto('/')

  // Wait for items to load
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()

  // Wait for items list to appear and add first item
  await page.waitForSelector('[aria-label^="Add"]')
  await page.locator('[aria-label^="Add"]').first().click()

  // Switch to progression tab
  await page.getByRole('button', { name: /Progression \(1\)/ }).click()

  // Should show the grid with an item card
  await expect(page.getByTestId('item-card').first()).toBeVisible()

  // Click the item card to open the detail panel
  await page.getByTestId('item-card').first().click()

  // Click "Remove from list" in the detail panel
  await page.getByRole('button', { name: 'Remove from list' }).click()

  // Should show empty state again
  await expect(page.getByText('No items in your progression list')).toBeVisible()
})

test('can clear all items', async ({ page }) => {
  await page.goto('/')

  // Wait for items to load
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()

  // Add multiple items
  await page.waitForSelector('[aria-label^="Add"]')
  await page.locator('[aria-label^="Add"]').first().click()
  await page.locator('[aria-label^="Add"]').nth(1).click()

  // Switch to progression tab
  await page.getByRole('button', { name: /Progression \(2\)/ }).click()

  // Should show item cards
  await expect(page.getByTestId('item-card').first()).toBeVisible()

  // Click clear all
  await page.getByRole('button', { name: /Clear All/ }).click()

  // Should show empty state
  await expect(page.getByText('No items in your progression list')).toBeVisible()
})

test('level scrubber is interactive', async ({ page }) => {
  await page.goto('/')

  // Add an item
  await page.waitForSelector('[aria-label^="Add"]')
  await page.locator('[aria-label^="Add"]').first().click()

  // Switch to progression tab
  await page.getByRole('button', { name: /Progression/ }).click()

  // Level scrubber should be visible
  const scrubber = page.getByLabel('Level scrubber')
  await expect(scrubber).toBeVisible()

  // Should show the grid
  await expect(page.getByRole('grid', { name: 'Gear progression grid' })).toBeVisible()
})
