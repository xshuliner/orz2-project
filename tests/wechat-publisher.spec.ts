import { expect, test } from "@playwright/test";

test("wechat publisher form persists, imports, exports, generates, and resets", async ({ page }) => {
  await page.goto("/tools/wechat-auto-publisher");
  await expect(page).toHaveTitle(/公众号自动发布工具/);
  await expect(page.getByRole("img", { name: "微信公众平台配置 AppId、AppSecret 和 API IP 白名单示意图" })).toBeVisible();
  await expect(page.getByRole("link", { name: "打开微信公众平台" })).toHaveAttribute("href", "https://developers.weixin.qq.com/console/index");
  await expect(page.getByText("43.167.247.143")).toBeVisible();
  await expect(page.locator(".summary-score")).toContainText("2/4");

  await page.getByPlaceholder("请输入公众号 appId").fill("wx-test-app-id");
  await page.getByPlaceholder("请输入公众号 appSecret").fill("wx-test-secret");
  await page.getByPlaceholder("描述希望生成的封面图").fill("一张明亮科技风公众号封面图");
  await expect(page.locator(".summary-score")).toContainText("4/4");

  await page.getByRole("button", { name: "增加图片" }).click();
  await expect(page.locator(".summary-score")).toContainText("3/4");

  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem("orz2:wechat-auto-publisher-form") || "{}"));
  expect(saved.appId).toBe("wx-test-app-id");
  expect(saved.imagesInlineList).toHaveLength(1);

  await page.reload();
  await expect(page.getByPlaceholder("请输入公众号 appId")).toHaveValue("wx-test-app-id");
  await expect(page.locator(".inline-image-item")).toHaveCount(1);

  const importPayload = {
    appId: "wx-imported-app",
    appSecret: "imported-secret",
    articleType: "newspic",
    promptReferences: ["festivals", "solarTerms"],
    imageCoverType: "url",
    imageCoverValue: "https://example.com/cover.png",
    imagesInlineList: [{ type: "ai", value: "内嵌图描述" }],
    comment: "fansOnly",
  };
  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: "wechat-config.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(importPayload)),
  });

  saved = await page.evaluate(() => JSON.parse(localStorage.getItem("orz2:wechat-auto-publisher-form") || "{}"));
  expect(saved.appId).toBe("wx-imported-app");
  expect(saved.promptReferences).toEqual(["festivals", "solarTerms"]);
  await expect(page.locator(".summary-score")).toContainText("4/4");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON" }).click();
  await expect((await downloadPromise).suggestedFilename()).toBe("orz2-wechat-publisher-config.json");

  page.on("dialog", async (dialog) => dialog.accept());
  await page.getByRole("button", { name: "生成", exact: true }).click();
  await expect(page.locator(".generation-status")).toContainText("已完成任务配置校验", { timeout: 7000 });

  await page.getByRole("button", { name: "重置" }).click();
  await expect(page.getByPlaceholder("请输入公众号 appId")).toHaveValue("");
});
