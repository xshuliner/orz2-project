import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/tools',
  '/products',
  '/team',
  '/privacy',
  '/tools/official-publisher',
  '/design-system',
];

test.describe('public route smoke tests', () => {
  for (const route of publicRoutes) {
    test(`${route} renders meaningful content`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    });
  }
});

test('login modal opens and closes through the shared modal shell', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('button', { name: '未登录' }).click();
  await expect(page.getByRole('dialog', { name: '欢迎回来' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '欢迎回来' })).toHaveCount(0);
});

test('design system modal supports button, backdrop and escape closing', async ({
  page,
}) => {
  await page.goto('/design-system');

  const dialog = page.getByRole('dialog', { name: '统一的弹窗容器' });
  const openModal = page.getByRole('button', { name: '查看弹窗实例' });

  await openModal.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await openModal.click();
  await expect(dialog).toBeVisible();
  await page.locator('.o-modal-overlay').click({ position: { x: 4, y: 4 } });
  await expect(dialog).toHaveCount(0);
});

test('silicon product keeps its independent theme', async ({ page }) => {
  await page.goto('/products/silicon');

  await expect(page.locator('.product-silicon-theme')).toBeVisible();
  await expect(page.locator('.silicon-nav')).toBeVisible();
  await expect(page.locator('.site-header')).toBeHidden();
});
