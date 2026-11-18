import { test, expect } from '@playwright/test';

test('Ohm demonstration uses a real canvas and supports seeking, playback and clean practice', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    if (!e.message.includes('installations/app-offline')) {
      errors.push(e.message);
    }
  });
  await page.goto('/experiments/ohms-law');
  await page.getByRole('button', { name: 'Load Simulation', exact: true }).first().click();
  const demo = page.getByRole('region', { name: 'Live experiment demonstration' });
  await expect(demo).toBeVisible();
  await expect(demo.locator('canvas').first()).toBeVisible();
  await demo.getByLabel('Demonstration step').selectOption('6');
  await expect(demo.getByTestId('demo-calculation')).toHaveText('R = V / I = 12.00 V / 2.00 A = 6.00 Ω');
  await demo.getByLabel('Demonstration step').selectOption('0');
  await demo.getByLabel('Narration', { exact: true }).uncheck();
  await demo.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(demo.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();
  await page.waitForTimeout(350);
  await demo.getByRole('button', { name: 'Pause', exact: true }).click();
  const progress = await demo.getByRole('progressbar').getAttribute('value');
  await page.waitForTimeout(200);
  await expect(demo.getByRole('progressbar')).toHaveAttribute('value', progress!);
  await demo.getByRole('button', { name: 'Resume', exact: true }).click();
  await demo.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(demo.getByRole('progressbar')).toHaveAttribute('value', '0');
  await demo.getByLabel('Demonstration step').selectOption('6');
  const canvas = demo.getByTestId('demo-canvas');
  const box = await canvas.boundingBox();
  expect(box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({ path: `test-results/demo-${test.info().project.name.replaceAll(' ', '-')}.png`, fullPage: true });
  await demo.getByRole('button', { name: 'Try It Yourself', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Fresh practice workspace' })).toBeVisible();
  await expect(page.getByText('Your original manual workspace and saved progress are preserved.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Back to demonstration' }).click();
  await expect(demo).toBeVisible();
  await demo.getByRole('button', { name: 'Return to your experiment' }).click();
  await expect(demo).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('unimplemented demonstrations are labelled honestly', async ({ page }) => {
  await page.goto('/experiments/vernier-callipers');
  await page.getByRole('button', { name: 'Load Simulation', exact: true }).first().click();
  await expect(page.getByText('Live laboratory demonstration: NOT STARTED', { exact: false })).toBeVisible();
});
