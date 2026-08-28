import { expect, test, type Page } from '@playwright/test';
import { appPath, authRouteMode } from './helpers';

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

test('static 不请求菜单且本地 catalog 内放行', async ({ page }) => {
  test.skip(authRouteMode() === 'dynamic', 'dynamic 以当前账号菜单为进页权限');
  let menuRequests = 0;
  await page.route('**/api/menu/list', async route => {
    menuRequests += 1;
    await route.abort();
  });
  await login(page);
  await page.goto(appPath('/list/useProTable'));
  await expect(page.getByText('user_01')).toBeVisible({ timeout: 20000 });
  expect(menuRequests).toBe(0);
});

test('dynamic 下后端未授权的本地路由显示 403', async ({ page }) => {
  test.skip(authRouteMode() !== 'dynamic', 'static 只校验本地 catalog，不看后端菜单');
  await page.route('**/api/menu/list', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        msg: '成功',
        data: { home: '/home', routes: [{ path: '/home', handle: { title: '首页' } }] }
      })
    });
  });
  await login(page);
  await page.goto(appPath('/list/useProTable'));
  await expect(page.getByText('403')).toBeVisible({ timeout: 15000 });
});

test('内置 iframe 路由按 decodeURIComponent 渲染 http(s)', async ({ page }) => {
  await login(page);
  const encoded = encodeURIComponent('https://example.com');
  await page.goto(appPath(`/iframe/${encoded}`));
  const frame = page.locator('iframe[src="https://example.com"]');
  await expect(frame).toHaveCount(1, { timeout: 15000 });
});
