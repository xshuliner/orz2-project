import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/en',
  '/ja',
  '/tools',
  '/en/tools',
  '/ja/products',
  '/products',
  '/team',
  '/privacy',
  '/tools/official-publisher',
  '/en/tools/official-publisher',
  '/design-system',
];

test.describe('public route smoke tests', () => {
  for (const route of publicRoutes) {
    test(`${route} renders meaningful content`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    });
  }
});

test('login modal opens and closes through the shared modal shell', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: '未登录' }).click();
  await expect(page.getByRole('dialog', { name: '欢迎回来' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '欢迎回来' })).toHaveCount(0);
});

test('language switching preserves the current route and localized navigation', async ({
  page,
}) => {
  await page.goto('/tools', { waitUntil: 'domcontentloaded' });

  await page
    .locator('.header-preferences.desktop-only')
    .getByRole('button', { name: /EN/ })
    .click();

  await expect(page).toHaveURL(/\/en\/tools$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('heading', { exact: true, name: 'Tools' })
  ).toBeVisible();
  await expect
    .poll(() => page.locator('.catalog-card').count())
    .toBeGreaterThan(0);

  await page.getByRole('link', { name: 'Products' }).first().click();
  await expect(page).toHaveURL(/\/en\/products$/);

  await page
    .locator('.header-preferences.desktop-only')
    .getByRole('button', { name: /日/ })
    .click();

  await expect(page).toHaveURL(/\/ja\/products$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(
    page.getByRole('heading', { exact: true, name: 'プロダクト' })
  ).toBeVisible();
  await expect
    .poll(() => page.locator('.catalog-card').count())
    .toBeGreaterThan(0);
});

test('theme follows system dark mode and manual dark choice persists', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const themeButton = page.locator(
    '.header-preferences.desktop-only .theme-cycle-button'
  );
  await themeButton.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await themeButton.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('orz2:theme-preference')))
    .toBe('dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('localized SEO exposes canonical and alternate links', async ({ page }) => {
  await page.goto('/en/tools', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveTitle('Online Tools - ORZ2');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://orz2.com/en/tools'
  );
  await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute(
    'href',
    'https://orz2.com/tools'
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    'https://orz2.com/en/tools'
  );
  await expect(page.locator('link[rel="alternate"][hreflang="ja"]')).toHaveAttribute(
    'href',
    'https://orz2.com/ja/tools'
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]')
  ).toHaveAttribute('href', 'https://orz2.com/tools');
});

test('design system modal supports button, backdrop and escape closing', async ({
  page,
}) => {
  await page.goto('/design-system', { waitUntil: 'domcontentloaded' });

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
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/products/silicon', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.product-silicon-theme')).toBeVisible();
  await expect(page.locator('.silicon-nav')).toBeVisible();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.getByRole('heading', { name: '硅基江湖' })).toBeVisible();
});
