import { expect, test } from '@playwright/test';

test('reveal motion initializes without waiting for browser idle time', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'requestIdleCallback', {
      configurable: true,
      value: () => 1,
    });
  });

  await page.goto('/tools');

  await expect(page.locator('html')).toHaveClass(/motion-enabled/);
  await expect(page.locator('.catalog-card').first()).toBeVisible();

  const dynamicTargetInitialOpacity = await page.evaluate(() => {
    const target = document.createElement('div');
    target.className = 'reveal-on-scroll';
    target.textContent = 'Dynamic reveal target';
    document.querySelector('main')?.append(target);
    return window.getComputedStyle(target).opacity;
  });
  expect(dynamicTargetInitialOpacity).toBe('0');
});

test('reduced motion keeps reveal content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/tools');

  await expect(page.locator('html')).not.toHaveClass(/motion-enabled/);
  await expect(page.locator('.catalog-card').first()).toBeVisible();
});
