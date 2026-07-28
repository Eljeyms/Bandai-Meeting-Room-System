import { expect, test } from '@playwright/test'

test.describe('Admin view', () => {
  test('dashboard exposes the full administration workspace', async ({ page }) => {
    await page.goto('/#/dashboard')
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Workflow Templates' })).toBeVisible()
    await expect(page.getByText('Quick Actions')).toBeVisible()
    await expect(page.getByText('Administration Shortcuts')).toBeVisible()
    const sidebarBrandingIsCompact = await page.evaluate(() => {
      if (window.innerWidth <= 900) return true
      const sidebar = document.querySelector<HTMLElement>('.side')
      const logo = sidebar?.querySelector<HTMLImageElement>('.brand img')
      if (!sidebar || !logo) return false
      return sidebar.getBoundingClientRect().width <= 254 && logo.getBoundingClientRect().width <= 140
    })
    expect(sidebarBrandingIsCompact).toBe(true)
  })

  test('workflow templates can be activated or paused', async ({ page }) => {
    await page.goto('/#/workflow')
    await expect(page.getByRole('heading', { name: 'Workflow Templates', exact: true, level: 1 })).toBeVisible()
    const quickHuddle = page.getByRole('article').filter({ hasText: 'Quick Huddle' })
    await expect(quickHuddle.getByText('Paused')).toBeVisible()
    await quickHuddle.getByRole('button', { name: 'Activate template' }).click()
    await expect(quickHuddle.getByText('Active')).toBeVisible()
  })

  test('schedule and calendar are separate focused tabs', async ({ page }) => {
    await page.goto('/#/schedule')
    await expect(page.locator('[data-view="schedule"]')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Meeting schedule' })).toBeVisible()
    await expect(page.getByTestId('calendar-canvas')).toHaveCount(0)

    await page.goto('/#/calendar')
    await expect(page.locator('[data-view="calendar"]')).toBeVisible()
    await page.getByRole('button', { name: 'Month', exact: true }).click()
    await expect(page.locator('.month-view')).toBeVisible()
    await page.getByRole('button', { name: 'Day', exact: true }).click()
    await expect(page.locator('.day-view')).toBeVisible()
  })

  test('room management, reports, profile, and HRIS accounts load', async ({ page }) => {
    const routes = [
      { hash: 'rooms', heading: 'Room Management' },
      { hash: 'overview', heading: 'Rooms overview' },
      { hash: 'reports', heading: 'Reports' },
      { hash: 'profile', heading: 'Profile' },
      { hash: 'hris', heading: 'HRIS Accounts' },
    ]

    for (const route of routes) {
      await page.goto(`/#/${route.hash}`)
      await expect(page.getByRole('heading', { name: route.heading, exact: true }).first()).toBeVisible()
      if (route.hash === 'overview') {
        await expect(page.locator('.overview-top img')).toHaveCount(0)
        await expect(page.getByLabel(/room camera preview/)).toHaveCount(4)
        const fitsDesktopViewport = await page.evaluate(
          () => window.innerWidth <= 900 || document.documentElement.scrollHeight <= window.innerHeight,
        )
        expect(fitsDesktopViewport).toBe(true)
      }
    }
  })

  test('room display smart controls work in manual mode', async ({ page }) => {
    await page.goto('/#/display')
    await expect(page.locator('.tablet-top img')).toHaveCount(0)
    await expect(page.getByText('Connecting Fun and More')).toHaveCount(0)
    const roomPicker = page.getByRole('button', { name: /Select room display/ })
    await expect(roomPicker).toContainText('Meeting Room 3B')
    await roomPicker.click()
    await page.getByRole('option', { name: /Focus Suite 1C/ }).click()
    await expect(roomPicker).toContainText('Focus Suite 1C')
    await page.getByRole('button', { name: 'Manual', exact: true }).click()
    const lightControl = page.getByRole('button', { name: /^Lights:/ })
    await lightControl.click()
    await expect(lightControl).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('Front desk and public views', () => {
  test('role switch opens the front desk dashboard and limited navigation', async ({ page }) => {
    await page.goto('/#/dashboard')
    await page.getByRole('combobox', { name: 'Select system view' }).selectOption('frontdesk')
    await expect(page).toHaveURL(/#\/frontdesk-dashboard$/)
    await expect(page.getByRole('heading', { name: 'Front Desk Dashboard' })).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('button', { name: 'HRIS Accounts' })).toHaveCount(0)
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Calendar' })).toBeVisible()
  })

  test('front desk schedule, reports, calendar, and profile load', async ({ page }) => {
    const routes = [
      { hash: 'frontdesk-schedule', heading: 'Front Desk Schedule' },
      { hash: 'frontdesk-reports', heading: 'Front Desk Reports' },
      { hash: 'frontdesk-calendar', heading: 'Front Desk Calendar' },
      { hash: 'frontdesk-profile', heading: 'Front Desk Profile' },
    ]

    for (const route of routes) {
      await page.goto(`/#/${route.hash}`)
      await expect(page.getByRole('heading', { name: route.heading, exact: true })).toBeVisible()
    }
  })

  test('public view shows only the daily room schedule', async ({ page }) => {
    await page.goto('/#/public')
    await expect(page.getByRole('heading', { name: /Today’s Room Schedule/ })).toBeVisible()
    await expect(page.getByRole('navigation')).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Current schedule highlights' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Today’s agenda' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Daily meeting schedule' })).toBeVisible()
  })
})

test('mobile navigation remains usable', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only behavior')
  await page.goto('/#/dashboard')
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(page.getByRole('navigation')).toBeVisible()
  await page.getByRole('navigation').getByRole('button', { name: 'Calendar' }).click()
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible()
})
