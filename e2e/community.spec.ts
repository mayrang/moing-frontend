import { test, expect } from '@playwright/test';

test.describe.skip('Community E2E (Phase 4에서 활성화)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/community');
  });

  test('커뮤니티 목록이 표시된다', async ({ page }) => {
    await expect(page.getByRole('list', { name: '커뮤니티 목록' })).toBeVisible();
  });

  test('커뮤니티 글을 작성할 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: '글쓰기' }).click();
    await page.getByPlaceholder('내용을 입력하세요').fill('테스트 게시글');
    await page.getByRole('button', { name: '등록' }).click();
    await expect(page.getByText('테스트 게시글')).toBeVisible();
  });

  test('커뮤니티 글에 좋아요를 누를 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: '좋아요' }).first().click();
    await expect(page.getByText('좋아요가 반영되었습니다')).toBeVisible();
  });

  test('커뮤니티 글을 삭제할 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: '삭제' }).first().click();
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByText('삭제되었습니다')).toBeVisible();
  });
});
