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

test('virtual scroll renders rows', async ({ page }) => {
  await page.goto('/')

  // Wait for table to load with rows
  await expect(page.getByTestId('table-row').first()).toBeVisible({ timeout: 10000 })

  // Should have multiple rows visible
  const rowCount = await page.getByTestId('table-row').count()
  expect(rowCount).toBeGreaterThan(5)
})

test('can sort by clicking column header', async ({ page }) => {
  await page.goto('/')

  // Wait for table to render
  await expect(page.getByTestId('table-row').first()).toBeVisible({ timeout: 10000 })

  // Click iLvl header to sort
  await page.getByText('iLvl').click()

  // Should show sort indicator
  await expect(page.locator('svg.lucide-arrow-up, svg.lucide-arrow-down').first()).toBeVisible()
})

test('can toggle stat column visibility', async ({ page }) => {
  await page.goto('/')

  // Wait for table to render
  await expect(page.getByTestId('table-row').first()).toBeVisible({ timeout: 10000 })

  // Open columns dropdown
  await page.getByRole('button', { name: 'Toggle columns' }).click()

  // Toggle Stamina on
  await page.getByLabel('Stamina').check()

  // STA header should now be visible in the table
  await expect(page.getByText('STA', { exact: true })).toBeVisible()
})

test('shift-click for multi-sort', async ({ page }) => {
  await page.goto('/')

  // Wait for table to render
  await expect(page.getByTestId('table-row').first()).toBeVisible({ timeout: 10000 })

  // Click iLvl to sort first
  await page.getByText('iLvl').click()

  // Shift+click Req Lvl for multi-sort
  await page.getByText('Req Lvl').click({ modifiers: ['Shift'] })

  // Both columns should have sort indicators
  const sortIndicators = page.locator('svg.lucide-arrow-up, svg.lucide-arrow-down')
  await expect(sortIndicators).toHaveCount(2)
})
