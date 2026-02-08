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

  // Should show stats with 1 item
  await expect(page.getByText('Items: 1')).toBeVisible()
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

  // Should show 1 item initially
  await expect(page.getByText('Items: 1')).toBeVisible()

  // Wait for the timeline item to appear
  await expect(page.getByTestId('timeline-item').first()).toBeVisible()

  // Click the remove button using JavaScript (it's hidden with opacity:0 until hover)
  await page.evaluate(() => {
    const removeButton = document.querySelector('[aria-label^="Remove"]') as HTMLButtonElement
    if (removeButton) removeButton.click()
  })

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

  // Should show 2 items
  await expect(page.getByText('Items: 2')).toBeVisible()

  // Click clear all
  await page.getByRole('button', { name: /Clear All/ }).click()

  // Should show empty state
  await expect(page.getByText('No items in your progression list')).toBeVisible()
})

test('timeline shows level markers', async ({ page }) => {
  await page.goto('/')

  // Add an item
  await page.waitForSelector('[aria-label^="Add"]')
  await page.locator('[aria-label^="Add"]').first().click()

  // Switch to progression tab
  await page.getByRole('button', { name: /Progression/ }).click()

  // Should show stats bar
  await expect(page.getByText('Items: 1')).toBeVisible()
  await expect(page.getByText(/Levels:/)).toBeVisible()
})
