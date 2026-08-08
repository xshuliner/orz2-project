import { expect, test } from '@playwright/test';

const articleId = '00000000-0000-4000-8000-000000000000';
const articleListCases = [
  {
    path: '/articles',
    title: '文章订阅',
    loginTitle: '登录后查看文章',
  },
  {
    path: '/en/articles',
    title: 'Article subscriptions',
    loginTitle: 'Sign in to view your articles',
  },
  {
    path: '/ja/articles',
    title: '記事購読',
    loginTitle: '記事を見るにはログインしてください',
  },
] as const;

for (const articleCase of articleListCases) {
  test(`article list requires login at ${articleCase.path}`, async ({
    page,
  }) => {
    await page.goto(articleCase.path);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      articleCase.title
    );
    await expect(
      page.getByRole('heading', { level: 2, name: articleCase.loginTitle })
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
      'content',
      'noindex, follow'
    );
  });
}

test('article detail is public and sanitizes stored HTML', async ({ page }) => {
  await page.route('**/article/getQueryArticleInfo**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        body: [
          {
            _id: articleId,
            title: 'Shared article',
            summary: 'A publicly shareable article.',
            content:
              '<h1>Shared article</h1><h2>Shared section</h2><script>window.__unsafe = true</script><p>Public body</p>',
            imgCover: 'https://assets.example/article-cover.jpg',
            imgList: ['https://assets.example/article-inline.jpg'],
            imgCoverV: 'https://assets.example/article-cover-v.jpg',
            sys_createTime: '2026-08-08T00:00:00.000Z',
          },
        ],
      }),
    })
  );

  await page.goto(`/articles/${articleId}`);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('文章详情');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Shared article' })
  ).toBeVisible();
  await expect(page.locator('.layout-page__back-link svg')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 2, name: 'Shared section' })
  ).toBeVisible();
  await expect(page.getByText('Public body')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Shared article' })
  ).toHaveCount(1);
  await expect(page.locator('.article-detail-content script')).toHaveCount(0);
  await expect(page.locator('.article-image-section')).toHaveCount(0);
  await page.getByRole('button', { name: '复制内容' }).click();
  await expect(
    page.getByRole('heading', { name: '选择复制内容' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /复制文章标题/ })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /复制文章正文/ })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /复制摘要/ })).toBeVisible();
  await page.getByRole('button', { name: '关闭操作面板' }).click();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Denied')) },
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: () => true,
    });
  });
  await page.getByRole('button', { name: '复制内容' }).click();
  await page.getByRole('button', { name: /复制文章正文/ }).click();
  await expect(page.getByRole('status')).toHaveText('已复制到剪贴板');
  await page.getByRole('button', { name: '下载图片' }).click();
  await expect(
    page.getByRole('button', { name: /下载全部纵版图/ })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /下载全部横版图/ })
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    'content',
    'index, follow'
  );
});

test('missing public article detail is not indexed', async ({ page }) => {
  await page.route('**/article/getQueryArticleInfo**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, body: [] }),
    })
  );

  await page.goto(`/articles/${articleId}`);

  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    'content',
    'noindex, follow'
  );
});
