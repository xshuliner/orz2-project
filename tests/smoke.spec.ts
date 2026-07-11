import { expect, test } from '@playwright/test';

import { messages as enMessages } from '../src/i18n/locales/en';
import { messages as zhMessages } from '../src/i18n/locales/zh-CN';

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
  '/tools/timezone-converter',
  '/tools/work-report-polisher',
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

  await page.getByRole('button', { name: zhMessages.header.loggedOut }).click();
  await expect(
    page.getByRole('dialog', { name: zhMessages.login.title })
  ).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog', { name: zhMessages.login.title })
  ).toHaveCount(0);
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
    .getByRole('button', { name: enMessages.locale.shortNames.ja })
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
    .poll(() =>
      page.evaluate(() => localStorage.getItem('orz2:theme-preference'))
    )
    .toBe('dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('localized SEO exposes canonical and alternate links', async ({
  page,
}) => {
  await page.goto('/en/tools', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveTitle('Online Tools - ORZ2');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://orz2.online/en/tools'
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="zh-CN"]')
  ).toHaveAttribute('href', 'https://orz2.online/tools');
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]')
  ).toHaveAttribute('href', 'https://orz2.online/en/tools');
  await expect(
    page.locator('link[rel="alternate"][hreflang="ja"]')
  ).toHaveAttribute('href', 'https://orz2.online/ja/tools');
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]')
  ).toHaveAttribute('href', 'https://orz2.online/tools');
});

test('timezone converter respects US daylight saving changes', async ({
  page,
}) => {
  await page.goto('/tools/timezone-converter', {
    waitUntil: 'domcontentloaded',
  });

  const inputs = page.locator('input[type="datetime-local"]');
  const selects = page.locator('select');

  await inputs.first().fill('2026-07-03T20:00');
  await expect(inputs.nth(1)).toHaveValue('2026-07-03T05:00');
  await expect(page.getByText(zhMessages.timezoneTool.dstActive)).toBeVisible();

  await selects.first().selectOption('japan');
  await expect(inputs.first()).toHaveValue('2026-07-03T21:00');
  await expect(inputs.nth(1)).toHaveValue('2026-07-03T05:00');

  await selects.nth(1).selectOption('unitedKingdom');
  await expect(inputs.first()).toHaveValue('2026-07-03T21:00');
  await expect(inputs.nth(1)).toHaveValue('2026-07-03T13:00');

  await inputs.nth(1).fill('2026-07-03T10:00');
  await expect(inputs.first()).toHaveValue('2026-07-03T18:00');

  await selects.first().selectOption('china');
  await selects.nth(1).selectOption('us-pacific');
  await inputs.first().fill('2026-01-03T20:00');
  await expect(inputs.nth(1)).toHaveValue('2026-01-03T04:00');
  await expect(
    page.getByText(zhMessages.timezoneTool.dstInactive)
  ).toBeVisible();
});

test('work report polisher persists report and reference content', async ({
  page,
}) => {
  const reportContent =
    'Completed report-polisher page updates and added sample input area.';
  const referenceContent =
    'This week mainly covered page updates and basic validation. Next week will continue feedback-based refinements.';

  await page.goto('/tools/work-report-polisher', {
    waitUntil: 'domcontentloaded',
  });

  page.once('dialog', dialog => dialog.accept());
  await page
    .getByRole('button', {
      exact: true,
      name: zhMessages.reportPolishTool.weekly,
    })
    .click();
  await page
    .getByLabel(zhMessages.reportPolishTool.inputTitle)
    .fill(reportContent);
  await page
    .getByLabel(zhMessages.reportPolishTool.referenceTitle)
    .fill(referenceContent);

  await page.reload({ waitUntil: 'domcontentloaded' });

  await expect(
    page.getByRole('button', {
      exact: true,
      name: zhMessages.reportPolishTool.weekly,
    })
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByLabel(zhMessages.reportPolishTool.inputTitle)
  ).toHaveValue(reportContent);
  await expect(
    page.getByLabel(zhMessages.reportPolishTool.referenceTitle)
  ).toHaveValue(referenceContent);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem('CACHE_orz2:work-report-polisher-form')
      )
    )
    .toContain('referenceContent');
});

test('official publisher progressively reveals template customization per workflow', async ({
  page,
}) => {
  const publisher = zhMessages.publisher;
  const publishModeName = (mode: 'create' | 'rewrite') =>
    `${publisher.modes[mode].label} ${publisher.modes[mode].description}`;
  const insuranceTemplate = publisher.promptTemplates.insurance_advisor;

  await page.goto('/tools/official-publisher', {
    waitUntil: 'domcontentloaded',
  });

  await expect(
    page.getByRole('button', {
      name: publisher.customization.show,
    })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: publisher.simpleMode.title })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: publisher.sections.prompt.title })
  ).toHaveCount(0);

  await page
    .getByRole('button', { name: publisher.simpleMode.selectorAriaLabel })
    .click();
  await page
    .getByRole('option', {
      name: `${insuranceTemplate.label} ${insuranceTemplate.caption}`,
    })
    .click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.template-summary strong')).toBeVisible();
  await expect(page.locator('.template-summary strong')).toHaveText(
    insuranceTemplate.label
  );

  await page
    .getByRole('button', { name: publisher.customization.show })
    .click();
  await expect(
    page.getByRole('heading', { name: publisher.sections.prompt.title })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: publisher.sections.images.title })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: publisher.sections.meta.title })
  ).toBeVisible();
  await expect(
    page.getByLabel(publisher.sections.prompt.systemLabel)
  ).toHaveValue(insuranceTemplate.fields.promptSystem);
  await expect(page.locator('.inline-image-item')).toHaveCount(3);

  await page
    .getByRole('button', { name: publisher.customization.hide })
    .click();
  await expect(
    page.getByRole('heading', { name: publisher.sections.prompt.title })
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: publisher.customization.show })
    .click();
  await expect(
    page.getByLabel(publisher.sections.prompt.systemLabel)
  ).toHaveValue(insuranceTemplate.fields.promptSystem);

  await page.getByRole('radio', { name: publishModeName('rewrite') }).click();
  await expect(
    page.getByRole('button', {
      name: publisher.customization.show,
    })
  ).toBeVisible();
  await expect(
    page.getByLabel(publisher.sections.rewrite.sourceUrl)
  ).toBeVisible();
  await expect(
    page.getByLabel(publisher.sections.rewrite.requirement)
  ).toHaveCount(0);

  await page
    .getByRole('button', { name: publisher.customization.show })
    .click();
  await expect(
    page.getByLabel(publisher.sections.rewrite.requirement)
  ).toBeVisible();

  await page.getByRole('radio', { name: publishModeName('create') }).click();
  await expect(
    page.getByRole('button', {
      name: publisher.customization.hide,
    })
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem('CACHE_orz2:official-publisher-form')
      )
    )
    .toContain('insurance_advisor');
});

test('official publisher confirms before replacing edited template settings', async ({
  page,
}) => {
  const publisher = zhMessages.publisher;
  const insuranceTemplate = publisher.promptTemplates.insurance_advisor;
  const techTemplate = publisher.promptTemplates.tech;

  await page.goto('/tools/official-publisher', {
    waitUntil: 'domcontentloaded',
  });
  await page
    .getByRole('button', { name: publisher.simpleMode.selectorAriaLabel })
    .click();
  await page
    .getByRole('option', {
      name: `${insuranceTemplate.label} ${insuranceTemplate.caption}`,
    })
    .click();
  await page
    .getByRole('button', { name: publisher.customization.show })
    .click();
  await page
    .getByLabel(publisher.sections.prompt.systemLabel)
    .fill('保留这段自定义提示词');

  await page
    .getByRole('button', { name: publisher.simpleMode.selectorAriaLabel })
    .click();
  await page
    .getByRole('option', {
      name: `${techTemplate.label} ${techTemplate.caption}`,
    })
    .click();

  const dialog = page.getByRole('dialog', {
    name: publisher.customization.replaceAriaLabel,
  });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole('button', { name: publisher.customization.cancel })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.template-summary strong')).toHaveText(
    insuranceTemplate.label
  );

  await page
    .getByRole('button', { name: publisher.simpleMode.selectorAriaLabel })
    .click();
  await page
    .getByRole('option', {
      name: `${techTemplate.label} ${techTemplate.caption}`,
    })
    .click();
  await dialog
    .getByRole('button', { name: publisher.customization.replace })
    .click();
  await expect(page.locator('.template-summary strong')).toHaveText(
    techTemplate.label
  );
  await expect(
    page.getByLabel(publisher.sections.prompt.systemLabel)
  ).toHaveValue(techTemplate.fields.promptSystem);
});

test('design system modal supports button, backdrop and escape closing', async ({
  page,
}) => {
  await page.goto('/design-system', { waitUntil: 'domcontentloaded' });

  const dialog = page.getByRole('dialog', {
    name: zhMessages.designSystem.labels.modalTitle,
  });
  const openModal = page.getByRole('button', {
    name: zhMessages.designSystem.labels.openModal,
  });

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
  await expect(
    page.getByRole('heading', { name: zhMessages.silicon.title })
  ).toBeVisible();
});
