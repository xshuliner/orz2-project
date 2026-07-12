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
  '/tools/json-formatter',
  '/tools/palette-lab',
  '/tools/base64-converter',
  '/tools/markdown-editor',
  '/tools/qrcode-generator',
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

test('navigation intent preloads a route and local RUM stays on-device', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const pageToolsRequest = page.waitForResponse(response =>
    response.url().includes('/src/pages/PageTools/index.tsx')
  );
  await page
    .getByRole('link', { name: zhMessages.pageTitles.onlineTools })
    .hover();
  await pageToolsRequest;

  await page.reload({ waitUntil: 'domcontentloaded' });
  const profile = await page.evaluate(() =>
    window.localStorage.getItem('CACHE_orz2:local-rum')
  );
  expect(profile).not.toBeNull();
  expect(JSON.parse(profile ?? '{}')).toMatchObject({ version: 1 });
});

test('constrained local RUM profile skips navigation prefetches', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'CACHE_orz2:local-rum',
      JSON.stringify({
        deviceTier: 'constrained',
        metrics: { lcp: 4500 },
        updatedAt: Date.now(),
        version: 1,
      })
    );
  });
  const requestedUrls: string[] = [];
  page.on('request', request => requestedUrls.push(request.url()));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('link', { name: zhMessages.pageTitles.onlineTools })
    .hover();
  await page.waitForTimeout(300);

  expect(
    requestedUrls.some(url => url.includes('/src/pages/PageTools/index.tsx'))
  ).toBe(false);
});

test('developer utility tools transform input in the browser', async ({
  page,
}) => {
  await page.goto('/tools/json-formatter', { waitUntil: 'domcontentloaded' });
  await page.getByLabel(zhMessages.utilityTool.input).fill('{"orz2":true}');
  await page
    .getByRole('button', { name: zhMessages.utilityTool.format })
    .click();
  await expect(page.getByLabel(zhMessages.utilityTool.output)).toHaveValue(
    '{\n  "orz2": true\n}'
  );

  await page.goto('/tools/qrcode-generator', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.utility-qr-card svg')).toBeVisible();
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

test('official publisher resumes the validated publish flow after login', async ({
  page,
}) => {
  const publisher = zhMessages.publisher;

  await page.route('**/smart/v1/minicode/postCreateMiniCodeLogin**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        body: { data: { data: [255, 216, 255, 217] }, uuid: 'login-uuid' },
      }),
    })
  );
  await page.route('**/smart/v1/minicode/getQueryMiniCodeLogin**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ body: { timer: 1, token: 'test-token' } }),
    })
  );
  await page.route('**/smart/v1/member/getQueryMemberInfo**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        body: { memberInfo: { _id: 'test-user', user_nickName: 'Test User' } },
      }),
    })
  );

  await page.goto('/tools/official-publisher', {
    waitUntil: 'domcontentloaded',
  });
  await page
    .getByPlaceholder(publisher.sections.account.appIdPlaceholder)
    .fill('test-app-id');
  await page
    .getByPlaceholder(publisher.sections.account.appSecretPlaceholder)
    .fill('test-app-secret');
  await page.getByRole('button', { name: publisher.aside.generate }).click();

  await expect(
    page.getByRole('dialog', { name: publisher.status.confirmTitle })
  ).toBeVisible();
});

test('closing publisher login cancels the pending publish flow', async ({
  page,
}) => {
  const publisher = zhMessages.publisher;

  await page.route('**/smart/v1/minicode/postCreateMiniCodeLogin**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        body: { data: { data: [255, 216, 255, 217] }, uuid: 'login-uuid' },
      }),
    })
  );

  await page.goto('/tools/official-publisher', {
    waitUntil: 'domcontentloaded',
  });
  await page
    .getByPlaceholder(publisher.sections.account.appIdPlaceholder)
    .fill('test-app-id');
  await page
    .getByPlaceholder(publisher.sections.account.appSecretPlaceholder)
    .fill('test-app-secret');
  await page.getByRole('button', { name: publisher.aside.generate }).click();

  await expect(
    page.getByRole('dialog', { name: zhMessages.login.title })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog', { name: publisher.status.confirmTitle })
  ).toHaveCount(0);
});

test('authenticated header profile popover distinguishes hover and click', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'CACHE_orz2:auth-token',
      JSON.stringify('test-token')
    );
    window.localStorage.setItem(
      'CACHE_orz2:auth-user',
      JSON.stringify({
        id: 'test-user',
        name: 'Popover User',
        email: '',
        gender: 0,
        province: '',
        provinceCode: '',
        city: '',
        cityCode: '',
        area: '',
        areaCode: '',
        title: '',
        level: 0,
        experience: 0,
        score: 8,
      })
    );
  });
  await page.route('**/smart/v1/member/getQueryMemberInfo**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        body: {
          memberInfo: {
            _id: 'test-user',
            user_nickName: 'Popover User',
            user_score: 8,
          },
        },
      }),
    })
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const trigger = page.getByRole('button', { name: 'Popover User' });
  const menu = page.locator('.nav-user-menu');
  await expect(trigger).toBeVisible();
  expect(
    await trigger.evaluate(element => element.getBoundingClientRect().height)
  ).toBe(36);

  await trigger.hover();
  await expect(menu).toBeVisible();
  await page.locator('.brand-link').hover();
  await expect(menu).toHaveCount(0);

  await trigger.click();
  await expect(menu).toBeVisible();
  await page.locator('.brand-link').hover();
  await expect(menu).toBeVisible();
  await page.locator('main').click({ position: { x: 10, y: 10 } });
  await expect(menu).toHaveCount(0);
});

test('authenticated mobile header opens and dismisses the profile popover', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'CACHE_orz2:auth-token',
      JSON.stringify('test-token')
    );
    window.localStorage.setItem(
      'CACHE_orz2:auth-user',
      JSON.stringify({
        id: 'mobile-test-user',
        name: 'Mobile Popover User',
        email: '',
        gender: 0,
        province: '',
        provinceCode: '',
        city: '',
        cityCode: '',
        area: '',
        areaCode: '',
        title: '',
        level: 0,
        experience: 0,
        score: 5,
      })
    );
  });
  await page.route('**/smart/v1/member/getQueryMemberInfo**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        body: {
          memberInfo: {
            _id: 'mobile-test-user',
            user_nickName: 'Mobile Popover User',
            user_score: 5,
          },
        },
      }),
    })
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('button', { name: zhMessages.header.openNavAriaLabel })
    .click();

  const mobileMember = page.locator('.mobile-nav-member');
  const trigger = mobileMember.getByRole('button', {
    name: 'Mobile Popover User',
  });
  const menu = page.locator('.nav-user-menu');
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(menu).toBeVisible();
  await page.locator('main').click({ position: { x: 10, y: 120 } });
  await expect(menu).toHaveCount(0);
});

test('catalog scan experience popover remains open after clicking a product card', async ({
  page,
}) => {
  await page.goto('/products', { waitUntil: 'domcontentloaded' });

  const productCard = page.locator('.catalog-card').filter({
    hasText: zhMessages.catalog.products.weather.name,
  });
  const trigger = productCard.getByRole('button', {
    name: zhMessages.common.scanExperience,
  });
  const popover = page.locator('.catalog-entry-panel');

  await trigger.click();
  await expect(popover).toBeVisible();
  await page.locator('main').hover({ position: { x: 10, y: 10 } });
  await expect(popover).toBeVisible();
  await page.locator('main').click({ position: { x: 10, y: 10 } });
  await expect(popover).toHaveCount(0);
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
      page.evaluate(() =>
        JSON.parse(
          localStorage.getItem('CACHE_orz2:theme-preference') ?? 'null'
        )
      )
    )
    .toBe('dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('localized SEO exposes canonical and alternate links', async ({
  page,
}) => {
  await page.goto('/en/tools', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveTitle('ORZ2 - Online Tools');
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

  await page.goto('/team', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle('ORZ2 - 核心团队');

  await page.goto('/products/silicon', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle('ORZ2 - 硅基江湖');
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

test('official publisher confirmation dialog is centered in the viewport', async ({
  page,
}) => {
  const publisher = zhMessages.publisher;

  await page.goto('/tools/official-publisher', {
    waitUntil: 'domcontentloaded',
  });
  await page
    .getByRole('button', { name: publisher.aside.reset })
    .click();

  const dialog = page.getByRole('dialog', {
    name: publisher.status.resetTitle,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeInViewport();
  await dialog
    .getByRole('button', { name: publisher.customization.cancel })
    .click();
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
