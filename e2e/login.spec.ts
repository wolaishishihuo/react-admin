import { expect, test } from '@playwright/test';

test.describe('login', () => {
  test('admin can sign in with mock credentials and reach home', async ({ page }) => {
    await page.goto('/#/login');

    await page.getByPlaceholder('User：admin / user').fill('admin');
    await page.getByPlaceholder('Password：123456').fill('123456');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL(/#\/home\/index/);
    await expect(page.getByText('欢迎登录 Hooks-Admin')).toBeVisible();
  });

  test('rejects invalid credentials and stays on login', async ({ page }) => {
    await page.goto('/#/login');

    await page.getByPlaceholder('User：admin / user').fill('admin');
    await page.getByPlaceholder('Password：123456').fill('wrong');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('用户名或密码错误')).toBeVisible();
    await expect(page).toHaveURL(/#\/login/);
  });
});
