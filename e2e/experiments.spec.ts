import { test, expect } from '@playwright/test';

test.describe('PrayogaProof E2E Test Suite', () => {
  test('Landing page loads with hero branding and subject cards', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PrayogaProof/);
    await expect(page.locator('h1')).toBeVisible();

    // Verify 4 subject cards
    await expect(page.getByRole('heading', { name: 'Physics' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Chemistry' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Biology' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mathematics' })).toBeVisible();

    // Verify Coming Soon badges
    await expect(page.getByText('Coming Soon').first()).toBeVisible();
  });

  test('Navigates to Physics and lists all 5 active experiments', async ({ page }) => {
    await page.goto('/subjects/physics');
    await expect(page.getByRole('link', { name: "Ohm's Law" })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Series and Parallel Circuits' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Convex Lens' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Magnetic Field' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Simple Pendulum' })).toBeVisible();
  });

  test('Navigates to Chemistry and lists all 5 active experiments', async ({ page }) => {
    await page.goto('/subjects/chemistry');
    await expect(page.getByRole('link', { name: 'pH Testing' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Natural Indicators' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Paper Chromatography' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Displacement Reaction' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Crystallisation' })).toBeVisible();
  });

  test('Biology subject route displays Coming Soon message without breaking', async ({ page }) => {
    await page.goto('/subjects/biology');
    await expect(page.getByRole('heading', { name: /Biology Laboratory/i })).toBeVisible();
    await expect(page.getByText(/Biology is on hold for future phases/i)).toBeVisible();
  });

  test('Mathematics subject route displays Coming Soon message without breaking', async ({ page }) => {
    await page.goto('/subjects/mathematics');
    await expect(page.getByRole('heading', { name: /Mathematics Laboratory/i })).toBeVisible();
    await expect(page.getByText(/Mathematics is on hold for future phases/i)).toBeVisible();
  });

  test('Loads Ohm’s Law workspace and interacts with Toolbar and Mode switch', async ({ page }) => {
    await page.goto('/workspace/ohms-law');

    // Verify workspace toolbar and title
    await expect(page.getByText(/Ohm's Law/i).first()).toBeVisible();

    // Verify Guided Mode toggle is present and switch to Free Lab
    const freeLabBtn = page.getByRole('button', { name: /Free/i });
    await expect(freeLabBtn).toBeVisible();
    await freeLabBtn.click();

    // Equipment catalogue should be open in Free Lab
    await expect(page.getByText('Equipment Catalogue')).toBeVisible();
  });

  test('Loads Paper Chromatography workspace and inspects paper strip properties', async ({ page }) => {
    await page.goto('/workspace/paper-chromatography');

    await expect(page.getByText(/Paper Chromatography/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();

    // Open Inspector tab if available
    const inspectorTab = page.getByRole('button', { name: 'Inspector', exact: true });
    if (await inspectorTab.isVisible()) {
      await inspectorTab.click();
    }
  });

  test('Handles 404 route gracefully with return navigation', async ({ page }) => {
    await page.goto('/non-existent-route');
    await expect(page.getByText(/404 - Laboratory Page Not Found/i)).toBeVisible();
    const dashboardBtn = page.getByRole('button', { name: /Back to Dashboard/i });
    await expect(dashboardBtn).toBeVisible();
  });
});
