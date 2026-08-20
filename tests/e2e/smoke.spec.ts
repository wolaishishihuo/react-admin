import { test, expect } from '@playwright/test';

test('未登录访问应用会看到登录表单', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByPlaceholder('User：admin / user')).toBeVisible();
});
