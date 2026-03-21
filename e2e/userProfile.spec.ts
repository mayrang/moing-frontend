import { test, expect } from '@playwright/test';

test.describe.skip('UserProfile E2E (Phase 4에서 활성화)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trip/1');
  });

  test('유저 프로필 정보가 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: '프로필 보기' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('유저가 만든 여행 목록이 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: '프로필 보기' }).first().click();
    await expect(page.getByText('만든 여행')).toBeVisible();
  });

  test('유저가 신청한 여행 목록이 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: '프로필 보기' }).first().click();
    await expect(page.getByText('신청한 여행')).toBeVisible();
  });
});
