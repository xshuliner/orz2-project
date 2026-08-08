import { expect, test } from '@playwright/test';

function templateResponse(promptSystem: string) {
  return JSON.stringify({
    code: 200,
    body: {
      schemaVersion: 1,
      defaultTemplateId: 'server-template',
      templates: [
        {
          id: 'server-template',
          label: '服务端模板',
          caption: '由接口动态维护',
          payload: {
            promptSystem,
            promptContent: '服务端文章提示词',
            imageCover: { type: 'ai', value: '服务端封面提示词' },
            imagesInlineList: [
              { type: 'ai', value: '正文图一' },
              { type: 'ai', value: '正文图二' },
              { type: 'ai', value: '正文图三' },
              { type: 'ai', value: '正文图四' },
              { type: 'ai', value: '正文图五' },
            ],
          },
        },
      ],
    },
  });
}

test('article templates load dynamically and edited content becomes a persisted custom template', async ({
  page,
}) => {
  let promptSystem = '服务端系统提示词 v1';
  await page.route('**/article/getQueryArticleTemplates', route =>
    route.fulfill({
      contentType: 'application/json',
      body: templateResponse(promptSystem),
    })
  );

  await page.goto('/tools/article-publisher');

  const templateSelector = page.getByLabel('选择文章内容模板');
  await expect(templateSelector).toContainText('服务端模板');
  await expect(page.getByLabel('文章主题')).toHaveCount(0);

  await page.getByRole('switch', { name: '自定义这份模板' }).click();
  const systemPrompt = page.getByLabel('系统提示词');
  await expect(systemPrompt).toHaveValue('服务端系统提示词 v1');
  await expect(page.locator('.inline-image-item')).toHaveCount(3);

  await page.getByRole('button', { name: '增加图片' }).click();
  await expect(page.locator('.inline-image-item')).toHaveCount(4);
  await expect(
    page.locator('.inline-image-item').last().locator('input')
  ).toHaveValue(/正文图[一二三四五]/);
  await page.getByRole('button', { name: '删除内嵌图片 4' }).click();
  await expect(page.locator('.inline-image-item')).toHaveCount(3);

  await systemPrompt.fill('用户自己的系统提示词');

  await expect(templateSelector).toContainText('自定义模板');
  await expect(
    templateSelector.locator('.template-choice').first()
  ).toContainText('自定义模板');
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = localStorage.getItem('CACHE_orz2:article-publisher-form');
        if (!raw) return null;
        const form = JSON.parse(raw);
        return {
          templateId: form.modeSettings.create.templateId,
          sourceTemplateId:
            form.modeSettings.create.customTemplate.sourceTemplateId,
          promptSystem:
            form.modeSettings.create.customTemplate.payload.promptSystem,
        };
      })
    )
    .toEqual({
      templateId: '__local_custom__',
      sourceTemplateId: 'server-template',
      promptSystem: '用户自己的系统提示词',
    });

  promptSystem = '服务端系统提示词 v2';
  await page.reload();

  await expect(templateSelector).toContainText('自定义模板');
  await expect(systemPrompt).toHaveValue('用户自己的系统提示词');

  await page.getByRole('radio', { name: /服务端模板/ }).click();
  await expect(systemPrompt).toHaveValue('服务端系统提示词 v2');
  await expect(page.getByText('替换当前自定义配置？')).toHaveCount(0);
  await expect(
    templateSelector.locator('.template-choice').first()
  ).toContainText('自定义模板');
});

test('selected article template scrolls into the center of the template rail', async ({
  page,
}) => {
  const templates = Array.from({ length: 8 }, (_, index) => ({
    id: `template-${index + 1}`,
    label: `模板 ${index + 1}`,
    caption: `模板说明 ${index + 1}`,
    payload: {
      promptSystem: `系统提示词 ${index + 1}`,
      promptContent: `文章提示词 ${index + 1}`,
      imageCover: { type: 'ai', value: `封面提示词 ${index + 1}` },
      imagesInlineList: [
        { type: 'ai', value: `正文图 ${index + 1}-1` },
        { type: 'ai', value: `正文图 ${index + 1}-2` },
        { type: 'ai', value: `正文图 ${index + 1}-3` },
      ],
    },
  }));
  await page.route('**/article/getQueryArticleTemplates', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        body: {
          schemaVersion: 1,
          defaultTemplateId: 'template-1',
          templates,
        },
      }),
    })
  );

  await page.setViewportSize({ width: 900, height: 600 });
  await page.goto('/tools/article-publisher');
  await expect(page.getByLabel('选择文章内容模板')).toBeVisible();
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await page.getByRole('radio', { name: /模板 6/ }).click();

  await expect
    .poll(() =>
      page.locator('.template-card-scroll').evaluate(element => {
        const selected = element.querySelector('.template-choice.is-selected');
        if (!(selected instanceof HTMLElement)) return Number.POSITIVE_INFINITY;
        const railRect = element.getBoundingClientRect();
        const selectedRect = selected.getBoundingClientRect();
        return Math.abs(
          selectedRect.left +
            selectedRect.width / 2 -
            (railRect.left + railRect.width / 2)
        );
      })
    )
    .toBeLessThan(2);
  const position = await page
    .locator('.template-card-scroll')
    .evaluate(element => {
      const selected = element.querySelector('.template-choice.is-selected');
      if (!(selected instanceof HTMLElement)) return null;
      const railRect = element.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();
      return {
        scrollLeft: element.scrollLeft,
        centerOffset: Math.abs(
          selectedRect.left +
            selectedRect.width / 2 -
            (railRect.left + railRect.width / 2)
        ),
      };
    });
  expect(position).not.toBeNull();
  expect(position!.scrollLeft).toBeGreaterThan(0);
  expect(position!.centerOffset).toBeLessThan(2);
});

test('article publisher progressively reveals optional delivery settings', async ({
  page,
}) => {
  await page.route('**/article/getQueryArticleTemplates', route =>
    route.fulfill({
      contentType: 'application/json',
      body: templateResponse('delivery prompt'),
    })
  );

  await page.goto('/tools/article-publisher');

  const mainSectionTitles = page.locator(
    '.publisher-main > .publisher-module-card h2'
  );
  await expect(mainSectionTitles).toHaveText([
    '操作模式',
    '内容模板',
    '传达途径',
  ]);

  const wechatSwitch = page.getByRole('switch', {
    name: /写入公众号草稿箱/,
  });
  await expect(page.getByLabel('公众号 appId')).toHaveCount(0);
  await wechatSwitch.click();
  await expect(page.getByLabel('公众号 appId')).toBeVisible();
  await expect(wechatSwitch).toBeChecked();
  await wechatSwitch.click();
  await expect(page.getByLabel('公众号 appId')).toHaveCount(0);
});

test('article publisher keeps the action aside separate and stacks cleanly on mobile', async ({
  page,
}) => {
  await page.route('**/article/getQueryArticleTemplates', route =>
    route.fulfill({
      contentType: 'application/json',
      body: templateResponse('responsive prompt'),
    })
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/tools/article-publisher');

  const desktopLayout = await page.evaluate(() => {
    const main = document.querySelector('.publisher-main');
    const aside = document.querySelector('.publisher-aside');
    const cards = Array.from(
      document.querySelectorAll('.publisher-main > .publisher-module-card')
    );
    if (!main || !aside) return null;
    const mainRect = main.getBoundingClientRect();
    const asideRect = aside.getBoundingClientRect();
    return {
      mainRight: mainRect.right,
      asideLeft: asideRect.left,
      cardRights: cards.map(card => card.getBoundingClientRect().right),
    };
  });
  expect(desktopLayout).not.toBeNull();
  expect(desktopLayout!.asideLeft).toBeGreaterThan(desktopLayout!.mainRight);
  expect(
    desktopLayout!.cardRights.every(
      right => right <= desktopLayout!.mainRight + 1
    )
  ).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });

  const mobileLayout = await page.evaluate(() => {
    const main = document.querySelector('.publisher-main');
    const aside = document.querySelector('.publisher-aside');
    if (!main || !aside) return null;
    const mainRect = main.getBoundingClientRect();
    const asideRect = aside.getBoundingClientRect();
    return {
      mainBottom: mainRect.bottom,
      asideTop: asideRect.top,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(mobileLayout).not.toBeNull();
  expect(mobileLayout!.asideTop).toBeGreaterThanOrEqual(
    mobileLayout!.mainBottom
  );
  expect(mobileLayout!.documentWidth).toBeLessThanOrEqual(
    mobileLayout!.viewportWidth
  );
});

test('article templates fall back to the last successful cache', async ({
  page,
}) => {
  let shouldFail = false;
  await page.route('**/article/getQueryArticleTemplates', route =>
    shouldFail
      ? route.fulfill({ status: 503, body: 'unavailable' })
      : route.fulfill({
          contentType: 'application/json',
          body: templateResponse('cached prompt'),
        })
  );

  await page.goto('/tools/article-publisher');
  await expect(page.getByLabel('选择文章内容模板')).toContainText('服务端模板');

  shouldFail = true;
  await page.reload();

  await expect(page.getByText('当前使用本机最近一次成功缓存')).toBeVisible();
  await expect(page.getByLabel('选择文章内容模板')).toContainText('服务端模板');
});
