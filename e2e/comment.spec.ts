import { test, expect } from '@playwright/test';

test.describe.skip('Comment E2E (Phase 4에서 활성화)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trip/1');
  });

  test('댓글 목록이 표시된다', async ({ page }) => {
    await expect(page.getByRole('list', { name: '댓글 목록' })).toBeVisible();
  });

  test('댓글을 작성할 수 있다', async ({ page }) => {
    await page.getByPlaceholder('댓글을 입력하세요').fill('테스트 댓글');
    await page.getByRole('button', { name: '등록' }).click();
    await expect(page.getByText('테스트 댓글')).toBeVisible();
  });

  test('댓글을 삭제할 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: '댓글 삭제' }).first().click();
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByText('댓글이 삭제되었습니다')).toBeVisible();
  });
});
