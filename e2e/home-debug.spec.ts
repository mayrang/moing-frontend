import { test, expect } from '@playwright/test';
test('home page shows content', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  const snapshot = await page.accessibility.snapshot();
  console.log('HOME PAGE CONTENT:', JSON.stringify(snapshot?.children?.slice(0, 5)));
});
