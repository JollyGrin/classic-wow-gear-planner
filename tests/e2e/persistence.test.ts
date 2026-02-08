import { test, expect } from '@playwright/test'

test('URL sharing encodes item IDs in hash', async ({ page }) => {
  await page.goto('/')

  // Wait for items to load
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()

  // Add an item
  await page.waitForSelector('[aria-label^="Add"]')
  await page.locator('[aria-label^="Add"]').first().click()

  // Wait for URL to update
  await page.waitForURL(/#bis=/)

  // URL should have #bis= hash
  expect(page.url()).toContain('#bis=')
})

test('loading URL with bis hash imports items', async ({ page }) => {
  // First, add an item and get the URL
  await page.goto('/')
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()
  await page.waitForSelector('[aria-label^="Add"]')
  await page.locator('[aria-label^="Add"]').first().click()

  // Get the URL with hash
  const urlWithHash = page.url()

  // Navigate away and back with the hash
  await page.goto('about:blank')
  await page.goto(urlWithHash)

  // Wait for page to load
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()

  // Switch to progression and verify item is there
  await page.getByRole('button', { name: /Progression \(1\)/ }).click()
  await expect(page.getByText('Items: 1')).toBeVisible()
})

test('added items show check mark', async ({ page }) => {
  await page.goto('/')

  // Wait for items to load
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()

  // Add first item
  await page.waitForSelector('[aria-label^="Add"]')
  await page.locator('[aria-label^="Add"]').first().click()

  // The first item should now show a check mark instead of add button
  // Check that the Check icon is visible (it's in a div with text-green-500)
  await expect(page.locator('.text-green-500').first()).toBeVisible()
})

test('clearing all items shows empty state', async ({ page }) => {
  await page.goto('/')

  // Add items
  await expect(page.getByPlaceholder('Search items...')).toBeVisible()
  await page.waitForSelector('[aria-label^="Add"]')
  await page.locator('[aria-label^="Add"]').first().click()
  await page.locator('[aria-label^="Add"]').nth(1).click()

  // Go to progression and clear all
  await page.getByRole('button', { name: /Progression \(2\)/ }).click()
  await page.getByRole('button', { name: /Clear All/ }).click()

  // Should show empty state
  await expect(page.getByText('No items in your progression list')).toBeVisible()

  // Progression button should not show count
  await expect(page.getByRole('button', { name: 'Progression', exact: true })).toBeVisible()
})
