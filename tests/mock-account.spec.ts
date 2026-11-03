import { expect, test } from '@playwright/test';
import { messages as enMessages } from '../src/i18n/locales/en';
import { messages as jaMessages } from '../src/i18n/locales/ja';
import { messages as zhMessages } from '../src/i18n/locales/zh-CN';
import { mockAccountFields } from '../src/pages/Tools/ToolMockAccountGenerator/config';
import { generateMockAccount } from '../src/pages/Tools/ToolMockAccountGenerator/utils/mockAccount';

const localeCases = [
  { path: '', messages: zhMessages },
  { path: '/en', messages: enMessages },
  { path: '/ja', messages: jaMessages },
];

test('generated mock details satisfy constraints across repeated generations', () => {
  for (const { messages } of localeCases) {
    const samples = messages.utilityTool.mockAccountGenerator.samples;
    expect(samples.names.length).toBeGreaterThanOrEqual(60);
    expect(new Set(samples.names).size).toBe(samples.names.length);
    for (const name of samples.names) {
      expect(name).toMatch(/^[A-Za-z\u4e00-\u9fff]{1,50}$/u);
    }
    const accounts = new Set<string>();
    for (let index = 0; index < 500; index += 1) {
      const info = generateMockAccount(samples);
      expect(info.account).toMatch(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,32}$/);
      expect(info.name).toMatch(/^[A-Za-z\u4e00-\u9fff]{1,50}$/u);
      expect(samples.names).toContain(info.name);
      expect(info.mobile).toMatch(/^000\d{8}$/);
      expect(info.officePhone).toMatch(/^0000-\d{8}$/);
      expect(info.fax).toMatch(/^0000-\d{8}$/);
      expect(info.email).toBe(`${info.account.toLowerCase()}@example.com`);
      expect(samples.remarks).toContain(info.remarks);
      accounts.add(info.account);
    }
    expect(accounts.size).toBeGreaterThan(490);
  }
});

for (const { path, messages } of localeCases) {
  test(`mock tool renders localized details and SEO at ${path || '/'}`, async ({
    page,
  }) => {
    const copy = messages.utilityTool.mockAccountGenerator;
    const catalog = messages.catalog.tools['tool-mock-account'];
    await page.goto(`${path}/tools/mock-account-generator`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      catalog.name
    );
    for (const field of mockAccountFields) {
      await expect(
        page.getByRole('textbox', { name: copy.fields[field], exact: true })
      ).not.toHaveValue('');
    }
    const nameInput = page.getByRole('textbox', {
      name: copy.fields.name,
      exact: true,
    });
    await expect(nameInput).toHaveValue(/^[A-Za-z\u4e00-\u9fff]{1,50}$/u);
    await expect(nameInput).toHaveAccessibleDescription(copy.nameHint);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://orz2.online${path}/tools/mock-account-generator`
    );
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(
      4
    );
    await expect
      .poll(() =>
        page.locator('script[type="application/ld+json"]').textContent()
      )
      .toContain(catalog.name);
    await page.goto(`${path}/tools?q=${encodeURIComponent(catalog.name)}`);
    await expect(
      page.getByRole('heading', { name: catalog.name, exact: true })
    ).toBeVisible();
  });
}

test('mock details generate locally and copy each field or the whole set', async ({
  page,
  context,
}) => {
  const copy = zhMessages.utilityTool.mockAccountGenerator;
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/tools/mock-account-generator');
  const accountInput = page.getByRole('textbox', {
    name: copy.fields.account,
    exact: true,
  });
  const previousAccount = await accountInput.inputValue();
  const apiRequests: string[] = [];
  page.on('request', request => {
    if (['fetch', 'xhr'].includes(request.resourceType()))
      apiRequests.push(request.url());
  });
  await page.getByRole('button', { name: copy.generate }).click();
  await expect(accountInput).not.toHaveValue(previousAccount);
  const allValues: string[] = [];
  for (const field of mockAccountFields) {
    const label = copy.fields[field];
    const value = await page
      .getByRole('textbox', { name: label, exact: true })
      .inputValue();
    allValues.push(`${label}: ${value}`);
    await page
      .getByRole('button', {
        name: copy.copyField.replace('{field}', label),
        exact: true,
      })
      .click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(value);
    await expect(page.getByRole('status')).toHaveText(
      copy.copied.replace('{field}', label)
    );
  }
  await page.getByRole('button', { name: copy.copyAll }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(allValues.join('\n'));
  await expect(page.getByRole('status')).toHaveText(
    copy.copied.replace('{field}', copy.allFields)
  );
  await page.getByRole('button', { name: copy.generate }).click();
  await expect(page.getByRole('status')).toBeEmpty();
  expect(apiRequests).toEqual([]);
});

test('copy failure preserves selectable details and reports a useful message', async ({
  page,
}) => {
  const copy = zhMessages.utilityTool.mockAccountGenerator;
  await page.goto('/tools/mock-account-generator');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Denied')) },
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: () => false,
    });
  });
  const button = page.getByRole('button', {
    name: copy.copyField.replace('{field}', copy.fields.account),
    exact: true,
  });
  await button.click();
  await expect(page.getByRole('status')).toHaveText(copy.copyFailed);
  await expect(button).toBeFocused();
  await expect(
    page.getByRole('textbox', { name: copy.fields.account, exact: true })
  ).not.toHaveValue('');
  await expect(page.locator('textarea[aria-hidden="true"]')).toHaveCount(0);
});

test('mock tool fits mobile and desktop layouts in both themes', async ({
  page,
}) => {
  await page.goto('/tools/mock-account-generator');
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => {
        document.documentElement.dataset.theme = value;
      }, theme);
      await expect(
        page.getByRole('button', {
          name: zhMessages.utilityTool.mockAccountGenerator.generate,
        })
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true);
    }
  }
});
