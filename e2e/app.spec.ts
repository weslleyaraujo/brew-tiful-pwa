import { test, expect } from '@playwright/test'

// Helper: navigate to a specific recipe
async function goToRecipe(page: any, method: string, recipeName: string) {
  await page.goto('/')
  await page.getByText(method, { exact: true }).click()
  await page.waitForTimeout(200)
  await page.getByText(recipeName).click()
  await page.waitForTimeout(300)
}

// Helper: open adjustments sheet
async function openAdjustments(page: any) {
  // The adjustments button is the last button with a svg in the header row
  // Use a specific selector for the header area
  const headerRow = page.locator('div.flex.items-center.gap-3').first()
  const buttons = headerRow.locator('button')
  const lastBtn = buttons.last()
  await lastBtn.click()
  await page.waitForTimeout(300)
}

test.describe('Brew-tiful App', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  // ── Home Screen ──

  test('renders home screen with greeting and method grid', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    const methodCards = page.locator('.grid.grid-cols-2 button')
    await expect(methodCards).toHaveCount(6)
    await expect(page.getByText('V60')).toBeVisible()
    await expect(page.getByText('Aeropress')).toBeVisible()
    await expect(page.getByText('Chemex')).toBeVisible()
    await expect(page.getByText('French Press')).toBeVisible()
    await expect(page.getByText('Moka Pot')).toBeVisible()
    await expect(page.getByText('Stagg')).toBeVisible()
  })

  test('shows tab bar with 3 tabs', async ({ page }) => {
    await page.goto('/')
    const tabs = page.locator('nav button')
    await expect(tabs).toHaveCount(3)
  })

  // ── Method Screen ──

  test('navigates to method screen and shows recipes', async ({ page }) => {
    await page.goto('/')
    await page.getByText('V60', { exact: true }).click()
    await expect(page.getByText('Hoffman V60 Method')).toBeVisible()
  })

  test('shows empty state for method with no recipes', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Moka Pot').click()
    await expect(page.getByText('No recipes yet')).toBeVisible()
  })

  test('back button returns to home', async ({ page }) => {
    await page.goto('/')
    await page.getByText('V60', { exact: true }).click()
    // First button in header is back
    const headerRow = page.locator('div.flex.items-center.gap-3').first()
    await headerRow.locator('button').first().click()
    await expect(page.locator('h1')).toBeVisible()
  })

  // ── Recipe Screen ──

  test('navigates to recipe screen and shows details', async ({ page }) => {
    await goToRecipe(page, 'V60', 'Hoffman V60 Method')
    await expect(page.getByText('Hoffman V60 Method')).toBeVisible()
    await expect(page.getByText('Beans')).toBeVisible()
    await expect(page.getByText('Ratio')).toBeVisible()
    // 9 steps
    const stepElements = page.locator('.flex.flex-col.gap-2 > div')
    await expect(stepElements).toHaveCount(9)
    await expect(page.getByText('Start')).toBeVisible()
  })

  // ── Adjustments Sheet ──

  test('opens adjustments sheet', async ({ page }) => {
    await goToRecipe(page, 'V60', 'Hoffman V60 Method')
    await openAdjustments(page)
    await expect(page.getByText('How many servings?')).toBeVisible()
    await expect(page.getByText('Adjustments')).toBeVisible()
    await page.getByText('Done').click()
    await expect(page.getByText('How many servings?')).not.toBeVisible()
  })

  test('adjustments: ratio lock/unlock works', async ({ page }) => {
    await goToRecipe(page, 'V60', 'Hoffman V60 Method')
    await openAdjustments(page)

    // First number input is ratio (1:XX), initially disabled
    const ratioInput = page.locator('input[type="number"]').first()
    await expect(ratioInput).toBeVisible()
    await expect(ratioInput).toBeDisabled()

    // Click the lock button inside the sheet (scope to the bottom sheet)
    const sheet = page.locator('.fixed.bottom-0')
    const lockBtn = sheet.locator('button:has(svg)').first()
    await lockBtn.click()
    await page.waitForTimeout(200)

    // Ratio should now be enabled
    await expect(ratioInput).toBeEnabled()
    await page.getByText('Done').click()
  })

  test('adjustments: changing servings updates water', async ({ page }) => {
    await goToRecipe(page, 'V60', 'Hoffman V60 Method')
    await openAdjustments(page)

    // Water input is second number input
    const waterInput = page.locator('input[type="number"]').nth(1)
    await expect(waterInput).toBeVisible()
    const initialWater = await waterInput.inputValue()
    expect(Number(initialWater)).toBe(250)

    // Change slider to 3 (600ml)
    const slider = page.locator('input[type="range"]')
    await slider.evaluate((el: HTMLInputElement, val: string) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set
      setter?.call(el, val)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }, '3')
    await page.waitForTimeout(300)

    const newWater = await waterInput.inputValue()
    expect(Number(newWater)).toBe(600)

    await page.getByText('Done').click()
    await page.waitForTimeout(200)
    await expect(page.getByText('Adjusted')).toBeVisible()
  })

  // ── Brew Screen ──

  test('navigates to brew screen from recipe', async ({ page }) => {
    await goToRecipe(page, 'V60', 'Hoffman V60 Method')
    await page.getByText('Start').click()
    await page.waitForTimeout(300)
    await expect(page.getByText('1 / 9')).toBeVisible()
    await expect(page.getByText('Grind Coffee')).toBeVisible()
  })

  test('brew screen: can navigate through steps', async ({ page }) => {
    await goToRecipe(page, 'V60', 'Hoffman V60 Method')
    await page.getByText('Start').click()
    await page.waitForTimeout(300)

    await expect(page.getByText('1 / 9')).toBeVisible()
    await page.getByText('Next').click()
    await page.waitForTimeout(200)
    await expect(page.getByText('2 / 9')).toBeVisible()
    await expect(page.getByText('Rinse Filter')).toBeVisible()

    await page.getByText('Next').click()
    await page.waitForTimeout(200)
    await expect(page.getByText('3 / 9')).toBeVisible()
    await expect(page.getByText('Add Coffee & Water')).toBeVisible()
  })

  test('brew screen: timer shows on bloom step', async ({ page }) => {
    await goToRecipe(page, 'V60', 'Hoffman V60 Method')
    await page.getByText('Start').click()
    await page.waitForTimeout(300)
    // Navigate to step 4 (Bloom)
    for (let i = 0; i < 3; i++) {
      await page.getByText('Next').click()
      await page.waitForTimeout(200)
    }
    await expect(page.getByText('Bloom')).toBeVisible()
    await expect(page.locator('svg circle').first()).toBeVisible()
  })

  // ── Favorites ──

  test('can favorite a recipe', async ({ page }) => {
    await goToRecipe(page, 'V60', 'Hoffman V60 Method')
    // Heart button is the second button in the header row
    const headerRow = page.locator('div.flex.items-center.gap-3').first()
    const buttons = headerRow.locator('button')
    await buttons.nth(1).click() // second button = heart
    await page.waitForTimeout(200)

    // Go back to tabs first, then navigate to favorites
    await buttons.first().click() // back button
    await page.waitForTimeout(300)

    // Now we're on the home tab, navigate to favorites
    const navButtons = page.locator('nav button')
    await navButtons.nth(1).click()
    await page.waitForTimeout(300)
    await expect(page.getByText('Hoffman V60 Method')).toBeVisible()
  })

  test('favorites tab shows empty state', async ({ page }) => {
    await page.goto('/')
    const navButtons = page.locator('nav button')
    await navButtons.nth(1).click()
    await expect(page.getByText('No favorites yet')).toBeVisible()
  })

  // ── Settings ──

  test('settings screen shows all options', async ({ page }) => {
    await page.goto('/')
    const navButtons = page.locator('nav button')
    await navButtons.nth(2).click()
    await expect(page.getByText('Theme')).toBeVisible()
    await expect(page.getByText('Units')).toBeVisible()
    await expect(page.getByText('Brewing')).toBeVisible()
  })

  test('can change theme to dark', async ({ page }) => {
    await page.goto('/')
    const navButtons = page.locator('nav button')
    await navButtons.nth(2).click()
    await page.getByText('Dark').click()
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })

  // ── Brew completion ──

  test('completes a full brew flow', async ({ page }) => {
    await goToRecipe(page, 'V60', 'Hoffman V60 Method')
    await page.getByText('Start').click()
    await page.waitForTimeout(300)

    // Click Next until Finish
    for (let i = 0; i < 10; i++) {
      const finishBtn = page.getByText('Finish')
      if (await finishBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        await finishBtn.click()
        break
      }
      const nextBtn = page.getByText('Next')
      if (await nextBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        await nextBtn.click()
        await page.waitForTimeout(150)
      } else {
        break
      }
    }

    await page.waitForTimeout(500)
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
  })

  // ── Edge Cases ──

  test('can navigate between tabs without losing state', async ({ page }) => {
    await page.goto('/')
    // Go to settings
    const navButtons = page.locator('nav button')
    await navButtons.nth(2).click()
    await expect(page.getByText('Theme')).toBeVisible()
    // Go to favorites
    await navButtons.nth(1).click()
    await expect(page.getByText('No favorites yet')).toBeVisible()
    // Go home
    await navButtons.nth(0).click()
    await expect(page.locator('h1')).toBeVisible()
  })

})
