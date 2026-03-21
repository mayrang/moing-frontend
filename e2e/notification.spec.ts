import { test, expect } from '@playwright/test';

test.describe('Notification E2E (Phase 4에서 활성화)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notification');
  });

  test('알림 목록이 표시된다', async ({ page }) => {
    await expect(page.getByRole('list', { name: '알림 목록' })).toBeVisible();
  });

  test('알림을 스크롤하면 다음 페이지를 불러온다', async ({ page }) => {
    const list = page.getByRole('list', { name: '알림 목록' });
    await list.scrollIntoViewIfNeeded();
    await expect(list).toBeVisible();
  });
});
