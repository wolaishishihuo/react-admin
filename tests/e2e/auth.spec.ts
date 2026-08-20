import { expect, test, type Page } from '@playwright/test';
import { appPath } from './helpers';

async function login(page: Page, username = 'admin') {
  await page.goto('/');
  await page.getByPlaceholder('User：admin / user').fill(username);
  await page.getByPlaceholder('Password：123456').fill('123456');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Product Sale Overview')).toBeVisible({ timeout: 20000 });
}

test('未登录直达首页不带 redirect', async ({ page }) => {
  await page.goto(appPath('/home'));
  await expect(page.getByPlaceholder('User：admin / user')).toBeVisible();
  expect(page.url()).not.toContain('redirect=');
});

test('未登录直达详情会带安全 redirect，登录后回到详情', async ({ page }) => {
  await page.goto(appPath('/list/useProTable/detail?id=1'));
  await expect(page.getByPlaceholder('User：admin / user')).toBeVisible();
  expect(page.url()).toContain('redirect=');
  await page.getByPlaceholder('User：admin / user').fill('admin');
  await page.getByPlaceholder('Password：123456').fill('123456');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('用户 ID')).toBeVisible({ timeout: 20000 });
  expect(page.url()).toContain('id=1');
});

test('恶意 redirect 登录后回到首页', async ({ page }) => {
  await page.goto(appPath('/login?redirect=https://evil.example'));
  await page.getByPlaceholder('User：admin / user').fill('admin');
  await page.getByPlaceholder('Password：123456').fill('123456');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Product Sale Overview')).toBeVisible({ timeout: 20000 });
  expect(page.url()).not.toContain('evil.example');
});

test('业务 401 会刷新 token 并重发原请求', async ({ page }) => {
  let userInfoRequests = 0;
  let refreshRequests = 0;
  await page.route('**/api/user/info', async route => {
    userInfoRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        userInfoRequests === 1
          ? { code: 401, msg: '令牌已过期', data: null }
          : { code: 200, msg: '成功', data: { id: '1', name: 'admin' } }
      )
    });
  });
  await page.route('**/api/refreshToken', async route => {
    refreshRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        msg: '成功',
        data: { token: 'mock-token-admin-refreshed', refreshToken: 'mock-refresh-admin-refreshed' }
      })
    });
  });

  await login(page);

  expect(userInfoRequests).toBe(2);
  expect(refreshRequests).toBe(1);
});

test('登录响应没有 refresh token 时 401 直接终止会话', async ({ page }) => {
  let userInfoRequests = 0;
  let refreshRequests = 0;
  await page.route('**/api/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, msg: '成功', data: { token: 'access-only-token' } })
    });
  });
  await page.route('**/api/user/info', async route => {
    userInfoRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 401, msg: '会话已失效', data: null })
    });
  });
  await page.route('**/api/refreshToken', async route => {
    refreshRequests += 1;
    await route.abort();
  });

  await page.goto('/');
  await page.getByPlaceholder('User：admin / user').fill('admin');
  await page.getByPlaceholder('Password：123456').fill('123456');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect.poll(() => userInfoRequests).toBe(1);
  await expect(page.getByPlaceholder('User：admin / user')).toBeVisible();
  expect(refreshRequests).toBe(0);
});

test('拼错 URL 显示 404', async ({ page }) => {
  await login(page);
  await page.goto(appPath('/this-route-does-not-exist'));
  await expect(page.getByText('404')).toBeVisible();
});

test('后端未授权本地路由显示 403', async ({ page }) => {
  await page.route('**/api/menu/list', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        msg: '成功',
        data: [{ path: '/home', meta: { key: 'home', title: '首页', isAffix: true } }]
      })
    });
  });
  await login(page);
  await page.goto(appPath('/list/useProTable'));
  await expect(page.getByText('403')).toBeVisible({ timeout: 15000 });
});
