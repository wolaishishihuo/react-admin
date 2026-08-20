import { expect, test, type Page } from '@playwright/test';
import { appPath } from './helpers';

async function login(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('User：admin / user').fill('admin');
  await page.getByPlaceholder('Password：123456').fill('123456');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Product Sale Overview')).toBeVisible({ timeout: 20000 });
}

async function openUserList(page: Page) {
  await page.getByRole('menuitem', { name: '列表页面' }).click();
  await page.getByRole('menuitem', { name: '用户列表' }).click();
  await expect(page.getByText('user_01')).toBeVisible({ timeout: 20000 });
}

test('A→B→A 不因 Tab 切换增加列表请求', async ({ page }) => {
  const listUrls: string[] = [];
  await page.route(
    url => url.toString().includes('/api/user/list'),
    async route => {
      listUrls.push(route.request().url());
      await route.continue();
    }
  );

  await login(page);
  await openUserList(page);
  const afterFirst = listUrls.length;
  expect(afterFirst).toBeGreaterThanOrEqual(1);

  await page.locator('.tabs-item', { hasText: '首页' }).click();
  await expect(page.getByText('Product Sale Overview')).toBeVisible({ timeout: 20000 });
  expect(listUrls.length).toBe(afterFirst);

  await page.locator('.tabs-item', { hasText: '用户列表' }).click();
  await expect(page.getByText('user_01')).toBeVisible({ timeout: 20000 });
  expect(listUrls.length).toBe(afterFirst);

  await page.locator('.refresh-btn').click();
  await expect.poll(() => listUrls.length).toBe(afterFirst + 1);
});

test('两个详情是两个 tab，切回后内容不串', async ({ page }) => {
  await login(page);
  await page.goto(appPath('/list/useProTable/detail?id=1'));
  const visiblePane = page.locator('[data-keep-alive-key]:not([aria-hidden="true"])');
  await expect(visiblePane.getByText('user_01')).toBeVisible({ timeout: 15000 });
  await page.goto(appPath('/list/useProTable/detail?id=2'));
  await expect
    .poll(async () => {
      const titles = await page.locator('.tabs-item span').allTextContents();
      return titles.filter(title => title.includes('详情')).length;
    })
    .toBeGreaterThanOrEqual(2);
  await expect(visiblePane.getByText('user_02')).toBeVisible();
  await page.locator('.tabs-item', { hasText: 'user_01' }).click();
  await expect(visiblePane.getByText('user_01')).toBeVisible();
  await expect(visiblePane.getByText('user_02')).toHaveCount(0);
});

test('动态路由不同参数共用一个普通 Tab', async ({ page }) => {
  await login(page);
  await page.goto(appPath('/users/1'));
  await expect(page.getByText('/users/$userId')).toBeVisible({ timeout: 15000 });
  await page.goto(appPath('/users/2'));
  await expect(page.getByText('/users/2')).toBeVisible();
  const titles = await page.locator('.tabs-item span').allTextContents();
  expect(titles.filter(title => title.includes('用户资料')).length).toBe(1);
});

test('深层 URL 刷新仍停留在当前页', async ({ page }) => {
  await login(page);
  await page.goto(appPath('/list/useProTable'));
  await expect(page.getByText('user_01')).toBeVisible({ timeout: 20000 });
  await page.reload();
  await expect(page.getByText('user_01')).toBeVisible({ timeout: 20000 });
});

test('关闭全部非固定 Tab 回到首页', async ({ page }) => {
  await login(page);
  await openUserList(page);
  await page.locator('.tabs-box .chip-btn').click();
  await page.getByRole('menuitem', { name: '关闭所有' }).click();
  await expect(page.getByText('Product Sale Overview')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.tabs-item')).toHaveCount(1);
});
